// App state
let state = {
    notificationsEnabled: false,
    isExercising: false,
    showNotification: false,
    phase: 'inhale',
    cycle: 1,
    phaseTimer: 0,
    totalTimer: 0,
    nextNotificationTime: null
};

let exerciseInterval = null;
let swRegistration = null;

const appContent = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('sw.js');
            await navigator.serviceWorker.ready;

            // Listen for messages from Service Worker
            navigator.serviceWorker.addEventListener('message', onSWMessage);
        } catch (err) {
            console.log('SW registration failed:', err);
        }
    }

    loadState();

    if (state.notificationsEnabled) {
        // Ask SW for the current target time and restart its check loop
        sendToSW({ type: 'GET_TARGET_TIME' });
    }

    render();
}

// ─── SW Communication ─────────────────────────────────────────────────────────

function sendToSW(message) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
    }
}

function onSWMessage(event) {
    const { type } = event.data;

    if (type === 'TARGET_TIME_SET') {
        state.nextNotificationTime = event.data.targetTime;
        saveState();
        render();
    }

    if (type === 'SHOW_PROMPT') {
        // SW is telling us a notification was sent - show in-app prompt too
        state.showNotification = true;
        render();
    }
}

// ─── State ────────────────────────────────────────────────────────────────────

function saveState() {
    localStorage.setItem('breathingApp', JSON.stringify({
        notificationsEnabled: state.notificationsEnabled,
        nextNotificationTime: state.nextNotificationTime
    }));
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem('breathingApp') || '{}');
        state.notificationsEnabled = saved.notificationsEnabled || false;
        state.nextNotificationTime = saved.nextNotificationTime || null;
    } catch (e) {
        console.log('Error loading state:', e);
    }
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function enableNotifications() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported in this browser.');
        return;
    }

    if (!navigator.serviceWorker.controller) {
        alert('App not ready yet. Please wait a moment and try again.');
        return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();

        // Send test notification immediately
        await swRegistration.showNotification('Notifications Enabled!', {
            body: 'Your first breathing reminder is on its way.',
            tag: 'test',
            icon: 'icon-192.png'
        });

        // Tell SW to start scheduling
        sendToSW({ type: 'START_SCHEDULING' });
        render();
    } else {
        alert('Notifications were blocked. Please enable them in Chrome settings.');
    }
}

function dismissNotification() {
    state.showNotification = false;
    render();
}

// ─── Breathing Exercise ───────────────────────────────────────────────────────

function startExercise() {
    state.showNotification = false;
    state.isExercising = true;
    state.cycle = 1;
    state.phase = 'inhale';
    state.phaseTimer = 0;
    state.totalTimer = 0;
    render();

    let totalTime = 0;
    let phaseTime = 0;
    let currentPhase = 'inhale';
    let currentCycle = 1;

    exerciseInterval = setInterval(() => {
        totalTime += 0.1;
        phaseTime += 0.1;
        state.totalTimer = totalTime;
        state.phaseTimer = phaseTime;

        if (currentPhase === 'inhale' && phaseTime >= 4) {
            currentPhase = 'hold'; phaseTime = 0;
            state.phase = 'hold'; state.phaseTimer = 0;
        } else if (currentPhase === 'hold' && phaseTime >= 4) {
            currentPhase = 'exhale'; phaseTime = 0;
            state.phase = 'exhale'; state.phaseTimer = 0;
        } else if (currentPhase === 'exhale' && phaseTime >= 8) {
            if (currentCycle < 4) {
                currentCycle++;
                currentPhase = 'inhale'; phaseTime = 0;
                state.cycle = currentCycle;
                state.phase = 'inhale'; state.phaseTimer = 0;
            } else {
                clearInterval(exerciseInterval);
                state.isExercising = false;
                render();
                return;
            }
        }
        render();
    }, 100);
}

function stopExercise() {
    if (exerciseInterval) clearInterval(exerciseInterval);
    state.isExercising = false;
    render();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCircleScale() {
    if (state.phase === 'inhale') return 0.5 + (state.phaseTimer / 4) * 0.5;
    if (state.phase === 'hold') return 1;
    return 1 - (state.phaseTimer / 8) * 0.5;
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getNextReminderText() {
    if (!state.nextNotificationTime) return '';
    const mins = Math.floor((state.nextNotificationTime - Date.now()) / 60000);
    if (mins < 0) return 'Any moment now...';
    if (mins < 1) return 'Less than a minute';
    return `~${mins} minutes`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    nextReminder.textContent = (state.notificationsEnabled && state.nextNotificationTime)
        ? `Next reminder in ${getNextReminderText()}`
        : '';

    if (state.isExercising) {
        const label = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out' }[state.phase];
        const max = { inhale: 4, hold: 4, exhale: 8 }[state.phase];
        const countdown = Math.ceil(max - state.phaseTimer);
        const scale = getCircleScale();
        appContent.innerHTML = `
            <div class="breathing-circle-container">
                <div class="breathing-circle" style="transform:scale(${scale})"></div>
                <div class="breathing-text">
                    <div class="phase-label">${label}</div>
                    <div class="phase-countdown">${countdown}</div>
                </div>
            </div>
            <div class="progress-info">
                <div class="cycle-info">Cycle ${state.cycle} of 4</div>
                <div class="time-info">${formatTime(state.totalTimer)} / 1:04</div>
            </div>
            <button class="btn btn-secondary" onclick="stopExercise()">Stop Exercise</button>`;
        return;
    }

    if (state.showNotification) {
        appContent.innerHTML = `
            <div class="notification-card">
                <h2>Time for a breath?</h2>
                <p>Shall we do some autonomic nervous system regulation?</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="startExercise()">▶ Yes</button>
                    <button class="btn btn-secondary" onclick="dismissNotification()">✕ Not now</button>
                </div>
            </div>`;
        return;
    }

    if (!state.notificationsEnabled) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>Enable Reminders</h2>
            <p>Allow notifications to receive mindful breathing reminders throughout your day (7:00 AM - 9:30 PM)</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>`;
        return;
    }

    appContent.innerHTML = `
        <div class="idle-icon">🔔</div>
        <h2>All Set!</h2>
        <p>You'll receive reminders to practice mindful breathing throughout your waking hours.</p>
        <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>`;
}

// Update countdown every 30 seconds
setInterval(() => { if (!state.isExercising) render(); }, 30000);

// Go!
init();
