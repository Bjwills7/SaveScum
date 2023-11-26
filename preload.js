const { contextBridge, ipcMain, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    startAutoSave: (source) => ipcRenderer.send('start-auto-save', source),
    stopAutoSave: () => ipcRenderer.send('stop-auto-save'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    listenForLogs: (handler) => ipcRenderer.on('log-message', (event, message) => {
        handler(message);
    })
});