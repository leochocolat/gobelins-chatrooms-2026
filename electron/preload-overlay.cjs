// Bridge used by the chatroom overlay (electron/overlay.html)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
    close: () => ipcRenderer.send('overlay-close'),
    retry: () => ipcRenderer.send('overlay-retry'),
    // state: { name: 'loading' | 'loaded' | 'failed', message? }
    onState: (callback) => ipcRenderer.on('overlay-state', (_event, state) => callback(state)),
});
