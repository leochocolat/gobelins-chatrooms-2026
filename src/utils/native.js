// Name of the WKScriptMessageHandler registered by the native app
const HANDLER_NAME = 'openChatroom';

function getHandler() {
    return window.webkit?.messageHandlers?.[HANDLER_NAME];
}

export function isNativeApp() {
    return Boolean(getHandler());
}

// Ask the native app to open a chatroom. Returns false when not running inside the app.
// When `remember` is true, the app opens this chatroom directly on next launch.
export function openChatroom(chatroom, { remember = false } = {}) {
    const handler = getHandler();
    if (!handler) return false;

    handler.postMessage({
        id: chatroom.id,
        name: chatroom.name,
        url: chatroom.url,
        remember,
    });

    return true;
}
