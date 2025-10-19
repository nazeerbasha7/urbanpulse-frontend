// API Configuration
const API_URL = 'https://urbanpulse-backend.onrender.com';

// Global variables
let allComplaints = [];
let filteredComplaints = [];

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and update navbar
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = `👤 ${userName}`;
    }
    
    // Load all complaints
    fetchComplaints();
});

// Fetch complaints from API
async function fetchComplaints() {
    const loadingState = document.getElementById('loadingState');
    const complaintsGrid = document.getElementById('complaintsGrid');
    const noResults = document.getElementById('noResults');
    
    try {
        loadingState.style.display = 'block';
        complaintsGrid.style.display = 'none';
        noResults.style.display = 'none';
        
        const response = await fetch(`${API_URL}/complaints`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }
        
        const data = await response.json();
        allComplaints = data;
        filteredComplaints = data;
        
        loadingState.style.display = 'none';
        
        if (data.length === 0) {
            noResults.style.display = 'block';
        } else {
            complaintsGrid.style.display = 'grid';
            displayComplaints(data);
        }
        
        updateResultsCount(data.length);
        
    } catch (error) {
        console.error('Error fetching complaints:', error);
        loadingState.style.display = 'none';
        noResults.style.display = 'block';
        document.querySelector('.no-results h3').textContent = '❌ Error Loading Complaints';
        document.querySelector('.no-results p').textContent = 'Please make sure the server is running on http://localhost:5000';
    }
}

// Display complaints in grid
function displayComplaints(complaints) {
    const grid = document.getElementById('complaintsGrid');
    
    if (complaints.length === 0) {
        grid.style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    document.getElementById('noResults').style.display = 'none';
    
    grid.innerHTML = complaints.map(complaint => createComplaintCard(complaint)).join('');
    
    updateResultsCount(complaints.length);
}

// Create individual complaint card
function createComplaintCard(complaint) {
    const imageUrl = complaint.images && complaint.images.length > 0 
        ? `${API_URL}${complaint.images[0]}` 
        : 'https://via.placeholder.com/400x200/667eea/ffffff?text=No+Image';
    
    const statusClass = `status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`;
    const date = new Date(complaint.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const imageCount = complaint.images ? complaint.images.length : 0;
    
    return `
        <div class="complaint-card-wrapper">
            <div class="complaint-card" onclick='openModal(${JSON.stringify(complaint).replace(/'/g, "&apos;")})'>
                ${imageCount > 0 ? `<span class="image-count">📷 ${imageCount} photo${imageCount > 1 ? 's' : ''}</span>` : ''}
                <img src="${imageUrl}" alt="${complaint.category}" class="complaint-image" onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=No+Image'">
                
                <div class="complaint-content">
                    <div class="complaint-header">
                        <span class="category-badge">${complaint.category}</span>
                        <span class="status-badge ${statusClass}">${complaint.status}</span>
                    </div>
                    
                    <div class="complaint-location">
                        <span>📍</span>
                        <span>${complaint.location}</span>
                    </div>
                    
                    <p class="complaint-description">${complaint.description}</p>
                    
                    <div class="complaint-footer">
                        <div class="complaint-user">
                            <span>👤</span>
                            <span>${complaint.userName}</span>
                        </div>
                        <div class="complaint-date">${date}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    resultsCount.textContent = `${count} Complaint${count !== 1 ? 's' : ''}`;
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const location = document.getElementById('locationFilter').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    filteredComplaints = allComplaints.filter(complaint => {
        // Search filter (checks location and description)
        const matchesSearch = !searchTerm || 
            complaint.location.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm) ||
            complaint.category.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = !category || complaint.category === category;
        
        // Location filter
        const matchesLocation = !location || complaint.location.toLowerCase().includes(location);
        
        // Status filter
        const matchesStatus = !status || complaint.status === status;
        
        // Date filters
        const complaintDate = new Date(complaint.submittedAt);
        const matchesFromDate = !fromDate || complaintDate >= new Date(fromDate);
        const matchesToDate = !toDate || complaintDate <= new Date(toDate + 'T23:59:59');
        
        return matchesSearch && matchesCategory && matchesLocation && 
               matchesStatus && matchesFromDate && matchesToDate;
    });
    
    displayComplaints(filteredComplaints);
    
    // Scroll to results
    document.getElementById('complaintsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    
    filteredComplaints = allComplaints;
    displayComplaints(allComplaints);
}

// Add real-time search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 500));
    }
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Open modal with complaint details
function openModal(complaint) {
    const modal = document.getElementById('complaintModal');
    const modalImages = document.getElementById('modalImages');
    const modalBody = document.getElementById('modalBody');
    
    // Build images section
    let imagesHTML = '';
    if (complaint.images && complaint.images.length > 0) {
        const mainImage = `${API_URL}${complaint.images[0]}`;
        imagesHTML = `
            <img src="${mainImage}" alt="${complaint.category}" class="modal-image" id="mainModalImage" onerror="this.src='https://via.placeholder.com/900x400/667eea/ffffff?text=No+Image'">
        `;
    } else {
        imagesHTML = `
            <img src="https://via.placeholder.com/900x400/667eea/ffffff?text=No+Image" alt="No Image" class="modal-image">
        `;
    }
    
    modalImages.innerHTML = imagesHTML;
    
    // Build body section
    const statusClass = `status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`;
    const date = new Date(complaint.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let galleryHTML = '';
    if (complaint.images && complaint.images.length > 1) {
        galleryHTML = `
            <div class="image-gallery">
                ${complaint.images.map((img, index) => `
                    <img src="${API_URL}${img}" 
                         alt="Image ${index + 1}" 
                         class="gallery-thumb" 
                         onclick="changeMainImage('${API_URL}${img}')"
                         onerror="this.src='https://via.placeholder.com/80/667eea/ffffff?text=Error'">
                `).join('')}
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div>
                <span class="category-badge">${complaint.category}</span>
                <span class="status-badge ${statusClass}">${complaint.status}</span>
            </div>
        </div>
        
        <h2 style="color: #333; margin-bottom: 15px;">📍 ${complaint.location}</h2>
        
        <div style="color: #666; margin-bottom: 20px;">
            <p><strong>👤 Reported by:</strong> ${complaint.userName}</p>
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>🆔 Complaint ID:</strong> ${complaint._id}</p>
        </div>
        
        <h3 style="color: #667eea; margin-bottom: 10px;">Description</h3>
        <p style="color: #333; line-height: 1.8; margin-bottom: 20px;">${complaint.description}</p>
        
        ${galleryHTML}
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('complaintModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Change main image in modal
function changeMainImage(imageUrl) {
    const mainImage = document.getElementById('mainModalImage');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('complaintModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Export for debugging
window.debugComplaints = () => {
    console.log('All Complaints:', allComplaints);
    console.log('Filtered Complaints:', filteredComplaints);
};
