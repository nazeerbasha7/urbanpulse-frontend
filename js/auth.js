// Production API URL
const API_URL = 'https://urbanpulse-backend.onrender.com';

// Toast Notification System (ONLY show when called explicitly)
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return; // Don't show if container doesn't exist
  
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

// Update navbar with user name (silent - no toast)
window.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('userName');
  const userNameElement = document.getElementById('userName');
  
  if (userName && userNameElement) {
    userNameElement.textContent = `👤 ${userName}`;
  }
});

// Registration with AUTO-LOGIN
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = document.getElementById('submitBtn');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Registering...<span class="spinner"></span>';
    
    const userData = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      password: document.getElementById('password').value,
      phone: document.getElementById('phone').value.trim(),
      city: document.getElementById('city').value.trim(),
      address: document.getElementById('address').value.trim()
    };
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Auto-login: Save token and user info
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userName', data.userName);
          localStorage.setItem('userId', data.userId);
          
          showToast('🎉 Registration successful! Redirecting...', 'success');
          
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          showToast('✅ Registration successful! Please login.', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
      } else {
        showToast(data.message || 'Registration failed', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Network error. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Login (NO toast on page load, only on submit)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = document.getElementById('loginBtn');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Logging in...<span class="spinner"></span>';
    
    const loginData = {
      email: document.getElementById('loginEmail').value.trim().toLowerCase(),
      password: document.getElementById('loginPassword').value
    };
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.userName);
        localStorage.setItem('userId', data.userId);
        
        showToast('🎉 Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showToast(data.message || 'Login failed', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

// Auth check (silent - no toast)
function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  if (!token && (currentPage.includes('dashboard') || currentPage.includes('submit-complaint'))) {
    // Redirect silently
    window.location.href = 'login.html';
  }
}

checkAuth();
