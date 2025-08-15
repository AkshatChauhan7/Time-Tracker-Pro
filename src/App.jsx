import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import AnalyticsDashboard from './AnalyticsDashboard';

// --- Constants for Pomodoro Timer ---
const POMODORO_SETTINGS = {
  work: 25 * 60 * 1000, // 25 minutes
  shortBreak: 5 * 60 * 1000, // 5 minutes
  longBreak: 15 * 60 * 1000, // 15 minutes
  sessionsPerLongBreak: 4,
};

function App() {
  // --- Global State ---
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [currentTask, setCurrentTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  // --- Pomodoro State ---
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' or 'pomodoro'
  const [pomodoroState, setPomodoroState] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // --- Audio Notification ---
  const playSound = useCallback(() => {
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
  }, []);

  // --- Pomodoro Cycle Logic ---
  const handlePomodoroCompletion = useCallback(() => {
    playSound();
    setIsRunning(false);

    if (pomodoroState === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      const pomodoroTask = {
        id: Date.now(),
        title: `Pomodoro Session #${newCount}`,
        completed: true,
        timeSpent: POMODORO_SETTINGS.work,
        isActive: false,
        createdAt: new Date().toISOString()
      };
      setTasks(prevTasks => [...prevTasks, pomodoroTask]);

      if (newCount % POMODORO_SETTINGS.sessionsPerLongBreak === 0) {
        setPomodoroState('longBreak');
        setTime(POMODORO_SETTINGS.longBreak);
      } else {
        setPomodoroState('shortBreak');
        setTime(POMODORO_SETTINGS.shortBreak);
      }
    } else { // End of a break
      setPomodoroState('work');
      setTime(POMODORO_SETTINGS.work);
    }
  }, [pomodoroCount, pomodoroState, playSound]);

  // --- Core Timer Logic ---
  useEffect(() => {
    let interval;

    if (isRunning && !isPaused) {
      if (timerMode === 'stopwatch') {
        interval = setInterval(() => setTime(prevTime => prevTime + 10), 10);
      } else { // Pomodoro Mode
        interval = setInterval(() => {
          setTime(prevTime => {
            if (prevTime <= 10) {
              handlePomodoroCompletion();
              return 0;
            }
            return prevTime - 10;
          });
        }, 10);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timerMode, handlePomodoroCompletion]);

  // --- Local Storage Sync ---
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Time Formatting ---
  const formatDisplayTime = (timeInMillis) => {
    const totalSeconds = Math.floor(timeInMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeInMillis / 10) % 100);

    if (timerMode === 'stopwatch') {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Task Management ---
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.trim(),
        completed: false,
        timeSpent: 0,
        isActive: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setShowAddTask(false);
    }
  };

  const startTask = (taskId) => {
    if (currentTask) {
      setTasks(tasks.map(task =>
        task.id === currentTask.id ? { ...task, isActive: false, timeSpent: task.timeSpent + time } : task
      ));
    }
    const taskToStart = tasks.find(task => task.id === taskId);
    setCurrentTask(taskToStart);
    setTasks(tasks.map(task =>
      ({ ...task, isActive: task.id === taskId })
    ));
    setTime(0);
    setIsRunning(true);
    setIsPaused(false);
  };
  
  const completeTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(null);
      setIsRunning(false);
      setIsPaused(false);
      setTime(0);
    }
  };
  
  const formatTaskTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const exportTasksToCSV = () => {
    const headers = ['Task Title', 'Time Spent (HH:MM:SS)', 'Completed', 'Date Created'];
    const rows = tasks.map(task => {
      const time = new Date(task.timeSpent).toISOString().substr(11, 8);
      const date = new Date(task.createdAt).toLocaleDateString();
      return `"${task.title}",${time},${task.completed ? 'Yes' : 'No'},${date}`;
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Control Functions ---
  const handleStartPauseResume = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    } else {
      if (timerMode === 'pomodoro' && time === 0) {
        setTime(POMODORO_SETTINGS[pomodoroState]);
      }
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (timerMode === 'stopwatch' && currentTask) {
      setTasks(tasks.map(task =>
        task.id === currentTask.id ? { ...task, isActive: false, timeSpent: task.timeSpent + time } : task
      ));
      setCurrentTask(null);
    }
    setIsRunning(false);
    setIsPaused(false);
    setTime(timerMode === 'pomodoro' ? POMODORO_SETTINGS.work : 0);
    if (timerMode === 'pomodoro') setPomodoroState('work');
  };

  const switchMode = (mode) => {
    if (timerMode === mode) return;
    setIsRunning(false);
    setIsPaused(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setPomodoroState('work');
      setTime(POMODORO_SETTINGS.work);
    } else {
      setTime(0);
      setCurrentTask(null);
    }
  };

  const getPomodoroStatusText = () => {
    switch (pomodoroState) {
      case 'work': return 'Time to Focus';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return '';
    }
  };

  return (
    <div className="enterprise-app">
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <h1 className="app-title">Time Tracker</h1>
            <p className="app-subtitle">Time Management</p>
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
            <div className="timer-container">
              <div className="timer-mode-toggle">
                <button className={`mode-button ${timerMode === 'stopwatch' ? 'active' : ''}`} onClick={() => switchMode('stopwatch')}>Stopwatch</button>
                <button className={`mode-button ${timerMode === 'pomodoro' ? 'active' : ''}`} onClick={() => switchMode('pomodoro')}>Pomodoro</button>
              </div>

              {timerMode === 'pomodoro' && (
                <div className="pomodoro-status">
                  <span className="status-label">{getPomodoroStatusText()}</span>
                </div>
              )}

              <div className="timer-display">
                <div className="timer-time">{formatDisplayTime(time)}</div>
                <div className="timer-label">{timerMode === 'stopwatch' ? 'Current Session' : `Session #${pomodoroCount}`}</div>
              </div>

              {currentTask && timerMode === 'stopwatch' && (
                <div className="current-task">
                  <div className="task-indicator">
                    <span className="task-label">Working on:</span>
                    <span className="task-title">{currentTask.title}</span>
                  </div>
                </div>
              )}

              <div className="timer-controls">
                <button
                  className={`btn ${isRunning && !isPaused ? 'btn-warning' : 'btn-success'}`}
                  onClick={handleStartPauseResume}
                  disabled={timerMode === 'stopwatch' && !currentTask}
                >
                  {isRunning && !isPaused ? 'Pause' : (isPaused ? 'Resume' : 'Start')}
                </button>
                <button className="btn btn-danger" onClick={handleStop}>Stop</button>
              </div>
            </div>
          </section>

          <section className="tasks-section" style={{ marginBottom: '2rem' }}>
             <div className="tasks-header" style={{borderBottom: 'none', paddingBottom: '0'}}>
                <div className="header-content">
                  <h2 className="section-title">Productivity Dashboard</h2>
                  <p className="section-subtitle">A visual summary of your tracked time</p>
                </div>
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
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      placeholder="Enter task name..."
                      className="form-input"
                      autoFocus
                    />
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
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => completeTask(task.id)}
                              className="task-checkbox"
                            />
                            <div className="task-info">
                              <h4 className="task-title">{task.title}</h4>
                              {task.timeSpent > 0 && <span className="task-time">{formatTaskTime(task.timeSpent)}</span>}
                            </div>
                          </div>
                          <div className="task-actions">
                            {!task.completed && !task.isActive && (
                              <button onClick={() => startTask(task.id)} className="btn btn-success btn-sm">Start</button>
                            )}
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
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => completeTask(task.id)}
                                  className="task-checkbox"
                                />
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
