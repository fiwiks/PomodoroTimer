const pad = num => String(num).padStart(2, '0');
const formatTime = seconds => {
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(mins)}:${pad(secs)}`;
}

const timeDisplay = document.getElementById('timeDisplay');
const modeHint = document.getElementById('modeHint');
const startBtn = document.getElementById('StartPauseButton');
const modeButtons = document.querySelectorAll('#modes button');
const pomodoroDuration = document.getElementById('pomodoro-duration');
const shortDuration = document.getElementById('short-duration');
const longDuration = document.getElementById('long-duration');
const saveSettingsBtn = document.getElementById('SaveSettings');
const dialogBox = document.getElementById('taskPrompt');
const summaryText = document.getElementById('summaryText');
const currentTask = document.getElementById('task-input');
const buttonFinished = document.getElementById('buttonFinished');
const buttonExtend = document.getElementById('buttonExtend');
const buttonBreak = document.getElementById('buttonBreak');

const storage = {
    durations: localStorage.getItem('durations') ? localStorage.getItem('durations').split(',').map(x => Number(x)) : [30*60, 5*60, 15*60],
    lastMode: localStorage.getItem('lastMode'),
    task: localStorage.getItem('task'),
    storedTime: localStorage.getItem('timeLeft'),
    lastRunning: localStorage.getItem('running')
}

let durations = {
    pomodoro: storage.durations[0],
    shortbreak: storage.durations[1],
    longbreak: storage.durations[2]
}
console.log(durations);

pomodoroDuration.value = durations.pomodoro / 60;
shortDuration.value = durations.shortbreak / 60;
longDuration.value = durations.longbreak / 60;

let currentMode = storage.lastMode && ['pomodoro', 'shortbreak', 'longbreak'].includes(storage.lastMode) ? storage.lastMode : 'pomodoro';
let running = false;
let timeLeft = Number(storage.storedTime) || durations[currentMode];
let timerInterval = null;
let notis = false;

function modeText(mode) {
    switch(mode) {
        case 'pomodoro': return 'Pomodoro';
        case 'shortbreak': return 'Short Break';
        case 'longbreak': return 'Long Break';
    }
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    modeHint.textContent = modeText(currentMode);
    document.title = `${formatTime(timeLeft)} • ${modeText(currentMode)}`;
    startBtn.textContent = running ? 'Pause' : 'Start';
}

let asked = false;
async function requestNotificationPermission() {
    if (notis) return true;
    if (!("Notification" in window)) { return false; }
    if (Notification.permission === "granted") { return true; }
    if (Notification.permission === "denied") { return false; }
    if (asked) return (Notification.permission === "granted");
    asked = true;

    const res = await Notification.requestPermission();
    return (res === "granted");
}

function start() {
    if (running || timeLeft <= 0) return;
    running = true;
    localStorage.setItem('running', running);
    localStorage.setItem('lastMode', currentMode);
    updateDisplay();
    timerInterval = setInterval(tick, 1000);
}

function stop() {
    if (!running) return;
    running = false;
    localStorage.setItem('running', running);
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    updateDisplay();
}

function tick() {
    if (timeLeft <= 1) {
        stop();
        timeLeft = 0;
        localStorage.setItem('timeLeft', timeLeft);
        updateDisplay();

        if (currentMode === 'pomodoro') {
            summaryText.textContent = currentTask.value || "No task entered";
            dialogBox.showModal();
            if (notis) {
                new Notification("Pomodoro finished!", { body: `Task: ${summaryText.textContent}` });
            }
        }
        else {
            if (notis) {
                new Notification("Break over!", { body: "Time to get back to work!" });
            }

        }
        return;
    }
    timeLeft--;
    localStorage.setItem('timeLeft', timeLeft);
    updateDisplay();
}

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        let newmode = btn.dataset.mode;
        stop();
        currentMode = newmode;
        localStorage.setItem('lastMode', currentMode);
        timeLeft = durations[currentMode];
        localStorage.setItem('timeLeft', timeLeft);
        updateDisplay();
    });
});

startBtn.addEventListener('click', async () => {
    running ? stop() : start();
    notis = await requestNotificationPermission();
});

saveSettingsBtn.addEventListener('click', () => {
    durations.pomodoro = Number(pomodoroDuration.value) * 60 || 30*60;
    durations.shortbreak = Number(shortDuration.value) * 60 || 5*60;
    durations.longbreak = Number(longDuration.value) * 60 || 15*60;

    console.log(durations);

    localStorage.setItem('durations', durations.pomodoro + ',' + durations.shortbreak + ',' + durations.longbreak);

    stop();
    timeLeft = durations[currentMode];
    localStorage.setItem('timeLeft', timeLeft);
    updateDisplay();
})

buttonFinished.addEventListener('click', () => {
    currentTask.value = '';
    localStorage.setItem('task', '');
    currentMode = 'shortbreak';
    localStorage.setItem('lastMode', currentMode);
    timeLeft = durations[currentMode];
    localStorage.setItem('timeLeft', timeLeft);
    updateDisplay();
    dialogBox.close();
    start();
})

buttonExtend.addEventListener('click', () => {
    currentMode = 'pomodoro';
    localStorage.setItem('lastMode', currentMode);
    timeLeft = 5*60;
    localStorage.setItem('timeLeft', timeLeft);
    updateDisplay();
    dialogBox.close();
    start();
})

buttonBreak.addEventListener('click', () => {
    currentMode = 'shortbreak';
    localStorage.setItem('lastMode', currentMode);
    timeLeft = durations[currentMode];
    localStorage.setItem('timeLeft', timeLeft);
    updateDisplay();
    dialogBox.close();
    start();
})

currentTask.addEventListener('input', () => {
    localStorage.setItem('task', currentTask.value);
});

currentTask.value = storage.task || '';

// Initialize display
updateDisplay();
if (storage.lastRunning === 'true') {
    start();
}