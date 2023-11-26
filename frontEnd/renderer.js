const startButton = document.querySelector('.start-button');
const filePath = document.querySelector('.file-path');


startButton.addEventListener('click', () => {
    window.electronAPI.startAutoSave(filePath.value);
});