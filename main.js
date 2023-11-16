const { app, BrowserWindow } = require('electron');
const path = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Enable Node.js integration
            devTools: true, // Enable DevTools
            preload: path.join(__dirname, 'preload.js'), // Attach preload script to renderer process
        }
    });

    win.loadFile('index.html');
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => { // Creates new window when app is activated and no windows currently exist. MacOS specific
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => { // Listener that triggers when app window is closed
    if(process.platform !== "darwin") app.quit(); // If user is not on macOS quits app
});