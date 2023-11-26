const { contextBridge, ipcMain, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    startAutoSave: (source) => ipcRenderer.send('start-auto-save', source),
    openFile: () => ipcRenderer.invoke('dialog:openFile')
});