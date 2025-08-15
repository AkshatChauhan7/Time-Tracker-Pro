import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import ProductivityHeatmap from './ProductivityHeatmap'; // Import the new component

ChartJS.register(ArcElement, Tooltip);

// --- Helper Functions ---
const formatTime = (milliseconds, format = 'full') => {
  if (milliseconds === 0) return format === 'full' ? '0m' : '0';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (format === 'full') {
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    if (hours === 0 && minutes === 0) result += `${seconds}s`;
    return result.trim();
  }
  if (format === 'hms') {
     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Main Dashboard Component ---
const AnalyticsDashboard = ({ tasks }) => {
  // --- Data Processing for Heatmap ---
  const heatmapData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const dailyTotals = tasks.reduce((acc, task) => {
      const date = new Date(task.createdAt).toISOString().slice(0, 10);
      const timeInMillis = task.timeSpent || 0;
      acc[date] = (acc[date] || 0) + timeInMillis;
      return acc;
    }, {});
    
    const timeValues = Object.values(dailyTotals);
    if (timeValues.length === 0) return [];

    const maxTime = Math.max(...timeValues);
    
    return Object.entries(dailyTotals).map(([date, totalTime]) => {
      let level = 0;
      if (maxTime > 0) {
        const percentage = (totalTime / maxTime) * 100;
        if (percentage > 0 && percentage <= 25) level = 1;
        else if (percentage > 25 && percentage <= 50) level = 2;
        else if (percentage > 50 && percentage <= 75) level = 3;
        else if (percentage > 75) level = 4;
      }
      
      return {
        date,
        count: totalTime,
        level,
      };
    });
  }, [tasks]);

  // --- Existing Data Processing ---
  const totalTime = tasks.reduce((acc, task) => acc + task.timeSpent, 0);
  const completedTasksCount = tasks.filter(task => task.completed).length;
  
  const sortedTasks = [...tasks]
    .filter(task => task.timeSpent > 0)
    .sort((a, b) => b.timeSpent - a.timeSpent);

  // --- Chart Configuration ---
  const chartData = {
    labels: sortedTasks.map(task => task.title),
    datasets: [{
      data: sortedTasks.map(task => task.timeSpent),
      backgroundColor: sortedTasks.map((_, index) => `rgba(99, 102, 241, ${1 - index * 0.1})`),
      borderColor: '#F9FAFB',
      borderWidth: 3,
      hoverOffset: 12,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#111827',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => `Time: ${formatTime(context.raw)}`,
        },
      },
    },
  };

  if (tasks.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📊</div>
        <h3 style={styles.emptyTitle}>No Data to Display</h3>
        <p style={styles.emptyDescription}>Track time on tasks to see your dashboard.</p>
      </div>
    );
  }

  // --- Render JSX ---
  return (
    <div style={styles.dashboardContainer}>
      {/* Key Metrics Row */}
      <div style={styles.kpiRow}>
        <KPIBox title="Total Time Tracked" value={formatTime(totalTime, 'hms')} />
        <KPIBox title="Tasks Completed" value={completedTasksCount} />
        <KPIBox title="Total Tasks" value={tasks.length} />
      </div>

      {/* Main Content Area (Chart + Breakdown) */}
      <div style={styles.mainContent}>
        <div style={styles.chartContainer}>
          <h3 style={styles.sectionTitle}>Time Distribution</h3>
          <div style={{ height: '220px', position: 'relative' }}>
            <Doughnut data={chartData} options={chartOptions} />
            <div style={styles.chartCenterText}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>{formatTime(totalTime)}</span>
              <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Total Time</span>
            </div>
          </div>
        </div>

        <div style={styles.breakdownContainer}>
          <h3 style={styles.sectionTitle}>Task Breakdown</h3>
          <div style={styles.breakdownList}>
            {sortedTasks.map(task => (
              <TaskBreakdownItem key={task.id} task={task} totalTime={totalTime} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Render the new Heatmap section */}
      <div style={{ marginTop: '2rem' }}>
        <ProductivityHeatmap data={heatmapData} />
      </div>
    </div>
  );
};

// --- Sub-Components ---
const KPIBox = ({ title, value }) => (
  <div style={styles.kpiBox}>
    <p style={styles.kpiTitle}>{title}</p>
    <p style={styles.kpiValue}>{value}</p>
  </div>
);

const TaskBreakdownItem = ({ task, totalTime }) => {
  const percentage = totalTime > 0 ? ((task.timeSpent / totalTime) * 100).toFixed(1) : 0;
  return (
    <div style={styles.breakdownItem}>
      <div style={styles.breakdownDetails}>
        <span style={styles.breakdownTitle}>{task.title}</span>
        <span style={styles.breakdownTime}>{formatTime(task.timeSpent)}</span>
      </div>
      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBar, width: `${percentage}%` }} />
        <span style={styles.progressText}>{percentage}%</span>
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  dashboardContainer: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  kpiBox: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.75rem', padding: '1rem' },
  kpiTitle: { fontSize: '0.875rem', color: '#6B7280', margin: '0 0 0.25rem 0' },
  kpiValue: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', margin: 0 },
  mainContent: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' },
  chartContainer: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  breakdownContainer: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionTitle: { fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 },
  chartCenterText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column' },
  breakdownList: { maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  breakdownItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  breakdownDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  breakdownTitle: { color: '#374151', fontWeight: '500', fontSize: '0.875rem' },
  breakdownTime: { color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' },
  progressBarContainer: { width: '100%', backgroundColor: '#E5E7EB', borderRadius: '1rem', height: '1.25rem', position: 'relative', overflow: 'hidden' },
  progressBar: { backgroundColor: '#6366F1', height: '100%', borderRadius: '1rem' },
  progressText: { position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#fff', fontWeight: '500', mixBlendMode: 'difference' },
  emptyState: { padding: '2rem 0', textAlign: 'center' },
  emptyIcon: { fontSize: '3rem', opacity: 0.5 },
  emptyTitle: { fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', color: '#374151' },
  emptyDescription: { color: '#6B7280', maxWidth: '300px', margin: '0.5rem auto 0' },
};

export default AnalyticsDashboard;
