const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Load and display activity history
    loadActivityHistory();
    
    // Set up save button event listener
    document.getElementById('save-btn').addEventListener('click', saveActivity);
});

async function saveActivity() {
  const activity = {
    date: document.getElementById('date').value,
    walking: parseInt(document.getElementById('walking').value) || 0,
    running: parseInt(document.getElementById('running').value) || 0,
    walkingDistance: parseFloat(document.getElementById('walkingDistance').value) || 0,
    runningDistance: parseFloat(document.getElementById('runningDistance').value) || 0
  };

  await ipcRenderer.invoke('save-activity', activity);
  loadActivityHistory();
}

async function loadActivityHistory() {
    const activities = await ipcRenderer.invoke('get-activities');
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display activities in the table
    const tableBody = document.getElementById('activity-body');
    tableBody.innerHTML = '';
    
   activities.forEach(activity => {
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td>${formatDate(activity.date)}</td>
    <td>${activity.walking}</td>
    <td>${activity.walkingDistance.toFixed(1)}</td>
    <td>${activity.running}</td>
    <td>${activity.runningDistance.toFixed(1)}</td>
    <td>${activity.total}</td>
    <td>${activity.totalDistance.toFixed(1)}</td>
  `;
  
  tableBody.appendChild(row);
});
    
    // Calculate and display progress
    if (activities.length >= 2) {
        displayProgressComparison(activities[0], activities[1]);
    } else if (activities.length === 1) {
        document.getElementById('progress-comparison').innerHTML = 
            '<p>This is your first activity. Keep it up!</p>';
    } else {
        document.getElementById('progress-comparison').innerHTML = 
            '<p>No activities recorded yet.</p>';
    }
}

function displayProgressComparison(current, previous) {
  const walkingDiff = current.walking - previous.walking;
  const runningDiff = current.running - previous.running;
  const totalDiff = current.total - previous.total;
  const walkingDistDiff = current.walkingDistance - previous.walkingDistance;
  const runningDistDiff = current.runningDistance - previous.runningDistance;
  const totalDistDiff = current.totalDistance - previous.totalDistance;
  
  const progressDiv = document.getElementById('progress-comparison');
  
  let html = `
    <p>Compared to ${formatDate(previous.date)}:</p>
    <ul>
      <li>Total time: ${formatDifference(totalDiff)}</li>
      <li>Total distance: ${formatDifference(totalDistDiff)} km</li>
      <li>Walking time: ${formatDifference(walkingDiff)}</li>
      <li>Walking distance: ${formatDifference(walkingDistDiff)} km</li>
      <li>Running time: ${formatDifference(runningDiff)}</li>
      <li>Running distance: ${formatDifference(runningDistDiff)} km</li>
    </ul>
  `;
  
  progressDiv.innerHTML = html;
}

function formatDifference(diff) {
    if (diff > 0) {
        return `<span class="progress-up">+${diff} minutes more</span>`;
    } else if (diff < 0) {
        return `<span class="progress-down">${diff} minutes less</span>`;
    } else {
        return `<span class="progress-same">no change</span>`;
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Add this near your other functions in renderer.js
async function deleteActivity(id) {
  const confirmed = confirm('Are you sure you want to delete this activity?');
  if (confirmed) {
    await ipcRenderer.invoke('delete-activity', id);
    loadActivityHistory();
  }
}

// Modify your loadActivityHistory function to include delete buttons
async function loadActivityHistory() {
  const activities = await ipcRenderer.invoke('get-activities');
  
  const tableBody = document.getElementById('activity-body');
  tableBody.innerHTML = '';
  
  activities.forEach(activity => {
    const row = document.createElement('tr');
    const total = activity.walking + activity.running;
    const totalDistance = activity.walkingDistance + activity.runningDistance;
    
    row.innerHTML = `
      <td>${formatDate(activity.date)}</td>
      <td>${activity.walking}</td>
      <td>${activity.walkingDistance.toFixed(1)}</td>
      <td>${activity.running}</td>
      <td>${activity.runningDistance.toFixed(1)}</td>
      <td>${total}</td>
      <td>${totalDistance.toFixed(1)}</td>
      <td><button class="delete-btn" data-id="${activity.id}">Delete</button></td>
    `;
    
    tableBody.appendChild(row);
  });
  
  
}

// Add this function if not already present
function confirm(message) {
  return window.confirm(message);
}
  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteActivity(parseInt(e.target.getAttribute('data-id')));
    });
  });

  // Update progress comparison
  if (activities.length >= 2) {
    displayProgressComparison(activities[0], activities[1]);
  }
