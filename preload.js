const {
    ipcRenderer
} = require('electron');
const version = document.getElementById('version');
const warp = document.getElementById('warp');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
document.getElementById("move").style.webkitAppRegion = 'drag'

document.getElementById('start').addEventListener('click', () => {
    const a = document.getElementById('headless');
    const headless = a.checked ? false : 'new';
    const proxy = document.getElementById("proxy").value
    document.getElementById("prog").style.width = 0 + '%'
    ipcRenderer.send('start', headless, proxy);
});

document.getElementById('stop').addEventListener('click', () => {
    if (confirm("Realy want to stop the proccess ?") == true) {
        ipcRenderer.send('stop');
    }
});

ipcRenderer.on("mulai", () => {
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
})

ipcRenderer.on("mari", () => {
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
})

ipcRenderer.on('log', (event, logs) => {
    const logTextarea = document.getElementById('log');
    logTextarea.value = logs;
    logTextarea.scrollTop = logTextarea.scrollHeight;
});

let updateProgress = 0;

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    version.innerText = 'Version ' + arg.version;
});

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    warp.classList.remove('hidden');
    document.getElementById('download-progress').classList.remove('hidden');
});

ipcRenderer.on('update_progress', (event, progress) => {
    updateProgress = progress;
    document.getElementById('download-progress').value = updateProgress;
});

ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    warp.classList.remove('hidden');

    document.getElementById('download-progress').classList.add('hidden');
});

restartButton.addEventListener("click", (e) => {
    ipcRenderer.send('restart_app');
})

function proggress(prog) {
    document.getElementById("prog").style.width = prog + '%'
    document.getElementById("prog").innerHTML = prog + '%'
}

ipcRenderer.on('proggress', (event, prog) => {
    for (const pros of prog) {
        proggress(pros);
    }
});