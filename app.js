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
let notificationCheckInterval = null;
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
        } catch (err) {
            console.log('SW registration failed:', err);
        }
    }

    loadState();

    if (state.notificationsEnabled && state.nextNotificationTime) {
        startNotificationChecks();
    }

    render();
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

// ─── Waking Hours ─────────────────────────────────────────────────────────────

function isWakingHours() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 420 && mins <= 1290; // 07:00 - 21:30
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function sendNotification(title, body, tag) {
    if (!swRegistration) return false;
    try {
        await swRegistration.showNotification(title, {
            body,
            tag,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });
        return true;
    } catch (e) {
        console.error('Notification error:', e);
        return false;
    }
}

async function enableNotifications() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported in this browser.');
        return;
    }
    if (!swRegistration) {
        alert('App not ready yet. Please wait a moment and try again.');
        return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();

        await sendNotification(
            'Notifications Enabled! (TEST MODE)',
            'You will get a reminder every 1-3 minutes.',
            'test'
        );

        scheduleNextNotification();
        render();
    } else {
        alert('Notifications were blocked. Please enable them in Chrome settings.');
    }
}

function disableNotifications() {
    state.notificationsEnabled = false;
    state.nextNotificationTime = null;
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
        notificationCheckInterval = null;
    }
    saveState();
    render();
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

// *** TEST: Check every 30 seconds ***
function startNotificationChecks() {
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    checkIfTimeToNotify();
    notificationCheckInterval = setInterval(checkIfTimeToNotify, 30 * 1000); // 30 seconds
}

async function checkIfTimeToNotify() {
    if (!state.nextNotificationTime) return;
    const now = Date.now();

    if (now >= state.nextNotificationTime) {
        state.nextNotificationTime = null;
        saveState();

        if (isWakingHours()) {
            state.showNotification = true;
            await sendNotification(
                'Mindful Breathing (TEST)',
                'Shall we do some autonomic nervous system regulation?',
                'breathing-reminder'
            );
            render();
        }

        scheduleNextNotification();
    }
}

// *** TEST: 1-3 minutes instead of 70-130 ***
function scheduleNextNotification() {
    const mins = Math.floor(Math.random() * 3) + 1; // 1-3 minutes
    state.nextNotificationTime = Date.now() + mins * 60 * 1000;
    saveState();
    startNotificationChecks();
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

    let totalTime = 0, phaseTime = 0;
    let currentPhase = 'inhale', currentCycle = 1;

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
                scheduleNextNotification();
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

function dismissNotification() {
    state.showNotification = false;
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
    const secs = Math.floor((state.nextNotificationTime - Date.now()) / 1000);
    if (secs < 0) return 'Any moment now...';
    if (secs < 60) return `${secs} seconds`;
    return `~${Math.floor(secs / 60)} minutes`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    nextReminder.textContent = (state.notificationsEnabled && state.nextNotificationTime)
        ? `TEST: Next reminder in ${getNextReminderText()}`
        : '';

    if (state.isExercising) {
        const labels = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out' };
        const maxTimes = { inhale: 4, hold: 4, exhale: 8 };
        const countdown = Math.ceil(maxTimes[state.phase] - state.phaseTimer);
        appContent.innerHTML = `
            <div class="breathing-circle-container">
                <div class="breathing-circle" style="transform:scale(${getCircleScale()})"></div>
                <div class="breathing-text">
                    <div class="phase-label">${labels[state.phase]}</div>
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
            <h2>Enable Reminders (TEST MODE)</h2>
            <p>Notifications will fire every 1-3 minutes for testing purposes.</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>`;
        return;
    }

    appContent.innerHTML = `
        <div class="idle-icon">🔔</div>
        <h2>Test Mode Active</h2>
        <p>Reminders every 1-3 minutes. Test all scenarios then we'll switch to production timing.</p>
        <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>
        <button class="btn btn-secondary" style="margin-top:12px" onclick="disableNotifications()">Turn Off Reminders</button>`;
}

// Update countdown every 5 seconds (more frequent for testing)
setInterval(() => { if (!state.isExercising) render(); }, 5000);

// Go!
init();
