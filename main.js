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

    win.loadFile('index.html');
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();
    
    // Run copyFile for testing purposes
    copyFile(String.raw`c:/Users\Brandon\Desktop/ElectronTests/SourceFolder/DogWater.txt`, String.raw`c:/Users/Brandon/Desktop\ElectronTests/DestinationFolder`);

    app.on("activate", () => { // Creates new window when app is activated and no windows currently exist. MacOS specific
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => { // Listener that triggers when app window is closed
    if(process.platform !== "darwin") app.quit(); // If user is not on macOS quits app
});


const copyFile = (source, destination) => {
    // Replace backslashes with forward slashes
    const sourcePath = source;
    const destinationPath = destination;
    console.log(`source: ${sourcePath} destination: ${destinationPath}`);

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    // Get the file name from source path
    const fileName = path.basename(sourcePath);

    // Create destination path using filename
    const destinationFile = path.join(destinationPath, fileName);

    // Copy the file
    fs.copyFile(sourcePath, destinationFile, (err) => {
        if (err) {
            console.error('copyFile error:', err);
        } else {
            console.log('File copied');
        }
    })
}

