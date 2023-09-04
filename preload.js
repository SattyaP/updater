const {
    ipcRenderer
} = require('electron');

document.getElementById('start').addEventListener('click', () => {
    const a = document.getElementById('headless');
    const headless = a.checked ? false : 'new';

    ipcRenderer.send('start', headless);

    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
});

document.getElementById('stop').addEventListener('click', () => {
    if (confirm("Realy want to stop the proccess ?") == true) {
        ipcRenderer.send('stop');
        document.getElementById('start').disabled = false;
        document.getElementById('stop').disabled = true;
    }
});

ipcRenderer.on('log', (event, logs) => {
    const logTextarea = document.getElementById('log');
    logTextarea.value = logs;
    logTextarea.scrollTop = logTextarea.scrollHeight;
});