// ─── Firebase Config ──────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB0f6mJZ2qiw5ovrZ5X7wbamsyit-zc0is",
    authDomain: "mindful-breathing-6b0fe.firebaseapp.com",
    projectId: "mindful-breathing-6b0fe",
    storageBucket: "mindful-breathing-6b0fe.firebasestorage.app",
    messagingSenderId: "712095002849",
    appId: "1:712095002849:web:62fe1f703bebe554b707a0"
};

const VAPID_KEY = "BFX9KNZJXnKdBYlrCQhscvgCgXj5yYrhOUe9qP45Xx0zAPDBDYJhavbphVG6PDV49YnfDeG40yzGn2u3w7doFPo";

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
    fcmToken: null,
    screen: 'main',
    settings: {
        startHour: 7,
        startMin: 0,
        endHour: 21,
        endMin: 30,
        freqMin: 70,
        freqMax: 130
    },
    stats: {
        totalSessions: 0,
        sessionDates: [],
        longestStreak: 0,
        currentStreak: 0,
        lastSessionDate: null
    },
    celebration: null
};

const FREQ_PRESETS = [
    [30,  60,  'Every ~45 mins'],
    [60,  90,  'Every ~75 mins'],
    [70,  130, 'Every ~90 mins'],
    [90,  150, 'Every ~2 hours'],
    [120, 180, 'Every ~2.5 hours'],
    [150, 210, 'Every ~3 hours']
];

const SESSION_MILESTONES = [
    [1,   '🌟 First session complete! Your journey begins!'],
    [5,   '🔥 5 sessions done! You\'re building a habit!'],
    [10,  '💪 10 sessions! Consistency is your superpower!'],
    [25,  '🏆 25 sessions! You\'re a dedicated breather!'],
    [50,  '🌊 50 sessions! Breathing mastery awaits!'],
    [100, '🎯 100 sessions! You are truly mindful!']
];

const STREAK_MILESTONES = [
    [3,  '🔥 3 day streak! Keep it up!'],
    [7,  '⚡ 7 day streak! One whole week!'],
    [14, '🌟 2 week streak! Incredible!'],
    [30, '🏆 30 day streak! You\'re unstoppable!'],
    [60, '🎯 60 day streak! A true mindfulness master!']
];

let exerciseInterval = null;
let swRegistration = null;
let fcmSWRegistration = null;   // FIX: separate variable for the FCM service worker
let firebaseMessaging = null;

const appContent   = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    if ('serviceWorker' in navigator) {
        // Register the main app service worker (sw.js) for caching/offline
        try {
            swRegistration = await navigator.serviceWorker.register('/Box-Breathing-App/sw.js');
            await navigator.serviceWorker.ready;
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'SHOW_PROMPT') {
                    state.showNotification = true;
                    render();
                }
            });
        } catch (e) {
            console.log('SW failed:', e);
        }

        // FIX: Register the Firebase messaging service worker separately,
        // and pass it directly to getToken() instead of using the removed
        // useServiceWorker() method which no longer exists in Firebase 10.
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
            fcmSWRegistration = await navigator.serviceWorker.register(
                '/Box-Breathing-App/firebase-messaging-sw.js',
                { scope: '/Box-Breathing-App/' }
            );
            await fcmSWRegistration.update();
            firebaseMessaging = firebase.messaging();
            console.log('Firebase initialized successfully');
        } catch (e) {
            console.log('Firebase init failed:', e);
        }
    }

    loadState();
    recalcStreak();
    render();
}

// ─── State ────────────────────────────────────────────────────────────────────

function saveState() {
    localStorage.setItem('breathingApp', JSON.stringify({
        notificationsEnabled: state.notificationsEnabled,
        nextNotificationTime: state.nextNotificationTime,
        fcmToken: state.fcmToken,
        settings: state.settings,
        stats: state.stats
    }));
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem('breathingApp') || '{}');
        state.notificationsEnabled = saved.notificationsEnabled || false;
        state.nextNotificationTime = saved.nextNotificationTime || null;
        state.fcmToken = saved.fcmToken || null;
        if (saved.settings) state.settings = { ...state.settings, ...saved.settings };
        if (saved.stats)    state.stats    = { ...state.stats,    ...saved.stats    };
    } catch (e) {
        console.log('Error loading state:', e);
    }
}

// ─── Firebase Messaging ───────────────────────────────────────────────────────

async function getFCMToken() {
    try {
        // FIX: Pass the fcmSWRegistration directly to getToken() so Firebase
        // knows which service worker to use, regardless of the app's subfolder path.
        const token = await firebaseMessaging.getToken({
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: fcmSWRegistration
        });
        if (token) {
            state.fcmToken = token;
            saveState();
            return token;
        }
    } catch (e) {
        console.error('FCM token error:', e);
    }
    return null;
}

async function scheduleFirebaseNotification(delayMinutes) {
    if (!state.fcmToken) return false;
    try {
        const response = await fetch(
            'https://us-central1-mindful-breathing-6b0fe.cloudfunctions.net/scheduleNotification',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: state.fcmToken,
                    delayMinutes,
                    title: 'Mindful Breathing',
                    body: 'Shall we do some autonomic nervous system regulation?',
                    wakingHoursStart: state.settings.startHour * 60 + state.settings.startMin,
                    wakingHoursEnd: state.settings.endHour * 60 + state.settings.endMin
                })
            }
        );
        return response.ok;
    } catch (e) {
        console.error('Schedule error:', e);
        return false;
    }
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function enableNotifications() {
    if (!('Notification' in window)) { alert('Notifications not supported.'); return; }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('Notifications were blocked. Please enable them in Chrome settings.');
        return;
    }

    const token = await getFCMToken();
    if (!token) {
        alert('Could not register for notifications. Please try again.');
        return;
    }

    state.notificationsEnabled = true;
    saveState();
    await scheduleNextNotification();

    await swRegistration.showNotification('Notifications Enabled!', {
        body: 'Your first breathing reminder is on its way.',
        icon: 'icon-192.png',
        tag: 'test'
    });

    render();
}

function disableNotifications() {
    state.notificationsEnabled = false;
    state.nextNotificationTime = null;
    saveState();
    render();
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

async function scheduleNextNotification() {
    const { freqMin, freqMax } = state.settings;
    const mins = Math.floor(Math.random() * (freqMax - freqMin + 1)) + freqMin;
    state.nextNotificationTime = Date.now() + mins * 60 * 1000;
    saveState();
    await scheduleFirebaseNotification(mins);
    render();
}

// ─── Statistics ───────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0]; }

function recordSession() {
    state.stats.totalSessions++;
    state.stats.sessionDates.push(todayStr());
    state.stats.lastSessionDate = todayStr();
    recalcStreak();
    checkMilestones();
    saveState();
}

function recalcStreak() {
    const uniqueDates = [...new Set(state.stats.sessionDates)].sort();
    if (!uniqueDates.length) { state.stats.currentStreak = 0; state.stats.longestStreak = 0; return; }

    const today = todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    let streak = 0, check = today;
    while (uniqueDates.includes(check)) {
        streak++;
        const d = new Date(check); d.setDate(d.getDate() - 1);
        check = d.toISOString().split('T')[0];
    }
    if (!streak) {
        check = yStr;
        while (uniqueDates.includes(check)) {
            streak++;
            const d = new Date(check); d.setDate(d.getDate() - 1);
            check = d.toISOString().split('T')[0];
        }
    }
    state.stats.currentStreak = streak;

    let longest = 1, cur = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const diff = (new Date(uniqueDates[i]) - new Date(uniqueDates[i-1])) / 86400000;
        if (diff === 1) { cur++; longest = Math.max(longest, cur); } else cur = 1;
    }
    state.stats.longestStreak = Math.max(longest, streak);
}

function checkMilestones() {
    const sm = SESSION_MILESTONES.find(m => m[0] === state.stats.totalSessions);
    if (sm) { state.celebration = sm[1]; return; }
    const stm = STREAK_MILESTONES.find(m => m[0] === state.stats.currentStreak);
    if (stm) { state.celebration = stm[1]; return; }
    state.celebration = null;
}

function sessionsToday() { return state.stats.sessionDates.filter(d => d === todayStr()).length; }
function sessionsThisWeek() {
    const w = new Date(); w.setDate(w.getDate() - 6);
    const wStr = w.toISOString().split('T')[0];
    return state.stats.sessionDates.filter(d => d >= wStr).length;
}

// ─── Waking Hours ─────────────────────────────────────────────────────────────

function isWakingHours() {
    const now  = new Date();
    const curr = now.getHours() * 60 + now.getMinutes();
    return curr >= (state.settings.startHour * 60 + state.settings.startMin) &&
           curr <= (state.settings.endHour   * 60 + state.settings.endMin);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function saveSettings() {
    const startHour = parseInt(document.getElementById('startHour').value);
    const startMin  = parseInt(document.getElementById('startMin').value);
    const endHour   = parseInt(document.getElementById('endHour').value);
    const endMin    = parseInt(document.getElementById('endMin').value);
    const preset    = FREQ_PRESETS[parseInt(document.getElementById('freqSlider').value)];

    if ((endHour * 60 + endMin) <= (startHour * 60 + startMin)) {
        alert('End time must be after start time.'); return;
    }
    state.settings = { startHour, startMin, endHour, endMin, freqMin: preset[0], freqMax: preset[1] };
    saveState();
    if (state.notificationsEnabled) scheduleNextNotification();
    state.screen = 'main';
    render();
}

function getCurrentFreqIndex() {
    const idx = FREQ_PRESETS.findIndex(p => p[0] === state.settings.freqMin && p[1] === state.settings.freqMax);
    return idx >= 0 ? idx : 2;
}

function onFreqSliderChange(val) {
    document.getElementById('freqLabel').textContent = FREQ_PRESETS[parseInt(val)][2];
}

function padTime(n) { return n.toString().padStart(2, '0'); }

// ─── Breathing Exercise ───────────────────────────────────────────────────────

function startExercise() {
    state.showNotification = false;
    state.isExercising = true;
    state.cycle = 1; state.phase = 'inhale';
    state.phaseTimer = 0; state.totalTimer = 0;
    render();

    let totalTime = 0, phaseTime = 0;
    let currentPhase = 'inhale', currentCycle = 1;

    exerciseInterval = setInterval(() => {
        totalTime += 0.1; phaseTime += 0.1;
        state.totalTimer = totalTime; state.phaseTimer = phaseTime;

        if (currentPhase === 'inhale' && phaseTime >= 4) {
            currentPhase = 'hold'; phaseTime = 0; state.phase = 'hold'; state.phaseTimer = 0;
        } else if (currentPhase === 'hold' && phaseTime >= 4) {
            currentPhase = 'exhale'; phaseTime = 0; state.phase = 'exhale'; state.phaseTimer = 0;
        } else if (currentPhase === 'exhale' && phaseTime >= 8) {
            if (currentCycle < 4) {
                currentCycle++; currentPhase = 'inhale'; phaseTime = 0;
                state.cycle = currentCycle; state.phase = 'inhale'; state.phaseTimer = 0;
            } else {
                clearInterval(exerciseInterval);
                state.isExercising = false;
                recordSession();
                scheduleNextNotification();
                render(); return;
            }
        }
        render();
    }, 100);
}

function stopExercise() {
    if (exerciseInterval) clearInterval(exerciseInterval);
    state.isExercising = false; render();
}

function dismissNotification() { state.showNotification = false; render(); }
function dismissCelebration()  { state.celebration = null; render(); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCircleScale() {
    if (state.phase === 'inhale') return 0.5 + (state.phaseTimer / 4) * 0.5;
    if (state.phase === 'hold')   return 1;
    return 1 - (state.phaseTimer / 8) * 0.5;
}

function formatTime(secs) {
    return `${Math.floor(secs/60)}:${Math.floor(secs%60).toString().padStart(2,'0')}`;
}

function getNextReminderText() {
    if (!state.nextNotificationTime) return '';
    const secs = Math.floor((state.nextNotificationTime - Date.now()) / 1000);
    if (secs < 0) return 'Any moment now...';
    if (secs < 60) return `${secs} seconds`;
    return `~${Math.floor(secs/60)} minutes`;
}

function fmtHour(h, m) {
    const p = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${padTime(m)} ${p}`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    nextReminder.textContent = (state.notificationsEnabled && state.nextNotificationTime)
        ? `Next reminder in ${getNextReminderText()}` : '';

    const hide = state.isExercising;
    ['gearBtn','statsBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = hide ? 'none' : 'block';
    });

    if (state.screen === 'settings') { renderSettings(); return; }
    if (state.screen === 'about')    { renderAbout();    return; }
    if (state.screen === 'stats')    { renderStats();    return; }
    renderMain();
}

function renderMain() {
    if (state.celebration) {
        appContent.innerHTML = `
            <div class="notification-card" style="border-color:#ca8a04">
                <h2 style="font-size:28px">${state.celebration}</h2>
                <p>Keep up the amazing work!</p>
                <button class="btn btn-primary" onclick="dismissCelebration()">Thanks! 🙏</button>
            </div>`;
        return;
    }
    if (state.isExercising) {
        const labels   = { inhale:'Breathe In', hold:'Hold', exhale:'Breathe Out' };
        const maxTimes = { inhale:4, hold:4, exhale:8 };
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
    const streak = state.stats.currentStreak;
    appContent.innerHTML = `
        <div class="idle-icon">🔔</div>
        <h2>All Set!</h2>
        <p>Reminders active between ${fmtHour(startHour,startMin)} and ${fmtHour(endHour,endMin)}.</p>
        <p style="font-size:13px;color:#ca8a04;margin-top:-12px">${FREQ_PRESETS[getCurrentFreqIndex()][2]}</p>
        ${streak > 0 ? `<p style="font-size:14px;color:#ca8a04;margin-top:-8px">🔥 ${streak} day streak!</p>` : ''}
        <button class="btn btn-primary" onclick="startExercise()" style="margin-top:8px">▶ Start Practice Now</button>
        <button class="btn btn-secondary" style="margin-top:12px" onclick="disableNotifications()">Turn Off Reminders</button>`;
}

function renderStats() {
    const { totalSessions, currentStreak, longestStreak } = state.stats;
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        days.push({ lbl: d.toLocaleDateString('en',{weekday:'short'}).charAt(0), done: state.stats.sessionDates.includes(str) });
    }
    const calHtml = days.map(d => `
        <div class="cal-day">
            <div class="cal-dot ${d.done?'cal-dot-done':''}"></div>
            <div class="cal-label">${d.lbl}</div>
        </div>`).join('');
    const nextSM   = SESSION_MILESTONES.find(m => m[0] > totalSessions);
    const nextStrM = STREAK_MILESTONES.find(m => m[0] > currentStreak);

    appContent.innerHTML = `
        <div style="width:100%;max-width:500px;text-align:left">
            <h2 style="color:#ca8a04;margin-bottom:24px">Your Stats</h2>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-value">${totalSessions}</div><div class="stat-label">Total Sessions</div></div>
                <div class="stat-card"><div class="stat-value">${sessionsToday()}</div><div class="stat-label">Today</div></div>
                <div class="stat-card"><div class="stat-value">${sessionsThisWeek()}</div><div class="stat-label">This Week</div></div>
                <div class="stat-card"><div class="stat-value">🔥 ${currentStreak}</div><div class="stat-label">Current Streak</div></div>
                <div class="stat-card" style="grid-column:span 2"><div class="stat-value">⭐ ${longestStreak}</div><div class="stat-label">Longest Streak Ever</div></div>
            </div>
            <h3 style="color:#ca8a04;margin:24px 0 12px">Last 7 Days</h3>
            <div class="calendar-row">${calHtml}</div>
            ${nextSM ? `
            <h3 style="color:#ca8a04;margin:24px 0 8px">Next Milestones</h3>
            <div class="milestone-bar-wrap">
                <div class="milestone-label"><span>${totalSessions} sessions</span><span>${nextSM[0]} sessions</span></div>
                <div class="milestone-bar"><div class="milestone-fill" style="width:${Math.min(100,(totalSessions/nextSM[0])*100)}%"></div></div>
                <p style="font-size:12px;color:#6b7280;margin-top:4px">${nextSM[0]-totalSessions} sessions until next milestone</p>
            </div>` : '<p style="color:#ca8a04;margin-top:24px">🏆 All session milestones reached!</p>'}
            ${nextStrM ? `
            <div class="milestone-bar-wrap" style="margin-top:16px">
                <div class="milestone-label"><span>🔥 ${currentStreak} days</span><span>${nextStrM[0]} days</span></div>
                <div class="milestone-bar"><div class="milestone-fill" style="width:${Math.min(100,(currentStreak/nextStrM[0])*100)}%"></div></div>
                <p style="font-size:12px;color:#6b7280;margin-top:4px">${nextStrM[0]-currentStreak} more days to next streak milestone</p>
            </div>` : ''}
            <button class="btn btn-secondary" style="margin-top:32px" onclick="state.screen='main';render()">← Back</button>
        </div>`;
}

function renderSettings() {
    const s = state.settings;
    const freqIdx = getCurrentFreqIndex();
    const hourOpts = (sel) => Array.from({length:24},(_,i) =>
        `<option value="${i}" ${i===sel?'selected':''}>${padTime(i)}</option>`).join('');
    const minOpts = (sel) => [0,15,30,45].map(m =>
        `<option value="${m}" ${m===sel?'selected':''}>${padTime(m)}</option>`).join('');
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
                <input type="range" id="freqSlider" min="0" max="${FREQ_PRESETS.length-1}"
                    value="${freqIdx}" oninput="onFreqSliderChange(this.value)" class="freq-slider">
                <div class="freq-labels"><span>More often</span><span>Less often</span></div>
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
            <p style="color:#6b7280;font-size:13px;margin-bottom:24px">Version 1.2 &nbsp;·&nbsp; EvolveChain Apps</p>
            <h3 style="color:#ca8a04;margin-bottom:8px">About</h3>
            <p>Mindful Breathing helps you regulate your autonomic nervous system through guided box breathing exercises. The app sends gentle reminders throughout your day, prompting you to pause and breathe.</p>
            <p style="margin-top:8px">Each session guides you through four cycles of controlled breathing: inhale for 4 seconds, hold for 4 seconds, then exhale for 8 seconds — a total of just over one minute.</p>
            <h3 style="color:#ca8a04;margin-top:24px;margin-bottom:8px">How to Use</h3>
            <p>Enable reminders and the app will prompt you at random intervals throughout your chosen active hours. When a reminder arrives, tap Yes to begin a guided breathing session, or Not Now to dismiss it.</p>
            <p style="margin-top:8px">Complete a full session to record it in your stats and maintain your streak. Partial sessions do not count towards your progress.</p>
            <h3 style="color:#ca8a04;margin-top:24px;margin-bottom:8px">Privacy Policy</h3>
            <p>Mindful Breathing is developed by EvolveChain Apps. We are committed to protecting your privacy.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Data collection:</strong> This app does not collect, store, or transmit any personal data. All settings and preferences are stored locally on your device only.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Notifications:</strong> Notification permissions are used solely to deliver breathing reminders. No notification content is transmitted to any server.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Third parties:</strong> This app does not use any third-party analytics, advertising, or tracking services.</p>
            <p style="margin-top:8px"><strong style="color:#ffffff">Changes:</strong> Any future changes to this privacy policy will be reflected in an updated version of the app.</p>
            <button class="btn btn-secondary" style="margin-top:32px" onclick="state.screen='main';render()">← Back</button>
        </div>`;
}

setInterval(() => { if (!state.isExercising) render(); }, 5000);
init();
