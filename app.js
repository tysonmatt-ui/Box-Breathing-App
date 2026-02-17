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

// ─── Breathing Patterns ───────────────────────────────────────────────────────

const BREATHING_PATTERNS = [
    {
        id: 'calm',
        name: 'Calm',
        shortName: '4-4-8',
        description: 'Extended exhale for deep relaxation',
        phases: [
            { name: 'Breathe In',  duration: 4, type: 'inhale' },
            { name: 'Hold',        duration: 4, type: 'hold-full' },
            { name: 'Breathe Out', duration: 8, type: 'exhale' }
        ]
    },
    {
        id: 'box',
        name: 'Classic Box',
        shortName: '4-4-4-4',
        description: 'Equal phases for balance and focus',
        phases: [
            { name: 'Breathe In',  duration: 4, type: 'inhale' },
            { name: 'Hold',        duration: 4, type: 'hold-full' },
            { name: 'Breathe Out', duration: 4, type: 'exhale' },
            { name: 'Hold',        duration: 4, type: 'hold-empty' }
        ]
    },
    {
        id: 'relaxing',
        name: 'Relaxing',
        shortName: '4-7-8',
        description: "Dr. Weil's technique for calm and sleep",
        phases: [
            { name: 'Breathe In',  duration: 4, type: 'inhale' },
            { name: 'Hold',        duration: 7, type: 'hold-full' },
            { name: 'Breathe Out', duration: 8, type: 'exhale' }
        ]
    },
    {
        id: 'energizing',
        name: 'Energizing',
        shortName: '6-6',
        description: 'Rhythmic breathing for energy and alertness',
        phases: [
            { name: 'Breathe In',  duration: 6, type: 'inhale' },
            { name: 'Breathe Out', duration: 6, type: 'exhale' }
        ]
    },
    {
        id: 'extended',
        name: 'Extended Calm',
        shortName: '5-5-10',
        description: 'Longer pattern for deep relaxation',
        phases: [
            { name: 'Breathe In',  duration: 5, type: 'inhale' },
            { name: 'Hold',        duration: 5, type: 'hold-full' },
            { name: 'Breathe Out', duration: 10, type: 'exhale' }
        ]
    }
];

// ─── Session Lengths ──────────────────────────────────────────────────────────

const SESSION_LENGTHS = [
    { id: 'quick',    name: 'Quick',    cycles: 2 },
    { id: 'standard', name: 'Standard', cycles: 4 },
    { id: 'extended', name: 'Extended', cycles: 6 },
    { id: 'deep',     name: 'Deep',     cycles: 8 }
];

// ─── Visual Themes ────────────────────────────────────────────────────────────

const THEMES = [
    {
        id: 'midnight',
        name: 'Midnight',
        accent: '#ca8a04',
        accentDim: 'rgba(202,138,4,0.3)',
        accentBg: 'rgba(202,138,4,0.1)',
        bg: '#000000',
        cardBg: '#1f2937',
        cardBorder: '#374151',
        text: '#ffffff',
        textSecondary: '#9ca3af',
        textTertiary: '#6b7280',
        headerBorder: 'rgba(202,138,4,0.3)',
        preview: ['#000000','#ca8a04']
    },
    {
        id: 'ocean',
        name: 'Ocean',
        accent: '#06b6d4',
        accentDim: 'rgba(6,182,212,0.3)',
        accentBg: 'rgba(6,182,212,0.1)',
        bg: '#0a1628',
        cardBg: '#1e293b',
        cardBorder: '#334155',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        textTertiary: '#64748b',
        headerBorder: 'rgba(6,182,212,0.3)',
        preview: ['#0a1628','#06b6d4']
    },
    {
        id: 'forest',
        name: 'Forest',
        accent: '#10b981',
        accentDim: 'rgba(16,185,129,0.3)',
        accentBg: 'rgba(16,185,129,0.1)',
        bg: '#071a0f',
        cardBg: '#1a2e23',
        cardBorder: '#2d4a3a',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        textTertiary: '#64748b',
        headerBorder: 'rgba(16,185,129,0.3)',
        preview: ['#071a0f','#10b981']
    },
    {
        id: 'sunset',
        name: 'Sunset',
        accent: '#f97316',
        accentDim: 'rgba(249,115,22,0.3)',
        accentBg: 'rgba(249,115,22,0.1)',
        bg: '#1a0a1e',
        cardBg: '#2d1b33',
        cardBorder: '#4a2d52',
        text: '#ffffff',
        textSecondary: '#a78bba',
        textTertiary: '#7c6290',
        headerBorder: 'rgba(249,115,22,0.3)',
        preview: ['#1a0a1e','#f97316']
    }
];

// ─── Ambient Sounds ───────────────────────────────────────────────────────────

const AMBIENT_SOUNDS = [
    { id: 'none',   name: 'None',          icon: '🔇' },
    { id: 'rain',   name: 'Rain',          icon: '🌧️' },
    { id: 'ocean',  name: 'Ocean Waves',   icon: '🌊' },
    { id: 'forest', name: 'Forest',        icon: '🌿' },
    { id: 'white',  name: 'White Noise',   icon: '☁️' }
];

// ─── App State ────────────────────────────────────────────────────────────────

let state = {
    notificationsEnabled: false,
    pushSupported: false,
    fcmAvailable: false,
    iosLimited: false,
    isExercising: false,
    showNotification: false,
    activePhase: null,
    cycle: 1,
    totalCycles: 4,
    phaseTimer: 0,
    totalTimer: 0,
    totalDuration: 0,
    nextNotificationTime: null,
    fcmToken: null,
    screen: 'main',
    onboardingStep: 0,
    demoRunning: false,
    demoComplete: false,
    settings: {
        startHour: 7,
        startMin: 0,
        endHour: 21,
        endMin: 30,
        freqMin: 70,
        freqMax: 130,
        patternId: 'calm',
        sessionLengthId: 'standard',
        themeId: 'midnight',
        soundId: 'none'
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

// Temporary settings selections
let settingsPatternId = 'calm';
let settingsLengthId = 'standard';
let settingsThemeId = 'midnight';
let settingsSoundId = 'none';

// Onboarding temp selections
let onboardingPatternId = 'calm';

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
let demoInterval = null;
let swRegistration = null;
let fcmSWRegistration = null;
let firebaseMessaging = null;

// Audio
let audioCtx = null;
let ambientNodes = [];
let birdTimeout = null;

const appContent   = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// ─── Pattern / Length Helpers ─────────────────────────────────────────────────

function getPattern(id) {
    return BREATHING_PATTERNS.find(p => p.id === id) || BREATHING_PATTERNS[0];
}

function getSessionLength(id) {
    return SESSION_LENGTHS.find(s => s.id === id) || SESSION_LENGTHS[1];
}

function getSelectedPattern() {
    return getPattern(state.settings.patternId);
}

function getSelectedSessionLength() {
    return getSessionLength(state.settings.sessionLengthId);
}

function calcCycleDuration(pattern) {
    return pattern.phases.reduce((sum, p) => sum + p.duration, 0);
}

function calcTotalDuration(pattern, sessionLength) {
    return calcCycleDuration(pattern) * sessionLength.cycles;
}

function formatDuration(totalSecs) {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m === 0) return s + 's';
    if (s === 0) return m + 'm';
    return m + 'm ' + s + 's';
}

// ─── Theme System ─────────────────────────────────────────────────────────────

function getTheme(id) {
    return THEMES.find(t => t.id === id) || THEMES[0];
}

function applyTheme(themeId) {
    const t = getTheme(themeId);
    const r = document.documentElement.style;
    r.setProperty('--bg', t.bg);
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-dim', t.accentDim);
    r.setProperty('--accent-bg', t.accentBg);
    r.setProperty('--card-bg', t.cardBg);
    r.setProperty('--card-border', t.cardBorder);
    r.setProperty('--text', t.text);
    r.setProperty('--text-secondary', t.textSecondary);
    r.setProperty('--text-tertiary', t.textTertiary);
    r.setProperty('--header-border', t.headerBorder);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.bg);
}

// ─── Ambient Sound System ─────────────────────────────────────────────────────

function createNoiseBuffer() {
    if (!audioCtx) return null;
    var bufferSize = audioCtx.sampleRate * 2;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

function createNoiseSource(buffer) {
    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
}

function startAmbientSound(soundId) {
    if (soundId === 'none') return;
    stopAmbientSound();
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio not supported:', e);
        return;
    }
    var noiseBuffer = createNoiseBuffer();
    switch (soundId) {
        case 'rain':   createRainSound(noiseBuffer);   break;
        case 'ocean':  createOceanSound(noiseBuffer);  break;
        case 'forest': createForestSound(noiseBuffer);  break;
        case 'white':  createWhiteNoise(noiseBuffer);  break;
    }
}

function createWhiteNoise(buffer) {
    var source = createNoiseSource(buffer);
    var gain = audioCtx.createGain();
    gain.gain.value = 0.12;
    source.connect(gain).connect(audioCtx.destination);
    source.start();
    ambientNodes.push(source, gain);
}

function createRainSound(buffer) {
    var src1 = createNoiseSource(buffer);
    var hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4000;
    var bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 8000;
    bp.Q.value = 0.3;
    var g1 = audioCtx.createGain();
    g1.gain.value = 0.14;
    src1.connect(hp).connect(bp).connect(g1).connect(audioCtx.destination);
    src1.start();

    var src2 = createNoiseSource(buffer);
    var lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    var g2 = audioCtx.createGain();
    g2.gain.value = 0.06;
    src2.connect(lp).connect(g2).connect(audioCtx.destination);
    src2.start();

    ambientNodes.push(src1, hp, bp, g1, src2, lp, g2);
}

function createOceanSound(buffer) {
    var source = createNoiseSource(buffer);
    var lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    var gain = audioCtx.createGain();
    gain.gain.value = 0.25;

    var lfo = audioCtx.createOscillator();
    var lfoGain = audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.13;
    lfo.connect(lfoGain).connect(gain.gain);

    var lfo2 = audioCtx.createOscillator();
    var lfo2Gain = audioCtx.createGain();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.07;
    lfo2Gain.gain.value = 300;
    lfo2.connect(lfo2Gain).connect(lp.frequency);

    source.connect(lp).connect(gain).connect(audioCtx.destination);
    source.start();
    lfo.start();
    lfo2.start();
    ambientNodes.push(source, lp, gain, lfo, lfoGain, lfo2, lfo2Gain);
}

function createForestSound(buffer) {
    var source = createNoiseSource(buffer);
    var bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.4;
    var gain = audioCtx.createGain();
    gain.gain.value = 0.08;

    var windLfo = audioCtx.createOscillator();
    var windLfoGain = audioCtx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.15;
    windLfoGain.gain.value = 0.03;
    windLfo.connect(windLfoGain).connect(gain.gain);

    source.connect(bp).connect(gain).connect(audioCtx.destination);
    source.start();
    windLfo.start();
    ambientNodes.push(source, bp, gain, windLfo, windLfoGain);
    scheduleBirdChirp();
}

function scheduleBirdChirp() {
    if (!audioCtx || audioCtx.state === 'closed') return;
    var delay = 1500 + Math.random() * 4000;
    birdTimeout = setTimeout(function() {
        if (!audioCtx || audioCtx.state === 'closed') return;
        try {
            var t = audioCtx.currentTime;
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sine';
            var baseFreq = 2500 + Math.random() * 2500;
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.06);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.15);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.04, t + 0.02);
            g.gain.linearRampToValueAtTime(0.03, t + 0.08);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.connect(g).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.25);

            if (Math.random() > 0.4) {
                var osc2 = audioCtx.createOscillator();
                var g2 = audioCtx.createGain();
                osc2.type = 'sine';
                var f2 = baseFreq * (0.8 + Math.random() * 0.4);
                osc2.frequency.setValueAtTime(f2, t + 0.2);
                osc2.frequency.exponentialRampToValueAtTime(f2 * 1.2, t + 0.28);
                g2.gain.setValueAtTime(0, t + 0.2);
                g2.gain.linearRampToValueAtTime(0.03, t + 0.22);
                g2.gain.linearRampToValueAtTime(0, t + 0.38);
                osc2.connect(g2).connect(audioCtx.destination);
                osc2.start(t + 0.2);
                osc2.stop(t + 0.4);
            }
        } catch (e) { /* ignore */ }
        scheduleBirdChirp();
    }, delay);
}

function stopAmbientSound() {
    if (birdTimeout) { clearTimeout(birdTimeout); birdTimeout = null; }
    ambientNodes.forEach(function(n) {
        try { if (n.stop) n.stop(); } catch (e) {}
        try { n.disconnect(); } catch (e) {}
    });
    ambientNodes = [];
    if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('/Box-Breathing-App/sw.js');
            await navigator.serviceWorker.ready;
            navigator.serviceWorker.addEventListener('message', function(event) {
                if (event.data.type === 'SHOW_PROMPT') {
                    state.showNotification = true;
                    render();
                }
            });
        } catch (e) {
            console.log('SW failed:', e);
        }

        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(FIREBASE_CONFIG);
                fcmSWRegistration = await navigator.serviceWorker.register(
                    '/Box-Breathing-App/firebase-messaging-sw.js',
                    { scope: '/Box-Breathing-App/' }
                );
                await fcmSWRegistration.update();
                firebaseMessaging = firebase.messaging();
                console.log('Firebase initialized successfully');
            } else {
                console.warn('Firebase SDK not loaded - notification features unavailable');
            }
        } catch (e) {
            console.error('Firebase init failed:', e);
        }
    }

    loadState();
    applyTheme(state.settings.themeId);
    recalcStreak();

    // Handle browser/Android back button
    window.addEventListener('popstate', function(e) {
        if (state.isExercising) {
            stopExercise();
        } else if (state.demoRunning) {
            stopOnboardingDemo();
        } else if (state.screen !== 'main' && state.screen !== 'onboarding') {
            if (state.screen === 'settings') {
                cancelSettings();
            } else {
                state.screen = 'main';
                render();
            }
        }
    });

    var onboardingDone = localStorage.getItem('onboardingComplete');
    if (!onboardingDone) {
        state.screen = 'onboarding';
        state.onboardingStep = 0;
    }

    render();
}

// ─── State ────────────────────────────────────────────────────────────────────

function saveState() {
    localStorage.setItem('breathingApp', JSON.stringify({
        notificationsEnabled: state.notificationsEnabled,
        pushSupported: state.pushSupported,
        fcmAvailable: state.fcmAvailable,
        iosLimited: state.iosLimited,
        nextNotificationTime: state.nextNotificationTime,
        fcmToken: state.fcmToken,
        settings: state.settings,
        stats: state.stats
    }));
}

function loadState() {
    try {
        var saved = JSON.parse(localStorage.getItem('breathingApp') || '{}');
        state.notificationsEnabled = saved.notificationsEnabled || false;
        state.pushSupported = saved.pushSupported || false;
        state.fcmAvailable = saved.fcmAvailable || false;
        state.iosLimited = saved.iosLimited || false;
        state.nextNotificationTime = saved.nextNotificationTime || null;
        state.fcmToken = saved.fcmToken || null;
        if (saved.settings) state.settings = Object.assign({}, state.settings, saved.settings);
        if (saved.stats)    state.stats    = Object.assign({}, state.stats,    saved.stats);
    } catch (e) {
        console.log('Error loading state:', e);
    }
}

// ─── Firebase Messaging ───────────────────────────────────────────────────────

async function getFCMToken() {
    if (!firebaseMessaging) {
        console.error('Firebase messaging not initialized');
        return null;
    }
    try {
        var token = await firebaseMessaging.getToken({
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
        var response = await fetch(
            'https://us-central1-mindful-breathing-6b0fe.cloudfunctions.net/scheduleNotification',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: state.fcmToken,
                    delayMinutes: delayMinutes,
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

// ─── Platform Detection ───────────────────────────────────────────────────────

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isSafari() {
    return /^((?!chrome|android|crios|fxios|brave).)*safari/i.test(navigator.userAgent);
}

function canDoPush() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function enableNotifications() {
    // iOS special handling
    if (isIOS()) {
        if (!isStandalone()) {
            state.notificationsEnabled = true;
            state.iosLimited = true;
            saveState();
            await scheduleNextNotification();
            render();
            return;
        }
    }

    // Non-iOS but no push support (rare browsers)
    if (!canDoPush()) {
        // Still enable in-app reminders
        state.notificationsEnabled = true;
        state.pushSupported = false;
        saveState();
        await scheduleNextNotification();
        render();
        return;
    }

    var permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        // Still enable in-app reminders even without push permission
        state.notificationsEnabled = true;
        state.pushSupported = false;
        saveState();
        await scheduleNextNotification();
        render();
        return;
    }

    // Try Firebase for background push
    state.pushSupported = true;
    if (!firebaseMessaging) {
        try {
            if (typeof firebase !== 'undefined') {
                if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                if (!fcmSWRegistration) {
                    fcmSWRegistration = await navigator.serviceWorker.register(
                        '/Box-Breathing-App/firebase-messaging-sw.js',
                        { scope: '/Box-Breathing-App/' }
                    );
                }
                await fcmSWRegistration.update();
                firebaseMessaging = firebase.messaging();
                console.log('Firebase re-initialized successfully');
            }
        } catch (e) {
            console.error('Firebase init retry failed:', e);
        }
    }

    var token = null;
    if (firebaseMessaging) {
        token = await getFCMToken();
    }

    state.notificationsEnabled = true;
    state.fcmAvailable = !!token;
    saveState();
    await scheduleNextNotification();

    // Show confirmation notification if possible
    try {
        var sw = swRegistration || fcmSWRegistration;
        if (sw) {
            await sw.showNotification('Notifications Enabled!', {
                body: token ? 'You\'ll receive reminders even when the app is closed.'
                            : 'You\'ll see reminders when the app is open.',
                icon: 'icon-192.png',
                tag: 'test'
            });
        }
    } catch (e) {
        console.log('Confirmation notification failed:', e);
    }

    render();
}

function disableNotifications() {
    state.notificationsEnabled = false;
    state.pushSupported = false;
    state.fcmAvailable = false;
    state.iosLimited = false;
    state.nextNotificationTime = null;
    saveState();
    render();
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

async function scheduleNextNotification() {
    var freqMin = state.settings.freqMin;
    var freqMax = state.settings.freqMax;
    var mins = Math.floor(Math.random() * (freqMax - freqMin + 1)) + freqMin;
    state.nextNotificationTime = Date.now() + mins * 60 * 1000;
    saveState();

    // Try FCM for background push (best-effort)
    if (state.fcmToken) {
        try {
            await scheduleFirebaseNotification(mins);
        } catch (e) {
            console.log('FCM schedule failed (in-app timer will still work):', e);
        }
    }

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
    var uniqueDates = Array.from(new Set(state.stats.sessionDates)).sort();
    if (!uniqueDates.length) { state.stats.currentStreak = 0; state.stats.longestStreak = 0; return; }

    var today = todayStr();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yStr = yesterday.toISOString().split('T')[0];

    var streak = 0, check = today;
    while (uniqueDates.includes(check)) {
        streak++;
        var d = new Date(check); d.setDate(d.getDate() - 1);
        check = d.toISOString().split('T')[0];
    }
    if (!streak) {
        check = yStr;
        while (uniqueDates.includes(check)) {
            streak++;
            var d2 = new Date(check); d2.setDate(d2.getDate() - 1);
            check = d2.toISOString().split('T')[0];
        }
    }
    state.stats.currentStreak = streak;

    var longest = 1, cur = 1;
    for (var i = 1; i < uniqueDates.length; i++) {
        var diff = (new Date(uniqueDates[i]) - new Date(uniqueDates[i-1])) / 86400000;
        if (diff === 1) { cur++; longest = Math.max(longest, cur); } else cur = 1;
    }
    state.stats.longestStreak = Math.max(longest, streak);
}

function checkMilestones() {
    var sm = SESSION_MILESTONES.find(function(m) { return m[0] === state.stats.totalSessions; });
    if (sm) { state.celebration = sm[1]; return; }
    var stm = STREAK_MILESTONES.find(function(m) { return m[0] === state.stats.currentStreak; });
    if (stm) { state.celebration = stm[1]; return; }
    state.celebration = null;
}

function sessionsToday() { return state.stats.sessionDates.filter(function(d) { return d === todayStr(); }).length; }
function sessionsThisWeek() {
    var w = new Date(); w.setDate(w.getDate() - 6);
    var wStr = w.toISOString().split('T')[0];
    return state.stats.sessionDates.filter(function(d) { return d >= wStr; }).length;
}

// ─── Waking Hours ─────────────────────────────────────────────────────────────

function isWakingHours() {
    var now = new Date();
    var curr = now.getHours() * 60 + now.getMinutes();
    return curr >= (state.settings.startHour * 60 + state.settings.startMin) &&
           curr <= (state.settings.endHour   * 60 + state.settings.endMin);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function openSettings() {
    settingsPatternId = state.settings.patternId;
    settingsLengthId  = state.settings.sessionLengthId;
    settingsThemeId   = state.settings.themeId;
    settingsSoundId   = state.settings.soundId;
    state.screen = 'settings';
    history.pushState({screen:'settings'}, '');
    render();
}

function selectPattern(id) { settingsPatternId = id; render(); }
function selectLength(id)  { settingsLengthId = id; render(); }

function selectTheme(id) {
    settingsThemeId = id;
    applyTheme(id);
    render();
}

function selectSound(id) { settingsSoundId = id; render(); }

function openStats() {
    state.screen = 'stats';
    history.pushState({screen:'stats'}, '');
    render();
}

function openAbout() {
    state.screen = 'about';
    history.pushState({screen:'about'}, '');
    render();
}

function goBack() {
    if (state.screen === 'settings') {
        cancelSettings();
    } else {
        state.screen = 'main';
        render();
    }
}

function previewSound(id, event) {
    event.stopPropagation();
    stopAmbientSound();
    if (id !== 'none') startAmbientSound(id);
    setTimeout(function() { stopAmbientSound(); }, 3000);
}

function saveSettings() {
    var startHour = parseInt(document.getElementById('startHour').value);
    var startMin  = parseInt(document.getElementById('startMin').value);
    var endHour   = parseInt(document.getElementById('endHour').value);
    var endMin    = parseInt(document.getElementById('endMin').value);
    var preset    = FREQ_PRESETS[parseInt(document.getElementById('freqSlider').value)];

    if ((endHour * 60 + endMin) <= (startHour * 60 + startMin)) {
        alert('End time must be after start time.'); return;
    }
    state.settings = {
        startHour: startHour, startMin: startMin, endHour: endHour, endMin: endMin,
        freqMin: preset[0], freqMax: preset[1],
        patternId: settingsPatternId,
        sessionLengthId: settingsLengthId,
        themeId: settingsThemeId,
        soundId: settingsSoundId
    };
    applyTheme(settingsThemeId);
    stopAmbientSound();
    saveState();
    if (state.notificationsEnabled) scheduleNextNotification();
    state.screen = 'main';
    render();
}

function cancelSettings() {
    applyTheme(state.settings.themeId);
    stopAmbientSound();
    state.screen = 'main';
    render();
}

function getCurrentFreqIndex() {
    var idx = FREQ_PRESETS.findIndex(function(p) { return p[0] === state.settings.freqMin && p[1] === state.settings.freqMax; });
    return idx >= 0 ? idx : 2;
}

function onFreqSliderChange(val) {
    document.getElementById('freqLabel').textContent = FREQ_PRESETS[parseInt(val)][2];
}

function padTime(n) { return n.toString().padStart(2, '0'); }

// ─── Onboarding ───────────────────────────────────────────────────────────────

function onboardingNext() {
    state.onboardingStep++;
    render();
}

function onboardingBack() {
    if (state.onboardingStep > 0) state.onboardingStep--;
    render();
}

function onboardingSelectPattern(id) {
    onboardingPatternId = id;
    render();
}

function startOnboardingDemo() {
    var pattern = getPattern(onboardingPatternId);

    state.demoRunning = true;
    state.demoComplete = false;
    state.cycle = 1;
    state.totalCycles = 1;
    state.activePhase = pattern.phases[0];
    state.phaseTimer = 0;
    state.totalTimer = 0;

    var demoDurations = pattern.phases.map(function(p) { return Math.min(p.duration, 2); });
    state.totalDuration = demoDurations.reduce(function(a, b) { return a + b; }, 0);

    startAmbientSound('rain');
    render();

    var totalTime = 0, phaseTime = 0;
    var phaseIdx = 0;

    demoInterval = setInterval(function() {
        totalTime += 0.1; phaseTime += 0.1;
        state.totalTimer = totalTime; state.phaseTimer = phaseTime;

        if (phaseTime >= demoDurations[phaseIdx]) {
            phaseIdx++;
            if (phaseIdx >= pattern.phases.length) {
                clearInterval(demoInterval);
                demoInterval = null;
                stopAmbientSound();
                state.demoRunning = false;
                state.demoComplete = true;
                render();
                return;
            }
            phaseTime = 0;
            state.activePhase = pattern.phases[phaseIdx];
            state.phaseTimer = 0;
        }
        render();
    }, 100);
}

function stopOnboardingDemo() {
    if (demoInterval) { clearInterval(demoInterval); demoInterval = null; }
    stopAmbientSound();
    state.demoRunning = false;
    state.demoComplete = false;
    render();
}

async function finishOnboarding() {
    state.settings.patternId = onboardingPatternId;

    var startH = document.getElementById('obStartHour');
    var startM = document.getElementById('obStartMin');
    var endH   = document.getElementById('obEndHour');
    var endM   = document.getElementById('obEndMin');
    var freqS  = document.getElementById('obFreqSlider');

    if (startH) state.settings.startHour = parseInt(startH.value);
    if (startM) state.settings.startMin  = parseInt(startM.value);
    if (endH)   state.settings.endHour   = parseInt(endH.value);
    if (endM)   state.settings.endMin    = parseInt(endM.value);
    if (freqS) {
        var preset = FREQ_PRESETS[parseInt(freqS.value)];
        state.settings.freqMin = preset[0];
        state.settings.freqMax = preset[1];
    }

    saveState();
    localStorage.setItem('onboardingComplete', 'true');
    state.screen = 'main';
    state.onboardingStep = 0;
    state.demoRunning = false;
    state.demoComplete = false;

    render();

    // Try to enable notifications (don't block onboarding completion)
    try {
        await enableNotifications();
    } catch (e) {
        console.log('Notification setup deferred:', e);
    }
}

// ─── Breathing Exercise ───────────────────────────────────────────────────────

function startExercise() {
    var pattern = getSelectedPattern();
    var sessionLength = getSelectedSessionLength();

    state.showNotification = false;
    state.isExercising = true;
    history.pushState({screen:'exercise'}, '');
    state.cycle = 1;
    state.totalCycles = sessionLength.cycles;
    state.activePhase = pattern.phases[0];
    state.phaseTimer = 0;
    state.totalTimer = 0;
    state.totalDuration = calcTotalDuration(pattern, sessionLength);

    startAmbientSound(state.settings.soundId);
    render();

    var totalTime = 0, phaseTime = 0;
    var currentPhaseIndex = 0, currentCycle = 1;

    exerciseInterval = setInterval(function() {
        totalTime += 0.1; phaseTime += 0.1;
        state.totalTimer = totalTime; state.phaseTimer = phaseTime;

        var currentPhase = pattern.phases[currentPhaseIndex];

        if (phaseTime >= currentPhase.duration) {
            currentPhaseIndex++;
            if (currentPhaseIndex >= pattern.phases.length) {
                if (currentCycle < sessionLength.cycles) {
                    currentCycle++;
                    currentPhaseIndex = 0;
                    phaseTime = 0;
                    state.cycle = currentCycle;
                    state.activePhase = pattern.phases[0];
                    state.phaseTimer = 0;
                } else {
                    clearInterval(exerciseInterval);
                    stopAmbientSound();
                    state.isExercising = false;
                    recordSession();
                    scheduleNextNotification();
                    render();
                    return;
                }
            } else {
                phaseTime = 0;
                state.activePhase = pattern.phases[currentPhaseIndex];
                state.phaseTimer = 0;
            }
        }
        render();
    }, 100);
}

function stopExercise() {
    if (exerciseInterval) clearInterval(exerciseInterval);
    stopAmbientSound();
    state.isExercising = false; render();
}

function dismissNotification() { state.showNotification = false; scheduleNextNotification(); }
function dismissCelebration()  { state.celebration = null; render(); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCircleScale() {
    if (!state.activePhase) return 0.75;
    var phase = state.activePhase;
    var ratio = state.phaseTimer / phase.duration;
    if (phase.type === 'inhale')     return 0.5 + ratio * 0.5;
    if (phase.type === 'hold-full')  return 1;
    if (phase.type === 'exhale')     return 1 - ratio * 0.5;
    if (phase.type === 'hold-empty') return 0.5;
    return 0.75;
}

function formatTime(secs) {
    return Math.floor(secs/60) + ':' + Math.floor(secs%60).toString().padStart(2,'0');
}

function getNextReminderText() {
    if (!state.nextNotificationTime) return '';
    var secs = Math.floor((state.nextNotificationTime - Date.now()) / 1000);
    if (secs < 0) return 'Any moment now...';
    if (secs < 60) return secs + ' seconds';
    return '~' + Math.floor(secs/60) + ' minutes';
}

function fmtHour(h, m) {
    var p = h >= 12 ? 'PM' : 'AM';
    var h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + ':' + padTime(m) + ' ' + p;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    nextReminder.textContent = (state.notificationsEnabled && state.nextNotificationTime)
        ? 'Next reminder in ' + getNextReminderText() : '';

    var hide = state.isExercising || state.screen === 'onboarding';
    ['gearBtn','statsBtn'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = hide ? 'none' : 'block';
    });
    if (notificationIcon) notificationIcon.style.display = state.screen === 'onboarding' ? 'none' : 'inline';

    var footerEl = document.getElementById('footerInfo');
    if (footerEl) {
        if (state.screen === 'onboarding') {
            footerEl.innerHTML = 'Welcome to Mindful Breathing';
        } else {
            var s = state.settings;
            var pattern = getSelectedPattern();
            footerEl.innerHTML = 'Active hours: ' + fmtHour(s.startHour,s.startMin) + ' – ' + fmtHour(s.endHour,s.endMin) + ' &nbsp;·&nbsp; ' + pattern.name + ' (' + pattern.shortName + ')';
        }
    }

    if (state.screen === 'onboarding') { renderOnboarding(); return; }
    if (state.screen === 'settings')   { renderSettings();   return; }
    if (state.screen === 'about')      { renderAbout();      return; }
    if (state.screen === 'stats')      { renderStats();      return; }
    renderMain();
}

// ─── Render: Onboarding ───────────────────────────────────────────────────────

function renderOnboarding() {
    var step = state.onboardingStep;
    var dots = [0,1,2,3].map(function(i) {
        return '<span class="ob-dot ' + (i === step ? 'ob-dot-active' : '') + '"></span>';
    }).join('');

    var content = '';

    if (step === 0) {
        content = '<div class="ob-icon">🫁</div>' +
            '<h2 style="color:var(--accent);font-size:26px;margin-bottom:16px">Welcome to<br>Mindful Breathing</h2>' +
            '<p style="font-size:16px;max-width:320px;margin:0 auto 24px">Regulate your autonomic nervous system with guided breathing exercises. The app sends gentle reminders throughout your day.</p>' +
            '<div style="display:flex;flex-direction:column;gap:8px;max-width:280px;margin:0 auto 32px;text-align:left">' +
                '<div class="ob-feature"><span class="ob-feature-icon">⏰</span> Smart reminders during your active hours</div>' +
                '<div class="ob-feature"><span class="ob-feature-icon">🌬️</span> Multiple breathing patterns to choose from</div>' +
                '<div class="ob-feature"><span class="ob-feature-icon">📊</span> Track your sessions and build streaks</div>' +
                '<div class="ob-feature"><span class="ob-feature-icon">🎵</span> Calming ambient sounds</div>' +
            '</div>' +
            '<button class="btn btn-primary" onclick="onboardingNext()">Get Started →</button>';
    }

    else if (step === 1) {
        var cards = BREATHING_PATTERNS.map(function(p) {
            var sel = p.id === onboardingPatternId;
            var cycleSecs = calcCycleDuration(p);
            return '<div class="option-card ' + (sel ? 'option-card-selected' : '') + '" onclick="onboardingSelectPattern(\'' + p.id + '\')">' +
                '<div class="option-card-name">' + p.name + '</div>' +
                '<div class="option-card-detail">' + p.shortName + ' · ' + cycleSecs + 's/cycle</div>' +
                '<div class="option-card-desc">' + p.description + '</div>' +
            '</div>';
        }).join('');

        content = '<h2 style="color:var(--accent);margin-bottom:8px">Choose Your Pattern</h2>' +
            '<p style="font-size:14px;margin-bottom:20px">Pick a breathing pattern to start with. You can always change this later in Settings.</p>' +
            '<div class="option-grid" style="margin-bottom:24px;text-align:left">' + cards + '</div>' +
            '<div class="button-group">' +
                '<button class="btn btn-secondary" onclick="onboardingBack()">← Back</button>' +
                '<button class="btn btn-primary" onclick="onboardingNext()">Next →</button>' +
            '</div>';
    }

    else if (step === 2) {
        var s = state.settings;
        var freqIdx = getCurrentFreqIndex();
        var hourOpts = function(sel) {
            return Array.from({length:24}, function(_,i) {
                return '<option value="' + i + '" ' + (i===sel?'selected':'') + '>' + padTime(i) + '</option>';
            }).join('');
        };
        var minOpts = function(sel) {
            return [0,15,30,45].map(function(m) {
                return '<option value="' + m + '" ' + (m===sel?'selected':'') + '>' + padTime(m) + '</option>';
            }).join('');
        };

        content = '<h2 style="color:var(--accent);margin-bottom:8px">Set Your Schedule</h2>' +
            '<p style="font-size:14px;margin-bottom:20px">When should we remind you to breathe?</p>' +
            '<div style="text-align:left;max-width:360px;margin:0 auto">' +
                '<div class="settings-group">' +
                    '<label class="settings-label">Active Hours Start</label>' +
                    '<div class="time-selects">' +
                        '<select id="obStartHour" class="time-select">' + hourOpts(s.startHour) + '</select>' +
                        '<span style="color:var(--accent);font-size:20px">:</span>' +
                        '<select id="obStartMin" class="time-select">' + minOpts(s.startMin) + '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="settings-group">' +
                    '<label class="settings-label">Active Hours End</label>' +
                    '<div class="time-selects">' +
                        '<select id="obEndHour" class="time-select">' + hourOpts(s.endHour) + '</select>' +
                        '<span style="color:var(--accent);font-size:20px">:</span>' +
                        '<select id="obEndMin" class="time-select">' + minOpts(s.endMin) + '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="settings-group">' +
                    '<label class="settings-label">Reminder Frequency</label>' +
                    '<input type="range" id="obFreqSlider" min="0" max="' + (FREQ_PRESETS.length-1) + '" value="' + freqIdx + '" oninput="document.getElementById(\'obFreqLabel\').textContent=FREQ_PRESETS[parseInt(this.value)][2]" class="freq-slider">' +
                    '<div class="freq-labels"><span>More often</span><span>Less often</span></div>' +
                    '<div id="obFreqLabel" class="freq-value">' + FREQ_PRESETS[freqIdx][2] + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="button-group" style="margin-top:16px">' +
                '<button class="btn btn-secondary" onclick="onboardingBack()">← Back</button>' +
                '<button class="btn btn-primary" onclick="onboardingNext()">Next →</button>' +
            '</div>';
    }

    else if (step === 3) {
        var pattern = getPattern(onboardingPatternId);

        if (state.demoRunning) {
            var phase = state.activePhase;
            var maxDur = Math.min(phase.duration, 2);
            var countdown = Math.ceil(maxDur - state.phaseTimer);
            content = '<h2 style="color:var(--accent);margin-bottom:16px">Quick Demo</h2>' +
                '<div class="breathing-circle-container" style="width:200px;height:200px">' +
                    '<div class="breathing-circle" style="transform:scale(' + getCircleScale() + ')"></div>' +
                    '<div class="breathing-text">' +
                        '<div class="phase-label" style="font-size:24px">' + phase.name + '</div>' +
                        '<div class="phase-countdown" style="font-size:48px">' + countdown + '</div>' +
                    '</div>' +
                '</div>' +
                '<p style="font-size:14px;margin-top:8px">' + pattern.name + ' (' + pattern.shortName + ') · Demo</p>' +
                '<button class="btn btn-secondary" style="margin-top:16px" onclick="stopOnboardingDemo()">Stop Demo</button>';
        }
        else if (state.demoComplete) {
            content = '<div class="ob-icon">✅</div>' +
                '<h2 style="color:var(--accent);font-size:24px;margin-bottom:16px">You\'re All Set!</h2>' +
                '<p style="font-size:15px;max-width:300px;margin:0 auto 8px">Great! That was the ' + pattern.name + ' pattern. Full sessions use the real timing.</p>' +
                '<p style="font-size:13px;margin-bottom:24px">Tap below to enable notifications and start your mindful breathing journey.</p>' +
                '<button class="btn btn-primary" onclick="finishOnboarding()">Enable Reminders & Start →</button>' +
                '<button class="btn btn-secondary" style="margin-top:12px" onclick="onboardingBack()">← Back</button>';
        }
        else {
            content = '<h2 style="color:var(--accent);margin-bottom:8px">Try It Out</h2>' +
                '<p style="font-size:14px;margin-bottom:8px">Here\'s a quick demo of the <strong style="color:var(--accent)">' + pattern.name + ' (' + pattern.shortName + ')</strong> pattern.</p>' +
                '<p style="font-size:13px;color:var(--text-tertiary);margin-bottom:24px">This is a sped-up single cycle so you can get a feel for it.</p>' +
                '<div class="breathing-circle-container" style="width:200px;height:200px;opacity:0.4">' +
                    '<div class="breathing-circle" style="transform:scale(0.75)"></div>' +
                    '<div class="breathing-text">' +
                        '<div class="phase-label" style="font-size:24px">Ready?</div>' +
                    '</div>' +
                '</div>' +
                '<button class="btn btn-primary" style="margin-top:24px" onclick="startOnboardingDemo()">▶ Start Demo</button>' +
                '<div class="button-group" style="margin-top:16px">' +
                    '<button class="btn btn-secondary" onclick="onboardingBack()">← Back</button>' +
                    '<button class="btn btn-secondary" onclick="finishOnboarding()">Skip →</button>' +
                '</div>';
        }
    }

    appContent.innerHTML = '<div style="width:100%;max-width:500px">' + content +
        '<div class="ob-dots" style="margin-top:32px">' + dots + '</div></div>';
}

// ─── Render: Main ─────────────────────────────────────────────────────────────

function renderMain() {
    if (state.celebration) {
        appContent.innerHTML = '<div class="notification-card" style="border-color:var(--accent)">' +
            '<h2 style="font-size:28px">' + state.celebration + '</h2>' +
            '<p>Keep up the amazing work!</p>' +
            '<button class="btn btn-primary" onclick="dismissCelebration()">Thanks! 🙏</button></div>';
        return;
    }
    if (state.isExercising) {
        var phase = state.activePhase;
        var countdown = Math.ceil(phase.duration - state.phaseTimer);
        var pattern = getSelectedPattern();
        var sound = AMBIENT_SOUNDS.find(function(s) { return s.id === state.settings.soundId; });
        appContent.innerHTML = '<div class="breathing-circle-container">' +
            '<div class="breathing-circle" style="transform:scale(' + getCircleScale() + ')"></div>' +
            '<div class="breathing-text">' +
                '<div class="phase-label">' + phase.name + '</div>' +
                '<div class="phase-countdown">' + countdown + '</div>' +
            '</div></div>' +
            '<div class="progress-info">' +
                '<div class="cycle-info">Cycle ' + state.cycle + ' of ' + state.totalCycles + '</div>' +
                '<div class="time-info">' + formatTime(state.totalTimer) + ' / ' + formatTime(state.totalDuration) + '</div>' +
                '<div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">' + pattern.name + ' (' + pattern.shortName + ')' + (sound && sound.id !== 'none' ? ' · ' + sound.icon : '') + '</div>' +
            '</div>' +
            '<button class="btn btn-secondary" onclick="stopExercise()">Stop Exercise</button>';
        return;
    }
    if (state.showNotification) {
        appContent.innerHTML = '<div class="notification-card">' +
            '<h2>Time for a breath?</h2>' +
            '<p>Shall we do some autonomic nervous system regulation?</p>' +
            '<div class="button-group">' +
                '<button class="btn btn-primary" onclick="startExercise()">▶ Yes</button>' +
                '<button class="btn btn-secondary" onclick="dismissNotification()">✕ Not now</button>' +
            '</div></div>';
        return;
    }
    if (!state.notificationsEnabled) {
        var iosMsg = '';
        if (isIOS()) {
            iosMsg = '<div style="background:var(--card-bg);border:1px solid var(--accent-dim);border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;font-size:13px">' +
                '<div style="color:var(--accent);font-weight:600;margin-bottom:8px">📱 iPhone Users</div>' +
                '<p style="margin-bottom:8px;font-size:13px">For the best experience, add this app to your Home Screen:</p>' +
                '<p style="margin-bottom:4px;font-size:13px">1. Tap the <strong style="color:var(--text)">Share</strong> button (📤)</p>' +
                '<p style="margin-bottom:4px;font-size:13px">2. Scroll down and tap <strong style="color:var(--text)">Add to Home Screen</strong></p>' +
                '<p style="margin-bottom:8px;font-size:13px">3. Open from your Home Screen</p>' +
                '<p style="font-size:12px;color:var(--text-tertiary)">The app will still remind you when it\'s open, even without this step.</p>' +
            '</div>';
        }

        appContent.innerHTML = '<div class="idle-icon">🔔</div>' +
            '<h2>Enable Reminders</h2>' +
            '<p>Get mindful breathing reminders during your active hours.</p>' +
            iosMsg +
            '<button class="btn btn-primary" onclick="enableNotifications()">Enable Reminders</button>';
        return;
    }

    var s = state.settings;
    var streak = state.stats.currentStreak;
    var pattern = getSelectedPattern();
    var sessionLength = getSelectedSessionLength();
    var totalSecs = calcTotalDuration(pattern, sessionLength);
    var sound = AMBIENT_SOUNDS.find(function(snd) { return snd.id === s.soundId; });

    var notifMode = '';
    if (state.iosLimited) {
        notifMode = '<div style="font-size:12px;color:var(--text-tertiary);margin-top:-8px;margin-bottom:12px">📱 Reminders show when app is open · Add to Home Screen for background alerts</div>';
    } else if (!state.fcmAvailable && !state.pushSupported) {
        notifMode = '<div style="font-size:12px;color:var(--text-tertiary);margin-top:-8px;margin-bottom:12px">Reminders show when app is open · Keep the tab active for best results</div>';
    }

    appContent.innerHTML = '<div class="idle-icon">🔔</div>' +
        '<h2>All Set!</h2>' +
        '<p>Reminders active between ' + fmtHour(s.startHour,s.startMin) + ' and ' + fmtHour(s.endHour,s.endMin) + '.</p>' +
        '<p style="font-size:13px;color:var(--accent);margin-top:-12px">' + FREQ_PRESETS[getCurrentFreqIndex()][2] + '</p>' +
        notifMode +
        '<div class="current-program">' +
            '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:4px">' + pattern.name + ' (' + pattern.shortName + ')</div>' +
            '<div style="font-size:13px;color:var(--text-tertiary)">' + sessionLength.name + ' · ' + sessionLength.cycles + ' cycles · ' + formatDuration(totalSecs) + (sound && sound.id !== 'none' ? ' · ' + sound.icon + ' ' + sound.name : '') + '</div>' +
        '</div>' +
        (streak > 0 ? '<p style="font-size:14px;color:var(--accent);margin-top:0">🔥 ' + streak + ' day streak!</p>' : '') +
        '<button class="btn btn-primary" onclick="startExercise()" style="margin-top:8px">▶ Start Practice Now</button>' +
        '<button class="btn btn-secondary" style="margin-top:12px" onclick="disableNotifications()">Turn Off Reminders</button>';
}

// ─── Render: Stats ────────────────────────────────────────────────────────────

function renderStats() {
    var totalSessions = state.stats.totalSessions;
    var currentStreak = state.stats.currentStreak;
    var longestStreak = state.stats.longestStreak;
    var days = [];
    for (var i = 6; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var str = d.toISOString().split('T')[0];
        days.push({ lbl: d.toLocaleDateString('en',{weekday:'short'}).charAt(0), done: state.stats.sessionDates.includes(str) });
    }
    var calHtml = days.map(function(d) {
        return '<div class="cal-day"><div class="cal-dot ' + (d.done?'cal-dot-done':'') + '"></div><div class="cal-label">' + d.lbl + '</div></div>';
    }).join('');
    var nextSM = SESSION_MILESTONES.find(function(m) { return m[0] > totalSessions; });
    var nextStrM = STREAK_MILESTONES.find(function(m) { return m[0] > currentStreak; });

    appContent.innerHTML = '<div style="width:100%;max-width:500px;text-align:left">' +
        '<div class="screen-header"><button class="back-btn" onclick="goBack()">← Back</button><h2>Your Stats</h2></div>' +
        '<div class="stats-grid">' +
            '<div class="stat-card"><div class="stat-value">' + totalSessions + '</div><div class="stat-label">Total Sessions</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + sessionsToday() + '</div><div class="stat-label">Today</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + sessionsThisWeek() + '</div><div class="stat-label">This Week</div></div>' +
            '<div class="stat-card"><div class="stat-value">🔥 ' + currentStreak + '</div><div class="stat-label">Current Streak</div></div>' +
            '<div class="stat-card" style="grid-column:span 2"><div class="stat-value">⭐ ' + longestStreak + '</div><div class="stat-label">Longest Streak Ever</div></div>' +
        '</div>' +
        '<h3 style="color:var(--accent);margin:24px 0 12px">Last 7 Days</h3>' +
        '<div class="calendar-row">' + calHtml + '</div>' +
        (nextSM ? '<h3 style="color:var(--accent);margin:24px 0 8px">Next Milestones</h3>' +
            '<div class="milestone-bar-wrap">' +
                '<div class="milestone-label"><span>' + totalSessions + ' sessions</span><span>' + nextSM[0] + ' sessions</span></div>' +
                '<div class="milestone-bar"><div class="milestone-fill" style="width:' + Math.min(100,(totalSessions/nextSM[0])*100) + '%"></div></div>' +
                '<p style="font-size:12px;color:var(--text-tertiary);margin-top:4px">' + (nextSM[0]-totalSessions) + ' sessions until next milestone</p>' +
            '</div>' : '<p style="color:var(--accent);margin-top:24px">🏆 All session milestones reached!</p>') +
        (nextStrM ? '<div class="milestone-bar-wrap" style="margin-top:16px">' +
                '<div class="milestone-label"><span>🔥 ' + currentStreak + ' days</span><span>' + nextStrM[0] + ' days</span></div>' +
                '<div class="milestone-bar"><div class="milestone-fill" style="width:' + Math.min(100,(currentStreak/nextStrM[0])*100) + '%"></div></div>' +
                '<p style="font-size:12px;color:var(--text-tertiary);margin-top:4px">' + (nextStrM[0]-currentStreak) + ' more days to next streak milestone</p>' +
            '</div>' : '') +
        '</div>';
}

// ─── Render: Settings ─────────────────────────────────────────────────────────

function renderSettings() {
    var s = state.settings;
    var freqIdx = getCurrentFreqIndex();
    var hourOpts = function(sel) {
        return Array.from({length:24}, function(_,i) {
            return '<option value="' + i + '" ' + (i===sel?'selected':'') + '>' + padTime(i) + '</option>';
        }).join('');
    };
    var minOpts = function(sel) {
        return [0,15,30,45].map(function(m) {
            return '<option value="' + m + '" ' + (m===sel?'selected':'') + '>' + padTime(m) + '</option>';
        }).join('');
    };

    var themeCards = THEMES.map(function(t) {
        var sel = t.id === settingsThemeId;
        return '<div class="option-card option-card-small ' + (sel ? 'option-card-selected' : '') + '" onclick="selectTheme(\'' + t.id + '\')">' +
            '<div class="theme-preview">' +
                '<span class="theme-swatch" style="background:' + t.preview[0] + ';border:1px solid ' + t.accent + '"></span>' +
                '<span class="theme-swatch" style="background:' + t.accent + '"></span>' +
            '</div>' +
            '<div class="option-card-name">' + t.name + '</div></div>';
    }).join('');

    var patternCards = BREATHING_PATTERNS.map(function(p) {
        var sel = p.id === settingsPatternId;
        var cycleSecs = calcCycleDuration(p);
        return '<div class="option-card ' + (sel ? 'option-card-selected' : '') + '" onclick="selectPattern(\'' + p.id + '\')">' +
            '<div class="option-card-name">' + p.name + '</div>' +
            '<div class="option-card-detail">' + p.shortName + ' · ' + cycleSecs + 's/cycle</div>' +
            '<div class="option-card-desc">' + p.description + '</div></div>';
    }).join('');

    var selectedPattern = getPattern(settingsPatternId);
    var lengthCards = SESSION_LENGTHS.map(function(l) {
        var sel = l.id === settingsLengthId;
        var totalSecs = calcTotalDuration(selectedPattern, l);
        return '<div class="option-card option-card-small ' + (sel ? 'option-card-selected' : '') + '" onclick="selectLength(\'' + l.id + '\')">' +
            '<div class="option-card-name">' + l.name + '</div>' +
            '<div class="option-card-detail">' + l.cycles + ' cycles · ' + formatDuration(totalSecs) + '</div></div>';
    }).join('');

    var soundCards = AMBIENT_SOUNDS.map(function(snd) {
        var sel = snd.id === settingsSoundId;
        var previewBtn = snd.id !== 'none'
            ? '<span class="sound-preview" onclick="previewSound(\'' + snd.id + '\', event)" title="Preview">▶</span>'
            : '';
        return '<div class="option-card option-card-small ' + (sel ? 'option-card-selected' : '') + '" onclick="selectSound(\'' + snd.id + '\')" style="position:relative">' +
            '<div style="font-size:24px;margin-bottom:4px">' + snd.icon + '</div>' +
            '<div class="option-card-name">' + snd.name + '</div>' +
            previewBtn + '</div>';
    }).join('');

    appContent.innerHTML = '<div style="width:100%;max-width:500px">' +
        '<div class="screen-header"><button class="back-btn" onclick="cancelSettings()">← Back</button><h2>Settings</h2></div>' +

        '<div class="settings-group">' +
            '<label class="settings-label">Visual Theme</label>' +
            '<div class="option-grid-row">' + themeCards + '</div></div>' +

        '<div class="settings-group">' +
            '<label class="settings-label">Breathing Pattern</label>' +
            '<div class="option-grid">' + patternCards + '</div></div>' +

        '<div class="settings-group">' +
            '<label class="settings-label">Session Length</label>' +
            '<div class="option-grid-row">' + lengthCards + '</div></div>' +

        '<div class="settings-group">' +
            '<label class="settings-label">Ambient Sound</label>' +
            '<div class="option-grid-row option-grid-row-5">' + soundCards + '</div></div>' +

        '<div class="settings-group">' +
            '<label class="settings-label">Active Hours Start</label>' +
            '<div class="time-selects">' +
                '<select id="startHour" class="time-select">' + hourOpts(s.startHour) + '</select>' +
                '<span style="color:var(--accent);font-size:20px">:</span>' +
                '<select id="startMin" class="time-select">' + minOpts(s.startMin) + '</select>' +
            '</div></div>' +
        '<div class="settings-group">' +
            '<label class="settings-label">Active Hours End</label>' +
            '<div class="time-selects">' +
                '<select id="endHour" class="time-select">' + hourOpts(s.endHour) + '</select>' +
                '<span style="color:var(--accent);font-size:20px">:</span>' +
                '<select id="endMin" class="time-select">' + minOpts(s.endMin) + '</select>' +
            '</div></div>' +
        '<div class="settings-group">' +
            '<label class="settings-label">Reminder Frequency</label>' +
            '<input type="range" id="freqSlider" min="0" max="' + (FREQ_PRESETS.length-1) + '" value="' + freqIdx + '" oninput="onFreqSliderChange(this.value)" class="freq-slider">' +
            '<div class="freq-labels"><span>More often</span><span>Less often</span></div>' +
            '<div id="freqLabel" class="freq-value">' + FREQ_PRESETS[freqIdx][2] + '</div></div>' +

        '<div style="margin-top:32px;text-align:center">' +
            '<button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>' +
        '</div></div>';
}

// ─── Render: About ────────────────────────────────────────────────────────────

function renderAbout() {
    appContent.innerHTML = '<div style="width:100%;max-width:500px;text-align:left">' +
        '<div class="screen-header"><button class="back-btn" onclick="goBack()">← Back</button><h2>Mindful Breathing</h2></div>' +
        '<p style="color:var(--text-tertiary);font-size:13px;margin-bottom:24px;margin-top:-16px">Version 1.4 &nbsp;·&nbsp; EvolveChain Apps</p>' +
        '<h3 style="color:var(--accent);margin-bottom:8px">About</h3>' +
        '<p>Mindful Breathing helps you regulate your autonomic nervous system through guided breathing exercises. The app sends gentle reminders throughout your day, prompting you to pause and breathe.</p>' +
        '<h3 style="color:var(--accent);margin-top:24px;margin-bottom:8px">Breathing Patterns</h3>' +
        '<p><strong style="color:var(--text)">Calm (4-4-8):</strong> Inhale 4s, hold 4s, exhale 8s. The extended exhale activates your parasympathetic nervous system for deep relaxation.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Classic Box (4-4-4-4):</strong> Equal phases of 4 seconds each, including a hold after exhale. Great for focus and balance.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Relaxing (4-7-8):</strong> Dr. Andrew Weil\'s technique. The long hold and extended exhale promote calm and help with sleep.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Energizing (6-6):</strong> Deep rhythmic breathing with no holds. Increases oxygen flow for alertness and energy.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Extended Calm (5-5-10):</strong> A slower, deeper version of the calm pattern for profound relaxation.</p>' +
        '<h3 style="color:var(--accent);margin-top:24px;margin-bottom:8px">Ambient Sounds</h3>' +
        '<p>Choose from Rain, Ocean Waves, Forest, or White Noise to play during your breathing exercises. Sounds are generated using your device\'s audio system and require no downloads.</p>' +
        '<h3 style="color:var(--accent);margin-top:24px;margin-bottom:8px">How to Use</h3>' +
        '<p>Enable reminders and the app will prompt you at random intervals throughout your chosen active hours. When a reminder arrives, tap Yes to begin a guided breathing session, or Not Now to dismiss it.</p>' +
        '<p style="margin-top:8px">Choose your preferred breathing pattern, session length, ambient sound, and visual theme in Settings. Complete a full session to record it in your stats and maintain your streak.</p>' +
        '<h3 style="color:var(--accent);margin-top:24px;margin-bottom:8px">Privacy Policy</h3>' +
        '<p>Mindful Breathing is developed by EvolveChain Apps. We are committed to protecting your privacy.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Data collection:</strong> This app does not collect, store, or transmit any personal data. All settings and preferences are stored locally on your device only.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Notifications:</strong> Notification permissions are used solely to deliver breathing reminders. No notification content is transmitted to any server.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Third parties:</strong> This app does not use any third-party analytics, advertising, or tracking services.</p>' +
        '<p style="margin-top:8px"><strong style="color:var(--text)">Changes:</strong> Any future changes to this privacy policy will be reflected in an updated version of the app.</p>' +
        '</div>';
}

// ─── In-App Reminder Check ────────────────────────────────────────────────────

function checkReminderTimer() {
    if (state.isExercising || state.demoRunning || state.showNotification) return;
    if (state.screen !== 'main') return;
    if (!state.notificationsEnabled || !state.nextNotificationTime) return;

    // If the scheduled time has passed and we're in waking hours, show the prompt
    if (Date.now() >= state.nextNotificationTime && isWakingHours()) {
        state.showNotification = true;
        state.nextNotificationTime = null;
        render();
    }
}

setInterval(function() {
    if (!state.isExercising && !state.demoRunning) {
        checkReminderTimer();
        render();
    }
}, 5000);

init();
