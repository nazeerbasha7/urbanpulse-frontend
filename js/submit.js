const API_URL = 'https://urbanpulse-backend.onrender.com';
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');

if (!token) {
  alert('⚠️ Please login first');
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = `👤 ${userName}`;

// Media preview
document.getElementById('media').addEventListener('change', (e) => {
  const files = e.target.files;
  const preview = document.getElementById('mediaPreview');
  preview.innerHTML = '';

  if (files.length > 0) {
    preview.classList.remove('hidden');

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.className = 'w-full h-24 object-cover rounded-lg';
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    preview.classList.add('hidden');
  }
});

// Form submission
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  const formData = new FormData(e.target);
  formData.append('userId', userId);
  formData.append('userName', userName);

  console.log('📤 Submitting complaint...');
  console.log('User:', userName);
  console.log('Category:', formData.get('category'));
  console.log('Location:', formData.get('location'));

  try {
    const response = await fetch(`${API_URL}/submit-complaint`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('📥 Server response:', data);

    if (response.ok) {
      alert('✅ Complaint submitted successfully!');
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ ' + data.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Complaint';
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
    alert('❌ Submission failed: ' + error.message);
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Complaint';
  }
});

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}
