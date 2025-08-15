import React, { useState, useEffect, useMemo } from 'react'
import './App.css'
import AnalyticsDashboard from './AnalyticsDashboard'; // Import the new dashboard

function App() {
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

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = (time) => {
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0')
    };
  };

  const { minutes, seconds, milliseconds } = formatTime(time);

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
        task.id === currentTask.id
          ? { ...task, isActive: false, timeSpent: task.timeSpent + time }
          : task
      ));
    }

    setCurrentTask(tasks.find(task => task.id === taskId));
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, isActive: true }
        : { ...task, isActive: false }
    ));
    setTime(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTask = () => {
    setIsPaused(true);
  };

  const resumeTask = () => {
    setIsPaused(false);
  };

  const stopTask = () => {
    if (currentTask) {
      setTasks(tasks.map(task =>
        task.id === currentTask.id
          ? { ...task, isActive: false, timeSpent: task.timeSpent + time }
          : task
      ));
    }
    setCurrentTask(null);
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
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

  const timeSummaries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return {
      total: tasks.reduce((acc, task) => acc + task.timeSpent, 0),
      today: tasks.reduce((acc, task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === today.toDateString() ? acc + task.timeSpent : acc;
      }, 0),
      week: tasks.reduce((acc, task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart ? acc + task.timeSpent : acc;
      }, 0)
    };
  }, [tasks]);

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

  return (
    <div className="enterprise-app">
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <h1 className="app-title">Time Tracker</h1>
            <p className="app-subtitle">Time Management</p>
          </div>
          {currentTask && (
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
              <div className="timer-display">
                <div className="timer-time">
                  {minutes}:{seconds}:{milliseconds}
                </div>
                <div className="timer-label">Current Session</div>
              </div>

              {currentTask && (
                <div className="current-task">
                  <div className="task-indicator">
                    <span className="task-label">Working on:</span>
                    <span className="task-title">{currentTask.title}</span>
                  </div>
                </div>
              )}

              <div className="timer-controls">
                {isRunning ? (
                  <>
                    {isPaused ? (
                      <button className="btn btn-success" onClick={resumeTask}>Resume</button>
                    ) : (
                      <button className="btn btn-warning" onClick={pauseTask}>Pause</button>
                    )}
                    <button className="btn btn-danger" onClick={stopTask}>Stop Timer</button>
                  </>
                ) : (
                  <button
                    className={`btn ${currentTask ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIsRunning(true)}
                    disabled={!currentTask}
                  >
                    Start Timer
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* New Analytics Section */}
          <section className="tasks-section" style={{marginBottom: '2rem'}}>
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

          <section className="tasks-section">
            <div className="tasks-header">
              <div className="header-content">
                <h2 className="section-title">Task Management</h2>
                <p className="section-subtitle">Organize and track your work</p>
              </div>
              <div>
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="btn btn-primary"
                  style={{ marginRight: '1rem' }}
                >
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
                    style={{ color: '#1a1a1a', backgroundColor: '#ffffff' }}
                    autoFocus
                  />
                  <button onClick={addTask} className="btn btn-success">Add Task</button>
                </div>
              </div>
            )}

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3 className="empty-title">No tasks yet</h3>
                  <p className="empty-description">Add your first task to start tracking your productivity</p>
                </div>
              ) : (
                <>
                  {tasks.filter(task => !task.completed).map(task => (
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

                  {tasks.filter(task => task.completed).length > 0 && (
                    <div className="completed-tasks-section">
                      <h3 className="completed-tasks-title">Completed Tasks</h3>
                      {tasks.filter(task => task.completed).map(task => (
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
        </div>
      </main>
    </div>
  )
}

export default App