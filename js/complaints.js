const API_URL = 'https://urbanpulse-backend.onrender.com';
let allComplaints = [];

window.addEventListener('DOMContentLoaded', async () => {
  await loadComplaints();
  setupFilters();
});

async function loadComplaints() {
  try {
    console.log('📋 Loading complaints...');
    const response = await fetch(`${API_URL}/complaints`);
    allComplaints = await response.json();
    console.log(`✅ Loaded ${allComplaints.length} complaints`);
    displayComplaints(allComplaints);
  } catch (error) {
    console.error('❌ Error loading complaints:', error);
    document.getElementById('complaintsGrid').innerHTML = `
      <div class="col-span-full text-center py-12 text-red-500">
        <div class="text-5xl mb-4">❌</div>
        <p>Failed to load complaints. Please try again.</p>
      </div>
    `;
  }
}

function displayComplaints(complaints) {
  const grid = document.getElementById('complaintsGrid');
  
  if (complaints.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-500">
        <div class="text-5xl mb-4">📭</div>
        <p>No complaints found</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = complaints.map(complaint => createComplaintCard(complaint)).join('');
}

function createComplaintCard(complaint) {
  const statusColors = {
    'submitted': 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    'resolved': 'bg-green-500',
    'rejected': 'bg-red-500'
  };
  
  const categoryIcons = {
    'drainage': '🚰',
    'electricity': '⚡',
    'roads': '🛣️',
    'sanitation': '🗑️',
    'water': '💧',
    'streetlights': '💡'
  };
  
  const timeAgo = getTimeAgo(new Date(complaint.submittedAt));
  const imageUrl = complaint.images && complaint.images[0] 
    ? `${API_URL}${complaint.images[0]}` 
    : 'https://via.placeholder.com/400x300?text=No+Image';
  
  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div class="relative h-48 bg-gray-200">
        <img src="${imageUrl}" 
             class="w-full h-full object-cover" 
             alt="${complaint.category}">
        <span class="absolute top-2 right-2 ${statusColors[complaint.status]} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
          ${complaint.status}
        </span>
      </div>
      <div class="p-5">
        <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          ${categoryIcons[complaint.category]} ${complaint.category}
        </span>
        <h3 class="font-bold text-lg mb-2 text-gray-800">
          📍 ${complaint.location}
        </h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${complaint.description}
        </p>
        <div class="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
          <span>👤 ${complaint.userName || 'Anonymous'}</span>
          <span>🕒 ${timeAgo}</span>
        </div>
      </div>
    </div>
  `;
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

function setupFilters() {
  const locationSearch = document.getElementById('locationSearch');
  const problemFilter = document.getElementById('problemFilter');
  
  if (locationSearch) locationSearch.addEventListener('input', filterComplaints);
  if (problemFilter) problemFilter.addEventListener('change', filterComplaints);
}

function filterComplaints() {
  const locationSearch = document.getElementById('locationSearch').value.toLowerCase();
  const problemType = document.getElementById('problemFilter').value;
  
  const filtered = allComplaints.filter(complaint => {
    const matchLocation = complaint.location.toLowerCase().includes(locationSearch);
    const matchProblem = problemType === 'all' || complaint.category === problemType;
    return matchLocation && matchProblem;
  });
  
  displayComplaints(filtered);
}
