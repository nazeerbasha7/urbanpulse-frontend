const API_URL = 'https://urbanpulse-backend.onrender.com';


// Update navbar with user name on load
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  
  if (token && userName) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = `👤 ${userName}`;
    }
  }
});

// Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';
    
    const userData = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      password: document.getElementById('password').value,
      phone: document.getElementById('phone').value.trim(),
      city: document.getElementById('city').value.trim(),
      address: document.getElementById('address').value.trim()
    };
    
    console.log('📝 Registering user:', userData.fullName, userData.email);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📥 Server response:', data);
      
      if (response.ok) {
        alert('✅ ' + data.message);
        window.location.href = 'login.html';
      } else {
        alert('❌ ' + data.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Register Account';
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('❌ Registration failed: ' + error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Register Account';
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    const loginData = {
      email: document.getElementById('loginEmail').value.trim().toLowerCase(),
      password: document.getElementById('loginPassword').value
    };
    
    console.log('🔐 Logging in:', loginData.email);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      console.log('📥 Server response:', data);
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.userName);
        localStorage.setItem('userId', data.userId);
        
        alert('✅ ' + data.message);
        window.location.href = 'dashboard.html';
      } else {
        alert('❌ ' + data.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('❌ Login failed: ' + error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
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

// Auth check
function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  if (!token && (currentPage.includes('dashboard') || currentPage.includes('submit-complaint'))) {
    alert('⚠️ Please login first');
    window.location.href = 'login.html';
  }
}

checkAuth();
