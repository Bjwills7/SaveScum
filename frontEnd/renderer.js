const startButton = document.querySelector('.start-button');
const stopButton = document.querySelector('.stop-button');
const openFileBtn = document.querySelector(".open-file");
const instructions = document.querySelector("#instructions");
const consoleDisplay = document.querySelector('.console-display');

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
    if (consoleDisplay.textContent.endsWith(message)) return;
    console.log(message);
    const lineBreak = document.createElement('br');
    const newMessageNode = document.createTextNode(message);
    consoleDisplay.append(lineBreak, newMessageNode);
})