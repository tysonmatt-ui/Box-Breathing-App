// ─── App State ────────────────────────────────────────────────────────────────

let state = {
    notificationsEnabled: false,
    isExercising: false,
    showNotification: false,
    phase: 'inhale',
    cycle: 1,
    phaseTimer: 0,
    totalTimer: 0,
    nextNotificationTime: null,
    screen: 'main', // main | settings | about
    settings: {
        startHour: 7,
        startMin: 0,
        endHour: 21,
        endMin: 30,
        freqMin: 70,
        freqMax: 130
    }
};

// Frequency preset ranges [min, max, label]
const FREQ_PRESETS = [
    [30,  60,  'Every ~45 mins'],
    [60,  90,  'Every ~75 mins'],
    [70,  130, 'Every ~90 mins'],
    [90,  150, 'Every ~2 hours'],
    [120, 180, 'Every ~2.5 hours'],
    [150, 210, 'Every ~3 hours']
];

let exerciseInterval = null;
let notificationCheckInterval = null;
let swRegistration = null;

const appContent  = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('sw.js');
            await navigator.serviceWorker.ready;
        } catch (e) {
            console.log('SW failed:', e);
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
        nextNotificationTime: state.nextNotificationTime,
        settings: state.settings
    }));
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem('breathingApp') || '{}');
        state.notificationsEnabled = saved.notificationsEnabled || false;
        state.nextNotificationTime = saved.nextNotificationTime || null;
        if (saved.settings) state.settings = { ...state.settings, ...saved.settings };
    } catch (e) {
        console.log('Error loading state:', e);
    }
}

// ─── Waking Hours ─────────────────────────────────────────────────────────────

function isWakingHours() {
    const now  = new Date();
    const curr = now.getHours() * 60 + now.getMinutes();
    const start = state.settings.startHour * 60 + state.settings.startMin;
    const end   = state.settings.endHour   * 60 + state.settings.endMin;
    return curr >= start && curr <= end;
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function sendNotification(title, body, tag) {
    if (!swRegistration) return false;
    try {
        await swRegistration.showNotification(title, {
            body, tag,
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
    if (!('Notification' in window)) { alert('Notifications not supported.'); return; }
    if (!swRegistration) { alert('App not ready. Please wait and try again.'); return; }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();
        await sendNotification('Notifications Enabled!', 'Your first breathing reminder is on its way.', 'test');
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

function startNotificationChecks() {
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    checkIfTimeToNotify();
    notificationCheckInterval = setInterval(checkIfTimeToNotify, 2 * 60 * 1000);
}

async function checkIfTimeToNotify() {
    if (!state.nextNotificationTime) return;
    if (Date.now() >= state.nextNotificationTime) {
        state.nextNotificationTime = null;
        saveState();
        if (isWakingHours()) {
            state.showNotification = true;
            await sendNotification(
                'Mindful Breathing',
                'Shall we do some autonomic nervous system regulation?',
                'breathing-reminder'
            );
            render();
        }
        scheduleNextNotification();
    }
}

function scheduleNextNotification() {
    const { freqMin, freqMax } = state.settings;
    const mins = Math.floor(Math.random() * (freqMax - freqMin + 1)) + freqMin;
    state.nextNotificationTime = Date.now() + mins * 60 * 1000;
    saveState();
    startNotificationChecks();
    render();
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function saveSettings() {
    const startHour = parseInt(document.getElementById('startHour').value);
    const startMin  = parseInt(document.getElementById('startMin').value);
    const endHour   = parseInt(document.getElementById('endHour').value);
    const endMin    = parseInt(document.getElementById('endMin').value);
    const freqIdx   = parseInt(document.getElementById('freqSlider').value);
    const preset    = FREQ_PRESETS[freqIdx];

    const startTotal = startHour * 60 + startMin;
    const endTotal   = endHour   * 60 + endMin;
    if (endTotal <= startTotal) {
        alert('End time must be after start time.');
        return;
    }

    state.settings = {
        startHour, startMin,
        endHour, endMin,
        freqMin: preset[0],
        freqMax: preset[1]
    };
    saveState();

    if (state.notificationsEnabled) {
        scheduleNextNotification();
    }

    state.screen = 'main';
    render();
}

function getCurrentFreqIndex() {
    const { freqMin, freqMax } = state.settings;
    const idx = FREQ_PRESETS.findIndex(p => p[0] === freqMin && p[1] === freqMax);
    return idx >= 0 ? idx : 2;
}

function padTime(n) { return n.toString().padStart(2, '0'); }

function onFreqSliderChange(val) {
    const preset = FREQ_PRESETS[parseInt(val)];
    document.getElementById('freqLabel').textContent = preset[2];
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
        totalTime  += 0.1;
        phaseTime  += 0.1;
        state.totalTimer = totalTime;
        state.phaseTimer = phaseTime;

        if (currentPhase === 'inhale' && phaseTime >= 4) {
            currentPhase = 'hold';    phaseTime = 0;
            state.phase = 'hold';     state.phaseTimer = 0;
        } else if (currentPhase === 'hold' && phaseTime >= 4) {
            currentPhase = 'exhale';  phaseTime = 0;
            state.phase = 'exhale';   state.phaseTimer = 0;
        } else if (currentPhase === 'exhale' && phaseTime >= 8) {
            if (currentCycle < 4) {
                currentCycle++;
                currentPhase = 'inhale'; phaseTime = 0;
                state.cycle = currentCycle;
                state.phase = 'inhale';  state.phaseTimer = 0;
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
    if (state.phase === 'hold')   return 1;
    return 1 - (state.phaseTimer / 8) * 0.5;
}

function formatTime(secs) {
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
}

function getNextReminderText() {
    if (!state.nextNotificationTime) return '';
    const secs = Math.floor((state.nextNotificationTime - Date.now()) / 1000);
    if (secs < 0)  return 'Any moment now...';
    if (secs < 60) return `${secs} seconds`;
    return `~${Math.floor(secs / 60)} minutes`;
}

function fmtHour(h, m) {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${padTime(m)} ${period}`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    nextReminder.textContent = (state.notificationsEnabled && state.nextNotificationTime)
        ? `Next reminder in ${getNextReminderText()}` : '';

    const gearBtn = document.getElementById('gearBtn');
    if (gearBtn) {
        gearBtn.style.display = state.isExercising ? 'none' : 'block';
    }

    if (state.screen === 'settings') { renderSettings(); return; }
    if (state.screen === 'about')    { renderAbout();    return; }
    renderMain();
}

function renderMain() {
    if (state.isExercising) {
        const labels   = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out' };
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
            <h2>Enable Reminders</h2>
            <p>Allow notifications to receive mindful breathing reminders during your active hours.</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>`;
        return;
    }

    const { startHour, startMin, endHour, endMin } = state.settings;
    const freqIdx = getCurrentFreqIndex();
    appContent.innerHTML = `
        <div class="idle-icon">🔔</div>
        <h2>All Set!</h2>
        <p>Reminders active between ${fmtHour(startHour, startMin)} and ${fmtHour(endHour, endMin)}.</p>
        <p style="font-size:13px;color:#ca8a04;margin-top:-12px">${FREQ_PRESETS[freqIdx][2]}</p>
        <button class="btn btn-primary" onclick="startExercise()" style="margin-top:8px">▶ Start Practice Now</button>
        <button class="btn btn-secondary" style="margin-top:12px" onclick="disableNotifications()">Turn Off Reminders</button>`;
}

function renderSettings() {
    const s = state.settings;
    const freqIdx = getCurrentFreqIndex();

    const hourOpts = (sel) => Array.from({length: 24}, (_, i) =>
        `<option value="${i}" ${i === sel ? 'selected' : ''}>${padTime(i)}</option>`).join('');
    const minOpts = (sel) => [0, 15, 30, 45].map(m =>
        `<option value="${m}" ${m === sel ? 'selected' : ''}>${padTime(m)}</option>`).join('');

    appContent.innerHTML = `
        <div style="width:100%;max-width:500px">
            <h2 style="color:#ca8a04;margin-bottom:24px">Settings</h2>

            <div class="settings-group">
                <label class="settings-label">Active Hours Start</label>
                <div class="time-selects">
                    <select id="startHour" class="time-select">${hourOpts(s.startHour)}</select>
                    <span style="color:#ca8a04;font-size:20px">:</span>
                    <select id="startMin" class="time-select">${minOpts(s.startMin)}</select>
                </div>
            </div>

            <div class="settings-group">
                <label class="settings-label">Active Hours End</label>
                <div class="time-selects">
                    <select id="endHour" class="time-select">${hourOpts(s.endHour)}</select>
                    <span style="color:#ca8a04;font-size:20px">:</span>
                    <select id="endMin" class="time-select">${minOpts(s.endMin)}</select>
                </div>
            </div>

            <div class="settings-group">
                <label class="settings-label">Reminder Frequency</label>
                <input
                    type="range"
                    id="freqSlider"
                    min="0"
                    max="${FREQ_PRESETS.length - 1}"
                    value="${freqIdx}"
                    oninput="onFreqSliderChange(this.value)"
                    class="freq-slider"
                >
                <div class="freq-labels">
                    <span>More often</span>
                    <span>Less often</span>
                </div>
                <div id="freqLabel" class="freq-value">${FREQ_PRESETS[freqIdx][2]}</div>
            </div>

            <div class="button-group" style="margin-top:32px">
                <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                <button class="btn btn-secondary" onclick="state.screen='main';render()">Cancel</button>
            </div>
        </div>`;
}

function renderAbout() {
    appContent.innerHTML = `
        <div style="width:100%;max-width:500px;text-align:left">
            <h2 style="color:#ca8a04;margin-bottom:4px">Mindful Breathing</h2>
            <p style="color:#6b7280;font-size:13px;margin-bottom:24px">Version 1.1 &nbsp;·&nbsp; EvolveChain Apps</p>

            <h3 style="color:#ca8a04;margin-bottom:8px">About</h3>
            <p>Mindful Breathing helps you regulate your autonomic nervous system through guided box breathing exercises. The app sends gentle reminders throughout your day, prompting you to pause and breathe.</p>
            <p style="margin-top:8px">Each session guides you through four cycles of controlled breathing: inhale for 4 seconds, hold for 4 seconds, then exhale for 8 seconds — a total of just over one minute.</p>

            <h3 style="color:#ca8a04;margin-top:24px;margin-bottom:8px">How to Use</h3>
            <p>Enable reminders and the app will prompt you at random intervals throughout your chosen active hours. When a reminder arrives, tap Yes to begin a guided breathing session, or Not Now to dismiss it.</p>
            <p style="margin-top:8px">You can also start a session manually at any time from the home screen.</p>

            <h3 style="color:#ca8a04;margin-top:24px;margin-bottom:8px">Privacy Policy</h3>
            <p>Mindful Breathing is developed by EvolveChain Apps. We are committed to protecting your privacy.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Data collection:</strong> This app does not collect, store, or transmit any personal data. All settings and preferences are stored locally on your device only.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Notifications:</strong> Notification permissions are used solely to deliver breathing reminders. No notification content is transmitted to any server.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Third parties:</strong> This app does not use any third-party analytics, advertising, or tracking services.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Changes:</strong> Any future changes to this privacy policy will be reflected in an updated version of the app.</p>

            <button class="btn btn-secondary" style="margin-top:32px" onclick="state.screen='main';render()">← Back</button>
        </div>`;
}

// Update countdown every 5 seconds
setInterval(() => { if (!state.isExercising) render(); }, 5000);

init();
