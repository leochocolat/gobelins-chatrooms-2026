// Bridge used by the hub (src/utils/native.js) to ask the app to open a chatroom
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openChatroom: (body) => ipcRenderer.send('open-chatroom', body),
});
