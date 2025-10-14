const pad = num => String(num).padStart(2, '0');
const formatTime = seconds => {
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(mins)}:${pad(secs)}`;
}

const timeDisplay = document.getElementById('timeDiplay');
const modeHint = document.getElementById('modeHint');
const startBtn = document.getElementById('startBtn');
const modeTabs = document.getElementById('modes');
const modeButtons = document.querySelectorAll('#modes button');
const pomodoroDuration = document.getElementById('pomodoro-duration');
const shortDuration = document.getElementById('short-duration');
const longDuration = document.getElementById('long-duration');
const saveSettingsBtn = document.getElementById('saveSettings');

let durations = {
    pomodoro: Number(pomodoroDuration.value) * 60 || 30*60,
    shortbreak: Number(shortDuration.value) * 60 || 5*60,
    longbreak: Number(longDuration.value) * 60 || 15*60
}

let currentMode = 'pomodoro';
let running = false;
let timeLeft = durations[currentMode];
let timerInterval = null;

function modeText(mode) {
    switch(mode) {
        case 'pomodoro': return 'Pomodoro';
        case 'shortbreak': return 'Short Break';
        case 'longbreak': return 'Short Break';
    }
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    modeHint.textContent = modeText(currentMode);
    document.title = `${formatTime(timeLeft)} • ${modeText(currentMode)}`;
    startBtn.textContent = running ? 'Pause' : 'Start';
}

function start() {
    if (running) return;
    running = true;
    updateDisplay();
    timerInterval = setInterval(tick, 1000);
}

function stop() {
    if (!running) return;
    running = false;
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
        updateDisplay();
        return;
    }
    timeLeft--;
    updateDisplay();
}

modeTabs.forEach(btn => {
    btn.addEventListener('click', () => {
        let newmode = btn.dataset.mode;
        if (newmode === currentMode) return;
        stop();
        currentMode = newmode;
        timeLeft = durations[currentMode];
        updateDisplay();
    });
});

startBtn.addEventListener('click', () => {
    running ? stop() : start();
});

saveSettingsBtn.addEventListener('click', () => {
    durations.pomodoro = Number(pomodoroDuration.value) * 60 || 30*60;
    durations.shortbreak = Number(shortDuration.value) * 60 || 5*60;
    durations.longbreak = Number(longDuration.value) * 60 || 15*60;
    stop();
    timeLeft = durations[currentMode];
    updateDisplay();
})

// Initialize display
updateDisplay();