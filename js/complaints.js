const API_URL = 'https://urbanpulse-backend.onrender.com';
const userId = localStorage.getItem('userId'); // Get logged-in user ID
let allComplaints = [];

window.addEventListener('DOMContentLoaded', async () => {
  const userName = localStorage.getItem('userName');
  const userNameElement = document.getElementById('userName');
  
  if (userName && userNameElement) {
    userNameElement.textContent = `👤 ${userName}`;
  }
  
  await loadComplaints();
  setupFilters();
});

async function loadComplaints() {
  try {
    const response = await fetch(`${API_URL}/complaints`);
    const allComplaintsFromServer = await response.json();
    
    // FILTER: Show only complaints from logged-in user
    allComplaints = allComplaintsFromServer.filter(complaint => complaint.userId === userId);
    
    displayComplaints(allComplaints);
    updateResultsCount(allComplaints.length);
  } catch (error) {
    console.error('Error loading complaints:', error);
    const grid = document.getElementById('complaintsGrid');
    const loading = document.getElementById('loadingState');
    
    if (loading) loading.style.display = 'none';
    
    if (grid) {
      grid.style.display = 'block';
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
          <h3 style="color: #ef4444; margin-bottom: 1rem;">❌ Error Loading</h3>
          <p style="color: rgba(255,255,255,0.6);">Please check your connection</p>
        </div>
      `;
    }
  }
}

function displayComplaints(complaints) {
  const grid = document.getElementById('complaintsGrid');
  const loading = document.getElementById('loadingState');
  const noResults = document.getElementById('noResults');
  
  if (loading) loading.style.display = 'none';
  
  if (complaints.length === 0) {
    if (grid) grid.style.display = 'none';
    if (noResults) {
      noResults.style.display = 'block';
      noResults.innerHTML = `
        <h3 style="font-size: 2rem; margin-bottom: 1rem; color: rgba(255,255,255,0.7);">📭 No Complaints Yet</h3>
        <p style="color: rgba(255,255,255,0.5); margin-bottom: 2rem;">You haven't submitted any complaints yet.</p>
        <a href="submit-complaint.html" style="display: inline-block; background: #FF6B35; color: #000; padding: 1rem 2rem; text-decoration: none; border-radius: 4px; font-weight: 700;">Submit Your First Complaint</a>
      `;
    }
    return;
  }
  
  if (grid) grid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';
  
  if (grid) {
    grid.innerHTML = complaints.map((complaint, index) => {
      const imageUrl = complaint.images && complaint.images[0] 
        ? `${API_URL}${complaint.images[0]}` 
        : 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800';
      
      const statusClass = `status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`;
      const timeAgo = getTimeAgo(new Date(complaint.submittedAt));
      
      const categoryIcons = {
        'drainage': '🚰',
        'electricity': '⚡',
        'roads': '🛣️',
        'sanitation': '🗑️',
        'water': '💧',
        'streetlights': '💡'
      };
      
      return `
        <div class="complaint-card" data-aos="fade-up" data-aos-delay="${index * 50}">
          <img src="${imageUrl}" class="complaint-image" alt="${complaint.category}">
          <div class="complaint-content">
            <div class="complaint-meta">
              <span class="category-badge">${categoryIcons[complaint.category] || '📋'} ${complaint.category}</span>
              <span class="status-badge ${statusClass}">${complaint.status}</span>
            </div>
            <div class="complaint-location">📍 ${complaint.location}</div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-footer">
              <span>👤 ${complaint.userName || 'You'}</span>
              <span>🕒 ${timeAgo}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}

function updateResultsCount(count) {
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.textContent = `${count} Complaint${count !== 1 ? 's' : ''}`;
  }
}

function setupFilters() {
  const locationSearch = document.getElementById('locationSearch');
  const problemFilter = document.getElementById('problemFilter');
  
  if (locationSearch) locationSearch.addEventListener('input', filterComplaints);
  if (problemFilter) problemFilter.addEventListener('change', filterComplaints);
}

function filterComplaints() {
  const search = (document.getElementById('locationSearch')?.value || '').toLowerCase();
  const category = (document.getElementById('problemFilter')?.value || '');
  
  const filtered = allComplaints.filter(complaint => {
    const matchSearch = complaint.location.toLowerCase().includes(search) || 
                       complaint.description.toLowerCase().includes(search);
    const matchCategory = !category || category === 'all' || complaint.category === category;
    
    return matchSearch && matchCategory;
  });
  
  displayComplaints(filtered);
  updateResultsCount(filtered.length);
}
