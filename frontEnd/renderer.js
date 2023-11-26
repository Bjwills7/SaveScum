const startButton = document.querySelector('.start-button');
const stopButton = document.querySelector('.stop-button');
const openFileBtn = document.querySelector(".open-file");
const filePathDialog = document.querySelector("#file-path-dialog");

let activeFilePath;

// Starts watching for file changes at activeFilePath
startButton.addEventListener('click', () => {
    window.electronAPI.startAutoSave(activeFilePath);
});

// Stops watching for changes at activeFilePath
stopButton.addEventListener('click', () => {
    window.electronAPI.stopAutoSave();
})

// Opens file selection dialog and sets activeFilePath to selected path
openFileBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile();
    activeFilePath = filePath;
})

// Recieves messages from main process and handles them accordingly
window.electronAPI.listenForLogs((message) => {
    console.log(message);
})