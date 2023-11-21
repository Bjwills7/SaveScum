const { app, BrowserWindow } = require('electron');
const path = require("path");
const fs = require('fs');

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

    win.loadFile('frontEnd/index.html');
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();
    
    // Run copyFile for testing purposes
    // copyFile(String.raw`c:/Users\Brandon\Desktop/ElectronTests/SourceFolder/DogWater.txt`, String.raw`c:/Users/Brandon/Desktop\ElectronTests/DestinationFolder\DogWater.txt`);
    startAutoSave(String.raw`c:\Users\Brandon\AppData\Roaming\Exanima\Exanima001.rsg`);

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
                    console.log('file is being created by game.');
                } else {
                    console.error('copyFile error:', err);
                }
            } else {
                console.log('File copied');
            }
        })
    } else {
        console.log("You died, press continue in the main menu (file doesn't exist)");
    }
}

const startAutoSave = (source) => {
    if (!watcher) {
        // Start watching save file
        try {
            watcher = fs.watch(source, (eventType, filename) => {
                if (eventType === 'rename') {
                    console.log('You died, press continue in main menu (file deleted)');
                } else {
                    console.log(`eventType: ${eventType}`);
                    console.log(`filename: ${filename}`);
                    copyFile(source, source.replace('.rsg', '.rcp'));
                }
            });
            console.log('watcher started');
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`File ${source} does not exist yet, retrying in 10 seconds...`);
                setTimeout(() => startAutoSave(source), 10000);
            } else {
                console.log(`Error starting watcher: ${err.message}`);
            }
        }
    }
}
