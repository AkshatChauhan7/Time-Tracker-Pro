import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import AiCoachModal from './AiCoachModal';

// --- Enhanced Settings Modal Component ---
const SettingsModal = ({ settings, onSave, onCancel }) => {
  const [localSettings, setLocalSettings] = useState({
    work: settings.work / 60000,
    shortBreak: settings.shortBreak / 60000,
    longBreak: settings.longBreak / 60000,
    sessionsPerLongBreak: settings.sessionsPerLongBreak || 4,
    autoStartBreaks: settings.autoStartBreaks !== undefined ? settings.autoStartBreaks : true,
    autoStartPomodoros: settings.autoStartPomodoros !== undefined ? settings.autoStartPomodoros : false,
    soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
    desktopNotifications: settings.desktopNotifications !== undefined ? settings.desktopNotifications : true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : parseInt(value, 10) 
    }));
  };

  const handleSave = () => {
    onSave({
      work: localSettings.work * 60000,
      shortBreak: localSettings.shortBreak * 60000,
      longBreak: localSettings.longBreak * 60000,
      sessionsPerLongBreak: localSettings.sessionsPerLongBreak,
      autoStartBreaks: localSettings.autoStartBreaks,
      autoStartPomodoros: localSettings.autoStartPomodoros,
      soundEnabled: localSettings.soundEnabled,
      desktopNotifications: localSettings.desktopNotifications,
    });
  };

  const resetToDefaults = () => {
    setLocalSettings({
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsPerLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      soundEnabled: true,
      desktopNotifications: true,
    });
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-content">
        <div className="settings-modal-header">
          <div className="settings-header-content">
            <div className="settings-icon-large">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.5C14.2091 15.5 16 13.7091 16 11.5C16 9.29086 14.2091 7.5 12 7.5C9.79086 7.5 8 9.29086 8 11.5C8 13.7091 9.79086 15.5 12 15.5Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15L20.8 16.4C21.6 17.2 21.6 18.4 20.8 19.2L19.2 20.8C18.4 21.6 17.2 21.6 16.4 20.8L15 19.4C14.2 19.9 13.2 20.2 12.2 20.2C11.2 20.2 10.2 19.9 9.4 19.4L8 20.8C7.2 21.6 6 21.6 5.2 20.8L3.6 19.2C2.8 18.4 2.8 17.2 3.6 16.4L5 15C4.5 14.2 4.2 13.2 4.2 12.2C4.2 11.2 4.5 10.2 5 9.4L3.6 8C2.8 7.2 2.8 6 3.6 5.2L5.2 3.6C6 2.8 7.2 2.8 8 3.6L9.4 5C10.2 4.5 11.2 4.2 12.2 4.2C13.2 4.2 14.2 4.5 15 5L16.4 3.6C17.2 2.8 18.4 2.8 19.2 3.6L20.8 5.2C21.6 6 21.6 7.2 20.8 8L19.4 9.4C19.9 10.2 20.2 11.2 20.2 12.2C20.2 13.2 19.9 14.2 19.4 15Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">Pomodoro Settings</h2>
              <p className="settings-modal-subtitle">Customize your productivity workflow</p>
            </div>
          </div>
          <button className="settings-close-btn" onClick={onCancel} aria-label="Close settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-section">
            <h3 className="settings-section-title">Timer Durations</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label htmlFor="work" className="setting-label">
                  <span className="setting-label-text">Focus Session</span>
                  <span className="setting-label-unit">minutes</span>
                </label>
                <input 
                  type="number" 
                  id="work" 
                  name="work" 
                  value={localSettings.work} 
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="setting-input"
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="shortBreak" className="setting-label">
                  <span className="setting-label-text">Short Break</span>
                  <span className="setting-label-unit">minutes</span>
                </label>
                <input 
                  type="number" 
                  id="shortBreak" 
                  name="shortBreak" 
                  value={localSettings.shortBreak} 
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="setting-input"
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="longBreak" className="setting-label">
                  <span className="setting-label-text">Long Break</span>
                  <span className="setting-label-unit">minutes</span>
                </label>
                <input 
                  type="number" 
                  id="longBreak" 
                  name="longBreak" 
                  value={localSettings.longBreak} 
                  onChange={handleChange}
                  min="1"
                  max="60"
                  className="setting-input"
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="sessionsPerLongBreak" className="setting-label">
                  <span className="setting-label-text">Sessions before Long Break</span>
                  <span className="setting-label-unit">count</span>
                </label>
                <input 
                  type="number" 
                  id="sessionsPerLongBreak" 
                  name="sessionsPerLongBreak" 
                  value={localSettings.sessionsPerLongBreak} 
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="setting-input"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Automation</h3>
            <div className="settings-toggles">
              <div className="setting-toggle-item">
                <div className="toggle-label">
                  <span className="toggle-text">Auto-start breaks</span>
                  <span className="toggle-description">Automatically start break timers</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="autoStartBreaks" 
                    checked={localSettings.autoStartBreaks} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-toggle-item">
                <div className="toggle-label">
                  <span className="toggle-text">Auto-start pomodoros</span>
                  <span className="toggle-description">Automatically start focus sessions</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="autoStartPomodoros" 
                    checked={localSettings.autoStartPomodoros} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Notifications</h3>
            <div className="settings-toggles">
              <div className="setting-toggle-item">
                <div className="toggle-label">
                  <span className="toggle-text">Sound alerts</span>
                  <span className="toggle-description">Play sounds when timers complete</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="soundEnabled" 
                    checked={localSettings.soundEnabled} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-toggle-item">
                <div className="toggle-label">
                  <span className="toggle-text">Desktop notifications</span>
                  <span className="toggle-description">Show browser notifications</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="desktopNotifications" 
                    checked={localSettings.desktopNotifications} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="btn btn-secondary settings-reset-btn" onClick={resetToDefaults}>
            Reset to Defaults
          </button>
          <div className="settings-action-buttons">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


function App() {
  // --- Global State ---
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [pomodoroSettings, setPomodoroSettings] = useState(() => {
     const saved = localStorage.getItem('pomodoroSettings');
     return saved ? JSON.parse(saved) : {
        work: 25 * 60 * 1000,
        shortBreak: 5 * 60 * 1000,
        longBreak: 15 * 60 * 1000,
        sessionsPerLongBreak: 4,
        autoStartBreaks: true,
        autoStartPomodoros: false,
        soundEnabled: true,
        desktopNotifications: true,
     };
  });

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [currentTask, setCurrentTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false);

  // --- Pomodoro State ---
  const [timerMode, setTimerMode] = useState('stopwatch');
  const [pomodoroState, setPomodoroState] = useState('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // --- Audio Notification ---
  const playSound = useCallback(() => {
    if (!pomodoroSettings.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  }, [pomodoroSettings.soundEnabled]);
  
  // --- Pomodoro Cycle Logic ---
  const handlePomodoroCompletion = useCallback(() => {
    playSound();
    setIsRunning(false);

    if (pomodoroState === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      const pomodoroTask = { id: Date.now(), title: `Pomodoro Session #${newCount}`, completed: true, timeSpent: pomodoroSettings.work, isActive: false, createdAt: new Date().toISOString() };
      setTasks(prev => [...prev, pomodoroTask]);

      if (newCount % pomodoroSettings.sessionsPerLongBreak === 0) {
        setPomodoroState('longBreak');
        setTime(pomodoroSettings.longBreak);
        // Auto-start break if enabled
        if (pomodoroSettings.autoStartBreaks) {
          setIsRunning(true);
          setIsPaused(false);
        }
      } else {
        setPomodoroState('shortBreak');
        setTime(pomodoroSettings.shortBreak);
        // Auto-start break if enabled
        if (pomodoroSettings.autoStartBreaks) {
          setIsRunning(true);
          setIsPaused(false);
        }
      }
    } else {
      setPomodoroState('work');
      setTime(pomodoroSettings.work);
      // Auto-start pomodoro if enabled
      if (pomodoroSettings.autoStartPomodoros) {
        setIsRunning(true);
        setIsPaused(false);
      }
    }
  }, [pomodoroCount, pomodoroState, playSound, pomodoroSettings]);

  // --- Core Timer & Document Title Effect ---
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (timerMode === 'pomodoro' && prevTime <= 10) {
            handlePomodoroCompletion();
            return 0;
          }
          return timerMode === 'stopwatch' ? prevTime + 10 : prevTime - 10;
        });
      }, 10);
    }
    
    const minutes = Math.floor((time / 1000) / 60);
    const seconds = Math.floor((time / 1000) % 60);
    if (isRunning && timerMode === 'pomodoro') {
      document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${getPomodoroStatusText()}`;
    } else {
      document.title = 'Time Tracker Pro';
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timerMode, time, handlePomodoroCompletion]);

  // --- Local Storage Sync ---
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

  // --- Time Formatting ---
  const formatDisplayTime = (timeInMillis) => {
    const totalSeconds = Math.floor(timeInMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeInMillis / 10) % 100);
    return timerMode === 'stopwatch'
      ? `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Control Functions ---
  const handleStartPauseResume = () => {
    if (isRunning) setIsPaused(!isPaused);
    else {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (timerMode === 'stopwatch' && currentTask) {
      setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, isActive: false, timeSpent: t.timeSpent + time } : t));
      setCurrentTask(null);
    }
    setIsRunning(false);
    setIsPaused(false);
    setTime(timerMode === 'pomodoro' ? pomodoroSettings.work : 0);
    if (timerMode === 'pomodoro') setPomodoroState('work');
  };

  const switchMode = (mode) => {
    if (timerMode === mode) return;
    setIsRunning(false);
    setIsPaused(false);
    setTimerMode(mode);
    setTime(mode === 'pomodoro' ? pomodoroSettings.work : 0);
    if (mode === 'pomodoro') setPomodoroState('work');
    else setCurrentTask(null);
  };
  
  const handleSkipBreak = () => {
    setPomodoroState('work');
    setTime(pomodoroSettings.work);
    setIsRunning(false);
    setIsPaused(false);
  };

  const saveSettings = (newSettings) => {
    setPomodoroSettings(prev => ({...prev, ...newSettings}));
    setShowSettings(false);
    if (!isRunning) {
        setTime(newSettings[pomodoroState] || newSettings.work);
    }
    
    // Apply auto-start settings if enabled
    if (newSettings.autoStartBreaks && pomodoroState !== 'work') {
      setIsRunning(true);
      setIsPaused(false);
    }
    if (newSettings.autoStartPomodoros && pomodoroState === 'work') {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const getPomodoroStatusText = () => {
    if (pomodoroState === 'work') return 'Time to Focus';
    if (pomodoroState === 'shortBreak') return 'Short Break';
    return 'Long Break';
  };
  
  const progressPercentage = useMemo(() => {
    if (timerMode !== 'pomodoro' || !isRunning) return 0;
    const totalDuration = pomodoroSettings[pomodoroState];
    if (totalDuration === 0) return 0;
    const elapsedTime = totalDuration - time;
    return (elapsedTime / totalDuration) * 100;
  }, [time, timerMode, pomodoroState, pomodoroSettings, isRunning]);

  // --- Task Management ---
  const addTask = () => { if (newTask.trim()) { setTasks([...tasks, { id: Date.now(), title: newTask.trim(), completed: false, timeSpent: 0, isActive: false, createdAt: new Date().toISOString() }]); setNewTask(''); setShowAddTask(false); } };
  const startTask = (taskId) => { if (currentTask) { setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, isActive: false, timeSpent: t.timeSpent + time } : t)); } const taskToStart = tasks.find(t => t.id === taskId); setCurrentTask(taskToStart); setTasks(tasks.map(t => ({ ...t, isActive: t.id === taskId }))); setTime(0); setIsRunning(true); setIsPaused(false); };
  const completeTask = (taskId) => { setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)); };
  const deleteTask = (taskId) => { setTasks(tasks.filter(t => t.id !== taskId)); if (currentTask && currentTask.id === taskId) { setCurrentTask(null); setIsRunning(false); setIsPaused(false); setTime(0); } };
  const formatTaskTime = (ms) => { const mins = Math.floor(ms / 60000); const secs = Math.floor((ms / 1000) % 60); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; };
  const exportTasksToCSV = () => {
    const headers = ['Task Title', 'Time Spent (HH:MM:SS)', 'Completed', 'Date Created'];
    const rows = tasks.map(task => {
      const time = new Date(task.timeSpent).toISOString().substr(11, 8);
      const date = new Date(task.createdAt).toLocaleDateString();
      return `"${task.title}",${time},${task.completed ? 'Yes' : 'No'},${date}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="enterprise-app">
      {showSettings && <SettingsModal settings={pomodoroSettings} onSave={saveSettings} onCancel={() => setShowSettings(false)} />}
      {showAiCoach && <AiCoachModal tasks={tasks} onClose={() => setShowAiCoach(false)} />}
      
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <h1 className="app-title">Time Tracker Pro</h1>
            <p className="app-subtitle">Advanced Time Management</p>
          </div>
          {currentTask && timerMode === 'stopwatch' && (
            <div className="active-session">
              <div className="session-indicator">
                <span className="session-dot"></span>
                <span className="session-text">Active Session</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <section className="timer-section">
             <button className="settings-button" onClick={() => setShowSettings(true)} aria-label="Timer Settings">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15.5C14.2091 15.5 16 13.7091 16 11.5C16 9.29086 14.2091 7.5 12 7.5C9.79086 7.5 8 9.29086 8 11.5C8 13.7091 9.79086 15.5 12 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15L20.8 16.4C21.6 17.2 21.6 18.4 20.8 19.2L19.2 20.8C18.4 21.6 17.2 21.6 16.4 20.8L15 19.4C14.2 19.9 13.2 20.2 12.2 20.2C11.2 20.2 10.2 19.9 9.4 19.4L8 20.8C7.2 21.6 6 21.6 5.2 20.8L3.6 19.2C2.8 18.4 2.8 17.2 3.6 16.4L5 15C4.5 14.2 4.2 13.2 4.2 12.2C4.2 11.2 4.5 10.2 5 9.4L3.6 8C2.8 7.2 2.8 6 3.6 5.2L5.2 3.6C6 2.8 7.2 2.8 8 3.6L9.4 5C10.2 4.5 11.2 4.2 12.2 4.2C13.2 4.2 14.2 4.5 15 5L16.4 3.6C17.2 2.8 18.4 2.8 19.2 3.6L20.8 5.2C21.6 6 21.6 7.2 20.8 8L19.4 9.4C19.9 10.2 20.2 11.2 20.2 12.2C20.2 13.2 19.9 14.2 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Settings</span>
            </button>
            <div className="timer-container">
              <div className={`timer-mode-toggle ${timerMode === 'pomodoro' ? 'pomodoro-active' : ''}`}>
                <button className={`mode-button ${timerMode === 'stopwatch' ? 'active' : ''}`} onClick={() => switchMode('stopwatch')}>Stopwatch</button>
                <button className={`mode-button ${timerMode === 'pomodoro' ? 'active' : ''}`} onClick={() => switchMode('pomodoro')}>Pomodoro</button>
              </div>
              {timerMode === 'pomodoro' && <div className="pomodoro-status"><span className="status-label">{getPomodoroStatusText()}</span></div>}
              <div className="timer-display">
                <div className="timer-time">{formatDisplayTime(time)}</div>
                <div className="timer-label">{timerMode === 'stopwatch' ? 'Current Session' : `Session #${pomodoroCount}`}</div>
              </div>

              {timerMode === 'pomodoro' && (
                <div className="timer-progress-bar-container">
                    <div className="timer-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              )}

              {currentTask && timerMode === 'stopwatch' && <div className="current-task"><div className="task-indicator"><span className="task-label">Working on:</span><span className="task-title">{currentTask.title}</span></div></div>}

              <div className="timer-controls">
                <button className={`btn ${isRunning && !isPaused ? 'btn-warning' : 'btn-success'}`} onClick={handleStartPauseResume} disabled={timerMode === 'stopwatch' && !currentTask}>
                  {isRunning && !isPaused ? 'Pause' : (isPaused ? 'Resume' : 'Start')}
                </button>
                {pomodoroState !== 'work' && timerMode === 'pomodoro' ? 
                  <button className="btn btn-secondary" onClick={handleSkipBreak}>Skip</button> :
                  <button className="btn btn-danger" onClick={handleStop}>Stop</button>
                }
              </div>
            </div>
          </section>

          <section className="tasks-section" style={{ marginBottom: '2rem' }}>
             <div className="tasks-header" style={{borderBottom: 'none', paddingBottom: '0'}}>
                <div className="header-content">
                  <h2 className="section-title">Productivity Dashboard</h2>
                  <p className="section-subtitle">A visual summary of your tracked time</p>
                </div>
                <button className="ai-coach-button" onClick={() => setShowAiCoach(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C12 2.5 11.5 4 10 4.5C8.5 5 8 6.5 8 6.5M12 2.5C12 2.5 12.5 4 14 4.5C15.5 5 16 6.5 16 6.5M12 2.5V6.5M8 6.5C8 6.5 6.5 7 6 8.5C5.5 10 5.5 11.5 5.5 11.5M16 6.5C16 6.5 17.5 7 18 8.5C18.5 10 18.5 11.5 18.5 11.5M5.5 11.5C5.5 11.5 4 12 4.5 14C5 15.5 6.5 16 6.5 16M18.5 11.5C18.5 11.5 20 12 19.5 14C19 15.5 17.5 16 17.5 16M6.5 16C6.5 16 7 17.5 8.5 18C10 18.5 11.5 18.5 11.5 18.5M17.5 16C17.5 16 17 17.5 15.5 18C14 18.5 12.5 18.5 12.5 18.5M11.5 18.5C11.5 18.5 12 20 12 21.5C12 23 12 21.5 12 21.5M12.5 18.5C12.5 18.5 12 20 12 21.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Ask Gemini
                </button>
              </div>
              <div style={{marginTop: '1.5rem'}}>
                <AnalyticsDashboard tasks={tasks} />
              </div>
          </section>

          {timerMode === 'stopwatch' && (
            <section className="tasks-section">
              <div className="tasks-header">
                <div className="header-content">
                  <h2 className="section-title">Task Management</h2>
                  <p className="section-subtitle">Organize and track your work</p>
                </div>
                <div>
                  <button onClick={() => setShowAddTask(!showAddTask)} className="btn btn-primary" style={{ marginRight: '1rem' }}>
                    {showAddTask ? 'Cancel' : 'Add Task'}
                  </button>
                   <button onClick={exportTasksToCSV} className="btn btn-secondary">
                    Export CSV
                  </button>
                </div>
              </div>

              {showAddTask && (
                <div className="task-form">
                  <div className="form-container">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="Enter task name..." className="form-input" autoFocus/>
                    <button onClick={addTask} className="btn btn-success">Add Task</button>
                  </div>
                </div>
              )}

              <div className="tasks-list">
                {tasks.filter(t => !t.title.startsWith('Pomodoro Session')).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3 className="empty-title">No tasks yet</h3>
                    <p className="empty-description">Add your first task to start tracking your productivity</p>
                  </div>
                ) : (
                  <>
                    {tasks.filter(task => !task.completed && !task.title.startsWith('Pomodoro Session')).map(task => (
                      <div key={task.id} className={`task-item ${task.isActive ? 'active' : ''}`}>
                        <div className="task-content">
                           <div className="task-header">
                            <input type="checkbox" checked={task.completed} onChange={() => completeTask(task.id)} className="task-checkbox"/>
                            <div className="task-info">
                              <h4 className="task-title">{task.title}</h4>
                              {task.timeSpent > 0 && <span className="task-time">{formatTaskTime(task.timeSpent)}</span>}
                            </div>
                          </div>
                          <div className="task-actions">
                            {!task.completed && !task.isActive && (<button onClick={() => startTask(task.id)} className="btn btn-success btn-sm">Start</button>)}
                            {task.isActive && <span className="status-badge active">Active</span>}
                            <button onClick={() => deleteTask(task.id)} className="btn btn-danger btn-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(task => task.completed && !task.title.startsWith('Pomodoro Session')).length > 0 && (
                      <div className="completed-tasks-section">
                        <h3 className="completed-tasks-title">Completed Tasks</h3>
                        {tasks.filter(task => task.completed && !task.title.startsWith('Pomodoro Session')).map(task => (
                          <div key={task.id} className="task-item completed">
                            <div className="task-content">
                              <div className="task-header">
                                <input type="checkbox" checked={task.completed} onChange={() => completeTask(task.id)} className="task-checkbox"/>
                                <div className="task-info">
                                  <h4 className="task-title">{task.title}</h4>
                                  {task.timeSpent > 0 && <span className="task-time">{formatTaskTime(task.timeSpent)}</span>}
                                </div>
                              </div>
                              <div className="task-actions">
                                <span className="status-badge completed">Done</span>
                                <button onClick={() => deleteTask(task.id)} className="btn btn-danger btn-sm">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
