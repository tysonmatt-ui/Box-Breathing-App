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

// DOM element
const appContent = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// Initialize app
function init() {
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

// Request notification permission
async function enableNotifications() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            state.notificationsEnabled = true;
            saveState();
            scheduleNextNotification();
            render();
        } else {
            alert('Notifications were blocked. Please enable them in Chrome settings.');
        }
    } else {
        alert('Notifications are not supported in this browser.');
    }
}

// Schedule next notification - SHORTENED TO 2 MINUTES FOR TESTING
function scheduleNextNotification() {
    // TEST MODE: 2 minutes instead of 70-130 minutes
    const minMinutes = 2;
    const maxMinutes = 2;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    state.nextNotificationTime = Date.now() + (randomMinutes * 60 * 1000);
    saveState();
    
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    console.log(`Next notification scheduled in ${randomMinutes} minutes`);
    
    notificationTimeout = setTimeout(() => {
        console.log('Notification timeout fired!');
        checkAndShowNotification();
    }, randomMinutes * 60 * 1000);
    
    render();
}

// Show notification if within waking hours
function checkAndShowNotification() {
    console.log('Checking if should show notification...');
    console.log('Is waking hours?', isWakingHours());
    
    if (isWakingHours()) {
        state.showNotification = true;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            console.log('Sending notification...');
            const notification = new Notification('Mindful Breathing - TEST', {
                body: 'Shall we do some autonomic nervous system regulation?',
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                tag: 'breathing-reminder',
                requireInteraction: true
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } else {
            console.log('Notification permission not granted');
        }
        
        render();
    } else {
        console.log('Outside waking hours, skipping notification');
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
        
        // Phase transitions
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
    const secondsUntil = Math.floor((state.nextNotificationTime - Date.now()) / 1000);
    if (secondsUntil < 60) return `${secondsUntil} seconds`;
    const minutesUntil = Math.floor(secondsUntil / 60);
    if (minutesUntil < 1) return 'Less than a minute';
    return `${minutesUntil} minutes`;
}

// Render app
function render() {
    // Update header
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    if (state.notificationsEnabled && state.nextNotificationTime) {
        nextReminder.textContent = `TEST MODE: Next reminder in ${getNextNotificationText()}`;
    } else {
        nextReminder.textContent = '';
    }
    
    // Render main content
    if (!state.notificationsEnabled && !state.isExercising && !state.showNotification) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>Enable Reminders (TEST MODE)</h2>
            <p>This is a test version with 2-minute reminders instead of 70-130 minutes. Allow notifications to test if they work.</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>
        `;
    } else if (state.showNotification) {
        appContent.innerHTML = `
            <div class="notification-card">
                <h2>Time for a breath? (TEST)</h2>
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
            <h2>Test Mode Active!</h2>
            <p>You'll receive a reminder in ~2 minutes. Keep Chrome running in the background.</p>
            <p style="font-size: 14px; color: #ca8a04; margin-top: 16px;">Check the timer at the top to see countdown.</p>
            <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>
        `;
    }
}

// Initialize on load
init();
