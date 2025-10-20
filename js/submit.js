const API_URL = 'https://urbanpulse-backend.onrender.com';
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

if (!token) {
  window.location.href = 'login.html';
}

const userNameElement = document.getElementById('userName');
if (userNameElement && userName) {
  userNameElement.textContent = `👤 ${userName}`;
}

// Media preview
document.getElementById('media').addEventListener('change', (e) => {
  const files = e.target.files;
  const preview = document.getElementById('mediaPreview');
  preview.innerHTML = '';

  if (files.length > 0) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// Form submission
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitButton = document.getElementById('submitBtn');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Submitting...<span class="spinner"></span>';

  const formData = new FormData(e.target);
  formData.append('userId', userId);
  formData.append('userName', userName);

  try {
    const response = await fetch(`${API_URL}/submit-complaint`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showToast('✅ Complaint submitted successfully!', 'success');
      e.target.reset();
      document.getElementById('mediaPreview').innerHTML = '';
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showToast(data.message || 'Submission failed', 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  } catch (error) {
    console.error('Submission error:', error);
    showToast('Network error. Please try again.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}
