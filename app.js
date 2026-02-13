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
    diagnostics: {
        lastInit: null,
        timerScheduled: false,
        timeoutId: null,
        swReady: false,
        permissionStatus: null
    }
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
    state.diagnostics.lastInit = new Date().toISOString();
    
    // Register service worker and store registration
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('sw.js');
            await navigator.serviceWorker.ready;
            state.diagnostics.swReady = true;
        } catch (err) {
            console.log('Service Worker registration failed:', err);
            state.diagnostics.swReady = false;
        }
    }
    
    loadState();
    state.diagnostics.permissionStatus = Notification.permission;
    
    if (state.notificationsEnabled) {
        // Check if we already have a scheduled notification
        if (state.nextNotificationTime && state.nextNotificationTime > Date.now()) {
            // Notification is still in the future, reschedule it
            const timeUntilNotification = state.nextNotificationTime - Date.now();
            notificationTimeout = setTimeout(() => {
                checkAndShowNotification();
            }, timeUntilNotification);
            state.diagnostics.timerScheduled = true;
            state.diagnostics.timeoutId = notificationTimeout;
        } else {
            // No valid scheduled time, create a new one
            scheduleNextNotification();
        }
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

// Reset everything
function resetApp() {
    if (confirm('This will clear all settings and timers. Continue?')) {
        localStorage.removeItem('breathingAppState');
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        state.notificationsEnabled = false;
        state.nextNotificationTime = null;
        state.diagnostics.timerScheduled = false;
        state.diagnostics.timeoutId = null;
        alert('App reset! Reload the page.');
        location.reload();
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
    state.diagnostics.permissionStatus = permission;
    
    if (permission === 'granted') {
        state.notificationsEnabled = true;
        saveState();
        
        // Send test notification immediately
        await sendNotification(
            'Test - Notifications Working!',
            'Your next reminder will arrive in 70-130 minutes.',
            'test'
        );
        
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
    
    state.diagnostics.timerScheduled = true;
    state.diagnostics.timeoutId = notificationTimeout;
    
    render();
}

// Show notification if within waking hours
async function checkAndShowNotification() {
    const now = new Date();
    const wakingHours = isWakingHours();
    
    // Log when this fires
    console.log('🔔 checkAndShowNotification fired at:', now.toLocaleTimeString());
    console.log('Waking hours:', wakingHours);
    console.log('Permission:', Notification.permission);
    console.log('SW Registration:', !!swRegistration);
    
    // ALWAYS show the in-app notification card for testing
    state.showNotification = true;
    render();
    
    if (wakingHours) {
        if (Notification.permission === 'granted' && swRegistration) {
            console.log('Attempting to send notification...');
            const success = await sendNotification(
                'Mindful Breathing',
                'Shall we do some autonomic nervous system regulation?',
                'breathing-reminder'
            );
            console.log('Notification sent:', success);
        } else {
            console.log('Cannot send notification - permission or SW missing');
        }
    } else {
        console.log('Outside waking hours - notification suppressed but in-app card shown');
    }
    
    // Don't schedule next one yet - let user dismiss first
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
    console.log('Notification dismissed by user');
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
    if (!state.nextNotificationTime) return 'Not scheduled';
    const minutesUntil = Math.floor((state.nextNotificationTime - Date.now()) / 60000);
    if (minutesUntil < 0) return 'Overdue!';
    if (minutesUntil < 1) return 'Less than a minute';
    return `~${minutesUntil} minutes`;
}

// Get diagnostic info
function getDiagnosticInfo() {
    const now = Date.now();
    const nextTime = state.nextNotificationTime;
    const timeUntil = nextTime ? Math.floor((nextTime - now) / 1000) : null;
    const currentTime = new Date();
    
    return `
        <div style="background: #1f2937; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 11px; font-family: monospace; text-align: left;">
            <strong style="color: #ca8a04;">DIAGNOSTICS:</strong><br>
            Current Time: ${currentTime.toLocaleTimeString()}<br>
            Notifications Enabled: ${state.notificationsEnabled ? '✅' : '❌'}<br>
            Permission: ${state.diagnostics.permissionStatus}<br>
            Service Worker Ready: ${state.diagnostics.swReady ? '✅' : '❌'}<br>
            Timer Scheduled: ${state.diagnostics.timerScheduled ? '✅' : '❌'}<br>
            Timeout ID: ${state.diagnostics.timeoutId || 'None'}<br>
            Next Notification: ${nextTime ? new Date(nextTime).toLocaleTimeString() : 'None'}<br>
            Time Until (seconds): ${timeUntil !== null ? timeUntil : 'N/A'}<br>
            Last Init: ${state.diagnostics.lastInit ? new Date(state.diagnostics.lastInit).toLocaleTimeString() : 'Never'}<br>
            Is Waking Hours: ${isWakingHours() ? '✅ YES' : '❌ NO (outside 7am-9:30pm)'}<br>
            <br>
            <strong style="color: #ca8a04;">WHAT TO WATCH:</strong><br>
            When countdown hits 0, you should see an in-app card<br>
            saying "Time for a breath?" Check console for logs.
        </div>
    `;
}

// Render app
function render() {
    notificationIcon.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    if (state.notificationsEnabled && state.nextNotificationTime) {
        nextReminder.textContent = `Next reminder in ${getNextNotificationText()}`;
    } else {
        nextReminder.textContent = state.notificationsEnabled ? 'No reminder scheduled' : '';
    }
    
    if (!state.notificationsEnabled && !state.isExercising && !state.showNotification) {
        appContent.innerHTML = `
            <div class="idle-icon">🔔</div>
            <h2>Enable Reminders (Diagnostic Mode)</h2>
            <p>This version shows diagnostic information to help troubleshoot notification issues.</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>
            <button class="btn btn-secondary" onclick="resetApp()" style="margin-top: 12px;">Reset App</button>
            ${getDiagnosticInfo()}
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
            ${getDiagnosticInfo()}
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
            <h2>Diagnostic Mode Active</h2>
            <p>Watch the diagnostic panel below to see if the timer is working correctly.</p>
            <button class="btn btn-primary" onclick="startExercise()">▶ Start Practice Now</button>
            <button class="btn btn-secondary" onclick="resetApp()" style="margin-top: 12px;">Reset App</button>
            ${getDiagnosticInfo()}
        `;
    }
}

// Update every 5 seconds to show live diagnostics
setInterval(() => {
    if (!state.isExercising) {
        render();
    }
}, 5000);

// Initialize on load
init();
