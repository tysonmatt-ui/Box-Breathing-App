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
let notificationTimeout = null;
let swRegistration = null;

// DOM element
const appContent = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// Initialize app
async function init() {
    // Register service worker and store registration
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('sw.js');
            await navigator.serviceWorker.ready;
        } catch (err) {
            console.log('Service Worker registration failed:', err);
        }
    }
    
    loadState();
    if (state.notificationsEnabled) {
        scheduleNextNotification();
    }
    render();
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('breathingAppState', JSON.stringify({
        notificationsEnabled: state.notificationsEnabled,
        nextNotificationTime: state.nextNotificationTime
    }));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('breathingAppState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.notificationsEnabled = parsed.notificationsEnabled || false;
        state.nextNotificationTime = parsed.nextNotificationTime || null;
    }
}

// Check if current time is within waking hours (7:00 - 21:30)
function isWakingHours() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    const startTime = 7 * 60;
    const endTime = 21 * 60 + 30;
    return currentTime >= startTime && currentTime <= endTime;
}

// Send notification via Service Worker
async function sendNotification(title, body, tag) {
    if (!swRegistration) {
        return false;
    }
    
    try {
        await swRegistration.showNotification(title, {
            body: body,
            tag: tag,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });
        return true;
    } catch (e) {
        console.error('Error sending notification:', e);
        return false;
    }
}

// Request notification permission
async function enableNotifications() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported in this browser.');
        return;
    }
    
    if (!swRegistration) {
        alert('Please wait a moment and try again.');
        return;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();
        scheduleNextNotification();
        render();
    } else {
        alert('Notifications were blocked. Please enable them in Chrome settings.');
    }
}

// Schedule next notification - 70-130 minutes
function scheduleNextNotification() {
    const minMinutes = 70;
    const maxMinutes = 130;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    state.nextNotificationTime = Date.now() + (randomMinutes * 60 * 1000);
    saveState();
    
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    notificationTimeout = setTimeout(() => {
        checkAndShowNotification();
    }, randomMinutes * 60 * 1000);
    
    render();
}

// Show notification if within waking hours
async function checkAndShowNotification() {
    const wakingHours = isWakingHours();
    
    if (wakingHours) {
        state.showNotification = true;
        
        if (Notification.permission === 'granted' && swRegistration) {
            await sendNotification(
                'Mindful Breathing',
                'Shall we do some autonomic nervous system regulation?',
                'breathing-reminder'
            );
        }
        
        render();
    }
    
    scheduleNextNotification();
}

// Start breathing exercise
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
            currentPhase = 'hold';
            phaseTime = 0;
            state.phase = 'hold';
            state.phaseTimer = 0;
        } else if (currentPhase === 'hold' && phaseTime >= 4) {
            currentPhase = 'exhale';
            phaseTime = 0;
            state.phase = 'exhale';
            state.phaseTimer = 0;
        } else if (currentPhase === 'exhale' && phaseTime >= 8) {
            if (currentCycle < 4) {
                currentCycle += 1;
                currentPhase = 'inhale';
                phaseTime = 0;
                state.cycle = currentCycle;
                state.phase = 'inhale';
                state.phaseTimer = 0;
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

// Stop exercise
function stopExercise() {
    if (exerciseInterval) {
        clearInterval(exerciseInterval);
    }
    state.isExercising = false;
    render();
}

// Dismiss notification
function dismissNotification() {
    state.showNotification = false;
    scheduleNextNotification();
    render();
}

// Get circle scale based on phase
function getCircleScale() {
    if (state.phase === 'inhale') {
        return 0.5 + (state.phaseTimer / 4) * 0.5;
    } else if (state.phase === 'hold') {
        return 1;
    } else {
        return 1 - (state.phaseTimer / 8) * 0.5;
    }
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get next notification text
function getNextNotificationText() {
    if (!state.nextNotificationTime) return '';
    const minutesUntil = Math.floor((state.nextNotificationTime - Date.now()) / 60000);
    if (minutesUntil < 1) return 'Less than a minute';
    return `~${minutesUntil} minutes`;
}

// Render app
function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    if (state.notificationsEnabled && state.nextNotificationTime) {
        nextReminder.textContent = `Next reminder in ${getNextNotificationText()}`;
    } else {
        nextReminder.textContent = '';
    }
    
    if (!state.notificationsEnabled && !state.isExercising && !state.showNotification) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>Enable Reminders</h2>
            <p>Allow notifications to receive mindful breathing reminders throughout your day (7:00 AM - 9:30 PM)</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>
        `;
    } else if (state.showNotification) {
        appContent.innerHTML = `
            <div class="notification-card">
                <h2>Time for a breath?</h2>
                <p>Shall we do some autonomic nervous system regulation?</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="startExercise()">▶ Yes</button>
                    <button class="btn btn-secondary" onclick="dismissNotification()">✕ Not now</button>
                </div>
            </div>
        `;
    } else if (state.isExercising) {
        const phaseLabel = state.phase === 'inhale' ? 'Breathe In' : 
                          state.phase === 'hold' ? 'Hold' : 'Breathe Out';
        const phaseMax = state.phase === 'inhale' ? 4 : 
                        state.phase === 'hold' ? 4 : 8;
        const countdown = Math.ceil(phaseMax - state.phaseTimer);
        const scale = getCircleScale();
        
        appContent.innerHTML = `
            <div class="breathing-circle-container">
                <div class="breathing-circle" style="transform: scale(${scale})"></div>
                <div class="breathing-text">
                    <div class="phase-label">${phaseLabel}</div>
                    <div class="phase-countdown">${countdown}</div>
                </div>
            </div>
            <div class="progress-info">
                <div class="cycle-info">Cycle ${state.cycle} of 4</div>
                <div class="time-info">${formatTime(state.totalTimer)} / 1:04</div>
            </div>
            <button class="btn btn-secondary" onclick="stopExercise()">Stop Exercise</button>
        `;
    } else if (state.notificationsEnabled) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>All Set!</h2>
            <p>You'll receive reminders to practice mindful breathing throughout your waking hours.</p>
            <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>
        `;
    }
}

// Update countdown every 30 seconds when not exercising
setInterval(() => {
    if (state.notificationsEnabled && !state.isExercising) {
        render();
    }
}, 30000);

// Initialize on load
init();
