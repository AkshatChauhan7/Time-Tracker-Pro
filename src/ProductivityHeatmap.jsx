import React, { useState, useMemo } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// --- Helper Functions ---

// Formats milliseconds into a readable "Xh Ym" string
const formatTime = (milliseconds) => {
  if (!milliseconds || milliseconds < 60000) return 'Less than a minute';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  return parts.join(' ');
};

// Formats a date string (e.g., "2025-08-15") into a long format (e.g., "August 15, 2025")
const formatTooltipDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, options);
}


// --- Main Component ---

const ProductivityHeatmap = ({ data }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  // Memoize calculations for performance
  const { yearlyData, totalHours, totalDays } = useMemo(() => {
    const filteredData = data.filter(d => new Date(d.date).getFullYear() === year);
    
    const totalMilliseconds = filteredData.reduce((sum, day) => sum + day.count, 0);
    const totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(1);
    const totalDays = filteredData.filter(day => day.count > 0).length;

    return { yearlyData: filteredData, totalHours, totalDays };
  }, [data, year]);

  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };
  
  // Handlers for year navigation
  const goToPreviousYear = () => setYear(y => y - 1);
  const goToNextYear = () => setYear(y => y + 1);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Activity Overview</h3>
        <div style={styles.navigation}>
          <button onClick={goToPreviousYear} style={styles.navButton}>&larr;</button>
          <span style={styles.yearText}>{year}</span>
          <button onClick={goToNextYear} style={styles.navButton} disabled={year >= new Date().getFullYear()}>&rarr;</button>
        </div>
      </div>

      {/* This conditional rendering fixes the crash */}
      {yearlyData.length > 0 ? (
        <ActivityCalendar
          data={yearlyData}
          blockSize={14}
          blockMargin={4}
          theme={explicitTheme}
          fontSize={16}
          showWeekdayLabels
          renderBlock={(block, activity) =>
            React.cloneElement(block, {
              'data-tooltip-id': 'react-tooltip',
              'data-tooltip-html': `<strong>${formatTime(activity.count)}</strong> on ${formatTooltipDate(activity.date)}`,
            })
          }
        />
      ) : (
        <div style={styles.emptyCalendar}>
          <p>No activity to display for {year}.</p>
        </div>
      )}
      
      <ReactTooltip id="react-tooltip" />
      
      <div style={styles.footer}>
         <p style={styles.summaryText}>
          Tracked <strong>{totalHours} hours</strong> across <strong>{totalDays} days</strong> in {year}.
        </p>
      </div>
    </div>
  );
};


// --- Styles ---

const styles = {
  container: { 
    padding: '1.5rem', 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: '1.5rem', 
    border: '1px solid rgba(0, 0, 0, 0.07)', 
    backdropFilter: 'blur(10px)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: { 
    fontSize: '1.25rem', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0,
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navButton: {
    background: '#f0f0f0',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '0.25rem 0.75rem',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: '1',
    color: '#333',
  },
  yearText: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#444',
  },
  emptyCalendar: {
    height: '130px', // Matches approx height of the calendar
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
  },
  footer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  summaryText: {
    color: '#555',
    fontSize: '0.9rem',
    margin: 0,
  }
};

export default ProductivityHeatmap;
