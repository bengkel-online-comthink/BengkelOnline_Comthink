// Bengkel Online - JavaScript Application
// Author: Professional Web Developer
// Version: 1.0

// Application State
const AppState = {
    currentUser: null,
    bookings: [],
    users: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    updateUI();
    updateNavbarByRole();
});

// Initialize Application Data
function initializeApp() {
    // Load data from localStorage
    const savedUsers = localStorage.getItem('bengkel_users');
    const savedBookings = localStorage.getItem('bengkel_bookings');
    const savedCurrentUser = localStorage.getItem('bengkel_current_user');
    
    if (savedUsers) {
        AppState.users = JSON.parse(savedUsers);
    } else {
        // Create default admin user
        AppState.users = [
            {
                id: 'admin',
                fullname: 'Administrator',
                username: 'admin',
                password: 'admin123',
                email: 'admin@bengkel.com',
                phone: '081234567890',
                address: 'Jl. Admin No. 1',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsersData();
    }
    
    if (savedBookings) {
        AppState.bookings = JSON.parse(savedBookings);
    }
    
    if (savedCurrentUser) {
        AppState.currentUser = JSON.parse(savedCurrentUser);
    }
}

function updateNavbarByRole() {
    const adminNav = document.getElementById("adminBookingNav");

    if (!adminNav) return;

    if (AppState.currentUser && AppState.currentUser.id === 'admin') {
        adminNav.style.display = 'flex';
    } else {
        adminNav.style.display = 'none';
    }
}


// Save Data to localStorage
function saveUsersData() {
    localStorage.setItem('bengkel_users', JSON.stringify(AppState.users));
}

function saveBookingsData() {
    localStorage.setItem('bengkel_bookings', JSON.stringify(AppState.bookings));
}

function saveCurrentUser() {
    localStorage.setItem('bengkel_current_user', JSON.stringify(AppState.currentUser));
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Booking Form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    // Set minimum date for booking
    const bookingDateInput = document.getElementById('bookingDate');
    if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', today);
    }
}

// Load User Data
function loadUserData() {
    const currentUserSpan = document.getElementById('currentUser');
    if (currentUserSpan && AppState.currentUser) {
        currentUserSpan.textContent = AppState.currentUser.fullname || AppState.currentUser.username;
    }
}

// Update UI based on authentication
function updateUI() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (AppState.currentUser) {
        // User is logged in
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'home.html';
        }
    } else {
        // User is not logged in
        if (currentPage !== 'index.html' && currentPage !== 'register.html' && currentPage !== '') {
            window.location.href = 'index.html';
        }
    }
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('error', 'Username dan password harus diisi!');
        return;
    }
    
    const user = AppState.users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        AppState.currentUser = user;
        saveCurrentUser();
        updateNavbarByRole();
        
        // Remember me functionality
        const remember = document.getElementById('remember');
        if (remember && remember.checked) {
            localStorage.setItem('bengkel_remember_me', 'true');
        }
        
        showAlert('success', 'Login berhasil! Mengarahkan ke halaman utama...');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        showAlert('error', 'Username atau password salah!');
    }
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Validation
    if (!userData.fullname || !userData.username || !userData.password || 
        !userData.email || !userData.phone || !userData.address) {
        showAlert('error', 'Semua field harus diisi!');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showAlert('error', 'Password dan konfirmasi password tidak cocok!');
        return;
    }
    
    if (userData.password.length < 6) {
        showAlert('error', 'Password minimal 6 karakter!');
        return;
    }
    
    // Check if username or email already exists
    const existingUser = AppState.users.find(u => 
        u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
        showAlert('error', 'Username atau email sudah terdaftar!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        fullname: userData.fullname,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        createdAt: new Date().toISOString()
    };
    
    AppState.users.push(newUser);
    saveUsersData();
    
    showAlert('success', 'Registrasi berhasil! Silakan login...');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Logout
function logout() {
    AppState.currentUser = null;
    localStorage.removeItem('bengkel_current_user');
    localStorage.removeItem('bengkel_remember_me');
    
    showAlert('info', 'Logout berhasil!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ==================== BOOKING FUNCTIONS ====================

// Handle Booking
function handleBooking(event) {
    event.preventDefault();
    
    if (!AppState.currentUser) {
        showAlert('error', 'Silakan login terlebih dahulu!');
        return;
    }
    
    const formData = new FormData(event.target);
    const bookingData = Object.fromEntries(formData.entries());
    
    // Validation
    if (!bookingData.vehicleType || !bookingData.licensePlate || 
        !bookingData.serviceType || !bookingData.bookingDate || !bookingData.vehicleComplaint) {
        showAlert('error', 'Semua field wajib harus diisi!');
        return;
    }
    
    // Create booking
    const newBooking = {
        id: 'BK' + Date.now(),
        userId: AppState.currentUser.id,
        userName: AppState.currentUser.fullname || AppState.currentUser.username,
        vehicleType: bookingData.vehicleType,
        licensePlate: bookingData.licensePlate.toUpperCase(),
        serviceType: bookingData.serviceType,
        bookingDate: bookingData.bookingDate,
        vehicleComplaint: bookingData.vehicleComplaint,
        additionalNotes: bookingData.additionalNotes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    AppState.bookings.push(newBooking);
    saveBookingsData();
    
    // Reset form
    event.target.reset();
    
    showAlert('success', 'Booking berhasil dibuat! Silakan tunggu konfirmasi dari kami.');
    
    // Redirect to history page after 2 seconds
    setTimeout(() => {
        window.location.href = 'history.html';
    }, 2000);
}

// Quick Book Service
function quickBook(serviceType) {
    // Set service type and redirect to home page
    localStorage.setItem('quick_book_service', serviceType);
    window.location.href = 'home.html';
}

// Book Service from Services Page
function bookService(serviceType) {
    localStorage.setItem('quick_book_service', serviceType);
    window.location.href = 'services.html';
}

// Check for quick booking on home page load
window.addEventListener('load', function() {
    const quickBookService = localStorage.getItem('quick_book_service');
    if (quickBookService) {
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect) {
            serviceSelect.value = quickBookService;
        }
        localStorage.removeItem('quick_book_service');
    }
});

// ==================== HISTORY FUNCTIONS ====================

// Filter History
function filterHistory() {
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    loadHistoryList(statusFilter, dateFilter);
}

// Clear Filter
function clearFilter() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDate').value = '';
    loadHistoryList();
}

// Load History List
function loadHistoryList(statusFilter = '', dateFilter = '') {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    
    if (!historyList) return;
    
    let userBookings = AppState.bookings.filter(booking => 
        booking.userId === AppState.currentUser?.id
    );
    
    // Apply filters
    if (statusFilter) {
        userBookings = userBookings.filter(booking => booking.status === statusFilter);
    }
    
    if (dateFilter) {
        userBookings = userBookings.filter(booking => 
            booking.bookingDate.startsWith(dateFilter)
        );
    }
    
    // Sort by created date (newest first)
    userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update statistics
    updateHistoryStats();
    
    if (userBookings.length === 0) {
        historyList.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        historyList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        historyList.innerHTML = userBookings.map(booking => createHistoryItem(booking)).join('');
    }
}

// Create History Item HTML
function createHistoryItem(booking) {
    const serviceNames = {
        'service-rutin': 'Service Rutin',
        'perbaikan-mesin': 'Perbaikan Mesin',
        'ganti-oli': 'Ganti Oli',
        'ganti-ban': 'Ganti Ban',
        'tune-up': 'Tune Up',
        'service-ac': 'Service AC',
        'lainnya': 'Lainnya'
    };
    
    const vehicleNames = {
        'motor': 'Motor',
        'mobil': 'Mobil',
        'truk': 'Truk',
        'bus': 'Bus'
    };
    
    const statusNames = {
        'pending': 'Menunggu',
        'confirmed': 'Terkonfirmasi',
        'in-progress': 'Dalam Proses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    
    return `
        <div class="history-item">
            <div class="history-header">
                <div class="history-id">#${booking.id}</div>
                <div class="history-date">${formatDate(booking.createdAt)}</div>
            </div>
            <div class="history-body">
                <div class="history-details">
                    <div class="history-detail">
                        <label>Jenis Kendaraan</label>
                        <span>${vehicleNames[booking.vehicleType] || booking.vehicleType}</span>
                    </div>
                    <div class="history-detail">
                        <label>Plat Nomor</label>
                        <span>${booking.licensePlate}</span>
                    </div>
                    <div class="history-detail">
                        <label>Layanan</label>
                        <span>${serviceNames[booking.serviceType] || booking.serviceType}</span>
                    </div>
                    <div class="history-detail">
                        <label>Tanggal Booking</label>
                        <span>${formatDate(booking.bookingDate)}</span>
                    </div>
                </div>
                <div class="history-detail">
                    <label>Keluhan</label>
                    <span>${booking.vehicleComplaint}</span>
                </div>
            </div>
            <div class="history-footer">
                <div class="status-badge ${booking.status}">${statusNames[booking.status]}</div>
                <div class="history-actions">
                    <button class="btn-sm btn-info" onclick="showBookingDetail('${booking.id}')">
                        <i class="fas fa-eye"></i>
                        Detail
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update History Statistics
function updateHistoryStats() {
    const userBookings = AppState.bookings.filter(booking => 
        booking.userId === AppState.currentUser?.id
    );
    
    const totalBookings = userBookings.length;
    const completedBookings = userBookings.filter(b => b.status === 'completed').length;
    const pendingBookings = userBookings.filter(b => 
        b.status === 'pending' || b.status === 'confirmed' || b.status === 'in-progress'
    ).length;
    
    const totalElement = document.getElementById('totalBookings');
    const completedElement = document.getElementById('completedBookings');
    const pendingElement = document.getElementById('pendingBookings');
    
    if (totalElement) totalElement.textContent = totalBookings;
    if (completedElement) completedElement.textContent = completedBookings;
    if (pendingElement) pendingElement.textContent = pendingBookings;
}

// Show Booking Detail
function showBookingDetail(bookingId) {
    const booking = AppState.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('bookingDetail');
    
    const serviceNames = {
        'service-rutin': 'Service Rutin',
        'perbaikan-mesin': 'Perbaikan Mesin',
        'ganti-oli': 'Ganti Oli',
        'ganti-ban': 'Ganti Ban',
        'tune-up': 'Tune Up',
        'service-ac': 'Service AC',
        'lainnya': 'Lainnya'
    };
    
    const vehicleNames = {
        'motor': 'Motor',
        'mobil': 'Mobil',
        'truk': 'Truk',
        'bus': 'Bus'
    };
    
    const statusNames = {
        'pending': 'Menunggu',
        'confirmed': 'Terkonfirmasi',
        'in-progress': 'Dalam Proses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    
    modalBody.innerHTML = `
        <div class="booking-detail">
            <div class="detail-section">
                <h4>Informasi Booking</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>ID Booking</label>
                        <span>#${booking.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <span class="status-badge ${booking.status}">${statusNames[booking.status]}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tanggal Booking</label>
                        <span>${formatDate(booking.bookingDate)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tanggal Dibuat</label>
                        <span>${formatDate(booking.createdAt)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Informasi Kendaraan</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Jenis Kendaraan</label>
                        <span>${vehicleNames[booking.vehicleType] || booking.vehicleType}</span>
                    </div>
                    <div class="detail-item">
                        <label>Plat Nomor</label>
                        <span>${booking.licensePlate}</span>
                    </div>
                    <div class="detail-item">
                        <label>Layanan</label>
                        <span>${serviceNames[booking.serviceType] || booking.serviceType}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Keluhan Kendaraan</h4>
                <p>${booking.vehicleComplaint}</p>
            </div>
            
            ${booking.additionalNotes ? `
                <div class="detail-section">
                    <h4>Catatan Tambahan</h4>
                    <p>${booking.additionalNotes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close Booking Modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    loadHistoryList();
});

// ==================== UTILITY FUNCTIONS ====================

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

function toggleRegPassword() {
    const passwordInput = document.getElementById('regPassword');
    const eyeIcon = document.getElementById('regEyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const eyeIcon = document.getElementById('confirmEyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Toggle User Menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Show Forgot Password Modal
function showForgotPassword() {
    const modal = document.getElementById('forgotModal');
    modal.style.display = 'block';
}

// Close Forgot Password Modal
function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    modal.style.display = 'none';
}

// Reset Password
function resetPassword() {
    const resetEmail = document.getElementById('resetEmail').value.trim();
    
    if (!resetEmail) {
        showAlert('error', 'Masukkan email atau username Anda!');
        return;
    }
    
    const user = AppState.users.find(u => 
        u.email === resetEmail || u.username === resetEmail
    );
    
    if (user) {
        showAlert('success', 'Link reset password telah dikirim ke email Anda!');
        closeForgotModal();
    } else {
        showAlert('error', 'Email atau username tidak ditemukan!');
    }
}

// Show Profile
function showProfile() {
    if (!AppState.currentUser) return;
    
    const user = AppState.currentUser;
    alert(`Profil Pengguna\\n\\nNama: ${user.fullname}\\nUsername: ${user.username}\\nEmail: ${user.email}\\nTelepon: ${user.phone}\\nAlamat: ${user.address}\\n\\nFitur lengkap akan segera hadir!`);
}

// Show Terms and Conditions
function showTerms() {
    alert('Syarat dan Ketentuan\\n\\n1. Booking minimal 24 jam sebelum service\\n2. Pembatalan dapat dilakukan minimal 12 jam sebelum jadwal\\n3. Garansi berlaku 30 hari setelah service\\n4. Harga dapat berubah sewaktu-waktu\\n\\nTerima kasih telah mempercayakan kendaraan Anda kepada kami!');
}

// Open WhatsApp
function openWhatsApp() {
    const phone = '6281234567890'; // Format: 62 + nomor tanpa 0
    const message = 'Halo, saya ingin bertanya tentang layanan bengkel online';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Toggle FAQ
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Show Alert
function showAlert(type, message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas ${getAlertIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        ${getAlertStyles(type)}
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Get Alert Icon
function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// Get Alert Styles
function getAlertStyles(type) {
    switch (type) {
        case 'success':
            return 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
        case 'error':
            return 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;';
        case 'warning':
            return 'background: #fef3c7; color: #92400e; border: 1px solid #fbbf24;';
        case 'info':
            return 'background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;';
        default:
            return 'background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;';
    }
}

// Add CSS for alert animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .alert-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
    
    .detail-section {
        margin-bottom: 2rem;
    }
    
    .detail-section h4 {
        color: var(--dark-color);
        margin-bottom: 1rem;
        font-size: 1.125rem;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .detail-item label {
        font-size: 0.875rem;
        color: var(--secondary-color);
        font-weight: 500;
    }
    
    .detail-item span {
        color: var(--dark-color);
        font-weight: 600;
    }
    
    .booking-detail {
        max-height: 500px;
        overflow-y: auto;
    }
`;
document.head.appendChild(style);