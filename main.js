const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require("path");
const fs = require('fs');

let win; // expose main window to global scope

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Enable Node.js integration
            contextIsolation: true,
            devTools: true, // Enable DevTools
            preload: path.join(__dirname, 'preload.js'), // Attach preload script to renderer process
        }
    });

    win.loadFile('frontEnd/index.html');
    win.webContents.openDevTools();
};


app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen);
    createWindow();
    
    app.on("activate", () => { // Creates new window when app is activated and no windows currently exist. MacOS specific
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => { // Listener that triggers when app window is closed
    if(process.platform !== "darwin") app.quit(); // If user is not on macOS quits app
});

// Used to watch the target file for changes
let watcher

const copyFile = (source, destination) => {
    // Copy the file if it exists
    if (fs.existsSync(source)) {
        fs.copyFile(source, destination, (err) => {
            if (err) {
                if (err.code === 'EBUSY') {
                    logToRenderer('file is being modified by game.');
                } else {
                    console.error('copyFile error:', err);
                    logToRenderer(`copyFile error: ${err}`);
                }
            } else {
                logToRenderer('auto-save completed');
            }
        })
    } else {
        logToRenderer("You died, press continue in the main menu (file doesn't exist)");
    }
}

const startAutoSave = (source) => {
    if (source && !endsWithRSG(source)) {
        logToRenderer(`Incorrect file type, please select a save file that ends with .rsg`);
        return;
    }
    if(watcher) {
        stopAutoSave();
    }
    try {
        watcher = fs.watch(source, (eventType, filename) => {
            if (eventType === 'rename') {
                logToRenderer('You died, press continue in main menu');
            } else {
                copyFile(source, source.replace('.rsg', '.rcp'));
            }
        });
        logToRenderer('auto-save started');
    } catch (err) {
        if (err.code === 'ENOENT') {
            logToRenderer(`File ${source} does not exist yet, retrying in 10 seconds...`);
            setTimeout(() => startAutoSave(source), 10000);
        } else if (err.message === 'The "filename" argument must be of type string or an instance of Buffer or URL. Received undefined') {
            logToRenderer(`Error starting auto-save: No save file selected`);
        } else {
            logToRenderer(`Error starting auto-save: ${err.message}`);
        }
    }
}

const stopAutoSave = () => {
    if (watcher) {
        watcher.close();
        watcher = null; // Indicates that the watcher is inactive
        logToRenderer('auto-save stopped');
    } else {
        logToRenderer("auto-save can't be stopped because it's not running");
    }
}

async function handleFileOpen () {
    const { canceled, filePaths } = await dialog.showOpenDialog();
    if (!canceled) {
      return filePaths[0]
    }
}

const logToRenderer = (message) => { // Logs to main proccess console and sends message to renderer
    console.log(message);
    if (win) {
        win.webContents.send('log-message', message);
    }
}

const endsWithRSG = (source) => {
    if (source.toLowerCase().endsWith('.rsg')) {
        return true;
    } else {
        return false;
    }
}

ipcMain.on('start-auto-save', (event, source) => {
    startAutoSave(source);
});
ipcMain.on('stop-auto-save', stopAutoSave);