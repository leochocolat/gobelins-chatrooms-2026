// Electron app: shows the hub (bundled dist/, or the Vite dev server) and opens chatrooms over it,
// like the Xcode app: loading screen, discreet close button, Escape to go back, remembered chatroom.

import { app, BrowserWindow, WebContentsView, ipcMain, shell } from 'electron';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ELECTRON_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');
// Area kept by the overlay once the chatroom has loaded: only the close button in the top-left corner
const CLOSE_BUTTON_AREA = { x: 0, y: 0, width: 64, height: 64 };

let mainWindow = null;
// Open chatroom: { chatroom, view, overlay, state }
let current = null;

// Chatroom sent by the hub: { id, name, url } with an http(s) url
function parseChatroom(body) {
    if (!body || typeof body.id !== 'string' || typeof body.url !== 'string') return null;

    try {
        const url = new URL(body.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    } catch {
        return null;
    }

    return { id: body.id, name: typeof body.name === 'string' ? body.name : body.id, url: body.url };
}

function openExternal(url) {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
}

// Chatroom to open directly at launch, chosen with "Don't show this next time" on the hub
function readSettings() {
    try {
        return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
        return {};
    }
}

function getSavedChatroom() {
    return parseChatroom(readSettings().savedChatroom);
}

function setSavedChatroom(chatroom) {
    const settings = readSettings();
    if (chatroom) settings.savedChatroom = chatroom;
    else delete settings.savedChatroom;
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

function layout() {
    if (!current) return;

    const { width, height } = mainWindow.getContentBounds();
    const fullArea = { x: 0, y: 0, width, height };

    current.view.setBounds(fullArea);
    current.overlay.setBounds(current.state.name === 'loaded' ? CLOSE_BUTTON_AREA : fullArea);
}

function setState(state) {
    current.state = state;
    current.overlay.webContents.send('overlay-state', state);
    layout();
}

function closeOnEscape(webContents) {
    webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'Escape') {
            event.preventDefault();
            closeChatroom();
        }
    });
}

function openChatroom(chatroom) {
    if (current) closeChatroom({ forget: false });

    const view = new WebContentsView({ webPreferences: { sandbox: true, contextIsolation: true } });
    view.setBackgroundColor('#000000');

    const overlay = new WebContentsView({
        webPreferences: {
            preload: path.join(ELECTRON_DIR, 'preload-overlay.cjs'),
            sandbox: true,
            contextIsolation: true,
        },
    });
    overlay.setBackgroundColor('#00000000');

    mainWindow.contentView.addChildView(view);
    mainWindow.contentView.addChildView(overlay);
    current = { chatroom, view, overlay, state: { name: 'loading' } };
    layout();

    const isCurrent = () => current?.view === view;

    // Links opening a new window go to the default browser
    view.webContents.setWindowOpenHandler(({ url }) => {
        openExternal(url);
        return { action: 'deny' };
    });

    // Only the first load of the page is reported, later navigations inside the chatroom are ignored.
    // Also fires for Chromium's error page after a failure, which must not hide the error screen.
    view.webContents.on('did-finish-load', () => {
        if (isCurrent() && current.state.name === 'loading') setState({ name: 'loaded' });
    });

    view.webContents.on('did-fail-load', (_event, errorCode, errorDescription, _url, isMainFrame) => {
        // -3 is an aborted load (e.g. replaced by a redirect), not a real failure
        if (!isMainFrame || errorCode === -3 || !isCurrent() || current.state.name === 'loaded') return;
        setState({ name: 'failed', message: errorDescription || `Error ${errorCode}` });
    });

    // The overlay may finish loading after the chatroom state changed
    overlay.webContents.on('did-finish-load', () => {
        if (isCurrent()) overlay.webContents.send('overlay-state', current.state);
    });

    closeOnEscape(view.webContents);
    closeOnEscape(overlay.webContents);

    overlay.webContents.loadFile(path.join(ELECTRON_DIR, 'overlay.html'), { query: { name: chatroom.name } });
    view.webContents.loadURL(chatroom.url);
}

// Going back to the hub forgets the saved choice, so the hub shows again next time
function closeChatroom({ forget = true } = {}) {
    if (!current) return;

    const { view, overlay } = current;
    current = null;

    mainWindow.contentView.removeChildView(overlay);
    mainWindow.contentView.removeChildView(view);
    overlay.webContents.close();
    view.webContents.close();

    if (forget) setSavedChatroom(null);
    mainWindow.webContents.focus();
}

ipcMain.on('open-chatroom', (event, body) => {
    if (event.sender !== mainWindow?.webContents) return;

    const chatroom = parseChatroom(body);
    if (!chatroom) return;

    setSavedChatroom(body.remember === true ? chatroom : null);
    openChatroom(chatroom);
});

ipcMain.on('overlay-close', (event) => {
    if (event.sender === current?.overlay.webContents) closeChatroom();
});

ipcMain.on('overlay-retry', (event) => {
    if (event.sender !== current?.overlay.webContents) return;

    setState({ name: 'loading' });
    current.view.webContents.loadURL(current.chatroom.url);
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Gobelins Chatrooms 2026',
        backgroundColor: '#000000',
        show: false,
        webPreferences: {
            preload: path.join(ELECTRON_DIR, 'preload-hub.cjs'),
            sandbox: true,
            contextIsolation: true,
        },
    });

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('resize', layout);
    mainWindow.on('closed', () => {
        mainWindow = null;
        current = null;
    });

    // The hub never navigates away: external links go to the default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        openExternal(url);
        return { action: 'deny' };
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url === mainWindow.webContents.getURL()) return;
        event.preventDefault();
        openExternal(url);
    });

    if (DEV_SERVER_URL) mainWindow.loadURL(DEV_SERVER_URL);
    else mainWindow.loadFile(path.join(ELECTRON_DIR, '../dist/index.html'));

    const savedChatroom = getSavedChatroom();
    if (savedChatroom) openChatroom(savedChatroom);
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (!mainWindow) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    });

    app.whenReady().then(createWindow);

    // Single window launcher: closing it quits the app, on macOS too
    app.on('window-all-closed', () => app.quit());
}
