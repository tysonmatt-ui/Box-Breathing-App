// App state
let state = {
    notificationsEnabled: false,
    isExercising: false,
    showNotification: false,
    phase: 'inhale',
    cycle: 1,
    phaseTimer: 0,
    totalTimer: 0,
    nextNotificationTime: null,
    debugLog: []
};

let exerciseInterval = null;
let notificationTimeout = null;

// DOM element
const appContent = document.getElementById('appContent');
const nextReminder = document.getElementById('nextReminder');
const notificationIcon = document.getElementById('notificationIcon');

// Debug logging
function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${message}`;
    console.log(logMsg);
    state.debugLog.push(logMsg);
    if (state.debugLog.length > 20) state.debugLog.shift();
}

// Initialize app
function init() {
    log('App initialized');
    loadState();
    if (state.notificationsEnabled) {
        log('Notifications already enabled, scheduling next one');
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
    log('State saved to localStorage');
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('breathingAppState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.notificationsEnabled = parsed.notificationsEnabled || false;
        state.nextNotificationTime = parsed.nextNotificationTime || null;
        log('State loaded from localStorage');
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
    const result = currentTime >= startTime && currentTime <= endTime;
    log(`Waking hours check: ${result} (current time: ${hours}:${minutes})`);
    return result;
}

// Request notification permission
async function enableNotifications() {
    log('Requesting notification permission...');
    
    if (!('Notification' in window)) {
        log('ERROR: Notifications not supported in this browser');
        alert('Notifications are not supported in this browser.');
        return;
    }
    
    log(`Current permission status: ${Notification.permission}`);
    
    const permission = await Notification.requestPermission();
    log(`Permission result: ${permission}`);
    
    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();
        
        // Send a test notification immediately
        log('Sending immediate test notification...');
        try {
            const testNotif = new Notification('Test Notification', {
                body: 'If you see this, notifications are working!',
                tag: 'test-notification'
            });
            log('Test notification sent successfully');
        } catch (e) {
            log(`ERROR sending test notification: ${e.message}`);
        }
        
        scheduleNextNotification();
        render();
    } else {
        log('Notification permission denied or dismissed');
        alert('Notifications were blocked. Please enable them in Chrome settings.');
    }
}

// Schedule next notification - 30 SECONDS FOR TESTING
function scheduleNextNotification() {
    // ULTRA SHORT TEST: 30 seconds
    const delaySeconds = 30;
    state.nextNotificationTime = Date.now() + (delaySeconds * 1000);
    saveState();
    
    if (notificationTimeout) {
        log('Clearing existing notification timeout');
        clearTimeout(notificationTimeout);
    }
    
    log(`Scheduling notification in ${delaySeconds} seconds`);
    
    notificationTimeout = setTimeout(() => {
        log('⏰ TIMEOUT FIRED! Attempting to show notification...');
        checkAndShowNotification();
    }, delaySeconds * 1000);
    
    log(`Timeout ID: ${notificationTimeout}`);
    render();
}

// Show notification if within waking hours
function checkAndShowNotification() {
    log('=== checkAndShowNotification called ===');
    const wakingHours = isWakingHours();
    
    if (wakingHours) {
        log('Within waking hours, showing notification');
        state.showNotification = true;
        
        log(`Notification permission: ${Notification.permission}`);
        
        if ('Notification' in window && Notification.permission === 'granted') {
            log('Attempting to create notification...');
            try {
                const notification = new Notification('Mindful Breathing - DEBUG', {
                    body: 'Shall we do some autonomic nervous system regulation? (30sec test)',
                    tag: 'breathing-reminder',
                    requireInteraction: true
                });
                
                notification.onclick = () => {
                    log('Notification clicked');
                    window.focus();
                    notification.close();
                };
                
                notification.onerror = (e) => {
                    log(`Notification error: ${e}`);
                };
                
                log('✅ Notification created successfully!');
            } catch (e) {
                log(`❌ ERROR creating notification: ${e.message}`);
            }
        } else {
            log(`❌ Cannot send notification. Permission: ${Notification.permission}`);
        }
        
        render();
    } else {
        log('Outside waking hours, skipping notification');
    }
    
    log('Scheduling next notification...');
    scheduleNextNotification();
}

// Start breathing exercise
function startExercise() {
    log('Starting breathing exercise');
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
                log('Exercise complete');
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
    log('Exercise stopped');
    render();
}

// Dismiss notification
function dismissNotification() {
    state.showNotification = false;
    log('Notification dismissed');
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
    if (secondsUntil < 0) return 'Overdue!';
    return `${secondsUntil} seconds`;
}

// Render app
function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    if (state.notificationsEnabled && state.nextNotificationTime) {
        nextReminder.textContent = `DEBUG: Next in ${getNextNotificationText()}`;
    } else {
        nextReminder.textContent = '';
    }
    
    if (!state.notificationsEnabled && !state.isExercising && !state.showNotification) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>Enable Notifications (30 Second Test)</h2>
            <p>This debug version will send a test notification immediately, then another in 30 seconds.</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>
            <div style="margin-top: 24px; text-align: left; background: #1f2937; padding: 16px; border-radius: 8px; max-height: 300px; overflow-y: auto;">
                <div style="font-size: 12px; color: #9ca3af; font-family: monospace;">
                    <strong>Debug Log:</strong><br>
                    ${state.debugLog.map(log => log + '<br>').join('')}
                </div>
            </div>
        `;
    } else if (state.showNotification) {
        appContent.innerHTML = `
            <div class="notification-card">
                <h2>🎉 Notification Fired!</h2>
                <p>The timeout worked! Did you also see a system notification?</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="startExercise()">▶ Yes</button>
                    <button class="btn btn-secondary" onclick="dismissNotification()">✕ Not now</button>
                </div>
            </div>
            <div style="margin-top: 24px; text-align: left; background: #1f2937; padding: 16px; border-radius: 8px; max-height: 300px; overflow-y: auto;">
                <div style="font-size: 12px; color: #9ca3af; font-family: monospace;">
                    <strong>Debug Log:</strong><br>
                    ${state.debugLog.map(log => log + '<br>').join('')}
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
            <h2>Debug Mode Active</h2>
            <p>Next notification in ~30 seconds. Watch the countdown and debug log below.</p>
            <p style="font-size: 14px; color: #ca8a04;">Keep this screen open and visible.</p>
            <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>
            <div style="margin-top: 24px; text-align: left; background: #1f2937; padding: 16px; border-radius: 8px; max-height: 300px; overflow-y: auto;">
                <div style="font-size: 12px; color: #9ca3af; font-family: monospace;">
                    <strong>Debug Log:</strong><br>
                    ${state.debugLog.map(log => log + '<br>').join('')}
                </div>
            </div>
        `;
    }
}

// Update countdown every second
setInterval(() => {
    if (state.notificationsEnabled && !state.isExercising) {
        render();
    }
}, 1000);

// Initialize on load
init();
