/**
 * Cafe Qoder - Cafeteria Management System
 * Main JavaScript File
 */

// ========================================
// Global Variables
// ========================================
let cart = JSON.parse(localStorage.getItem('cafeQoderCart')) || [];
let reservations = JSON.parse(localStorage.getItem('cafeQoderReservations')) || [];
let orders = JSON.parse(localStorage.getItem('cafeQoderOrders')) || [];
let selectedSection = '';
let selectedTable = null;
let menu = [];

const defaultMenuItems = [
    { id: 1, name: 'Garlic Bread', price: 499, category: 'starters', description: 'Freshly baked bread with garlic butter', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b98c6?w=800&q=80' },
    { id: 2, name: 'Bruschetta', price: 699, category: 'starters', description: 'Grilled bread with tomatoes and basil', image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=800&q=80' },
    { id: 3, name: 'Soup of the Day', price: 599, category: 'starters', description: 'Chef\'s special soup', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },
    { id: 4, name: 'Caprese Salad', price: 799, category: 'starters', description: 'Fresh buffalo mozzarella and tomatoes', image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80' },
    { id: 5, name: 'Mozzarella Sticks', price: 649, category: 'starters', description: 'Golden fried mozzarella', image: 'https://images.unsplash.com/photo-1531478140961-78ef75970429?w=800&q=80' },
    { id: 6, name: 'Chicken Wings', price: 899, category: 'starters', description: 'Spicy buffalo wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80' },
    { id: 7, name: 'Espresso', price: 350, category: 'beverages', description: 'Rich single shot espresso', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80' },
    { id: 8, name: 'Cappuccino', price: 450, category: 'beverages', description: 'Espresso with steamed milk', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&q=80' },
    { id: 9, name: 'Signature Latte', price: 499, category: 'beverages', description: 'Smooth espresso with milk', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab752?w=800&q=80' },
    { id: 10, name: 'Espresso Martini', price: 450, category: 'beverages', description: 'Chilled mocktail coffee', image: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=800&q=80' },
    { id: 11, name: 'Fresh Orange Juice', price: 399, category: 'beverages', description: 'Freshly squeezed orange juice', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80' },
    { id: 12, name: 'Hot Chocolate', price: 425, category: 'beverages', description: 'Rich and creamy hot chocolate', image: 'https://images.unsplash.com/photo-1544787210-2213d6439977?w=800&q=80' },
    { id: 13, name: 'Chocolate Lava Cake', price: 600, category: 'desserts', description: 'Decadent chocolate layer cake', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80' },
    { id: 14, name: 'Cheesecake', price: 550, category: 'desserts', description: 'Creamy New York style cheesecake', image: 'https://images.unsplash.com/photo-1524351199679-46cddfdb54c0?w=800&q=80' },
    { id: 15, name: 'Artisanal Tiramisu', price: 650, category: 'desserts', description: 'Classic Italian coffee-flavored dessert', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80' },
    { id: 16, name: 'Brownie with Ice Cream', price: 599, category: 'desserts', description: 'Warm fudgy brownie with vanilla ice cream', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },
    { id: 17, name: 'Apple Pie', price: 525, category: 'desserts', description: 'Warm apple pie', image: 'https://images.unsplash.com/photo-1535927394931-97b779951151?w=800&q=80' },
    { id: 18, name: 'Brownie', price: 450, category: 'desserts', description: 'Fudgy chocolate brownie', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80' }
];

let menuItems = JSON.parse(localStorage.getItem('cafeQoderMenu')) || defaultMenuItems;

// ========================================
// API Configuration
// ========================================
const API_BASE_URL = '/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-User-Role': currentUser ? currentUser.role : 'guest',
            'X-User-Username': currentUser ? currentUser.username : ''
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Authentication Logic
let currentUser = JSON.parse(localStorage.getItem('cafeQoderUser')) || null;

async function registerUser(fullName, email, username, password) {
    const result = await apiRequest('/register', 'POST', { fullName, email, username, password });
    return result;
}

async function initMenu() {
    try {
        const menuData = await apiRequest('/menu');
        menu = menuData;
        renderMenu();
        initMenuTabs();
    } catch (err) {
        console.error('Failed to load menu');
        // Fallback to local default if API fails (optional)
        menu = defaultMenuItems;
        renderMenu();
        initMenuTabs();
    }
}

async function loginUser(username, password) {
    const result = await apiRequest('/login', 'POST', { username, password });
    if (result.user) {
        currentUser = result.user;
        localStorage.setItem('cafeQoderUser', JSON.stringify(result.user));
        return true;
    }
    return false;
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('cafeQoderUser');
    window.location.href = 'index.html';
}

function updateNavbarAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    if (currentUser) {
        // Replace Login/Register with Profile/Logout
        const authItems = navLinks.querySelectorAll('li');
        authItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && (link.getAttribute('href') === 'login.html' || link.getAttribute('href') === 'register.html')) {
                item.remove();
            }
        });

        const profileLi = document.createElement('li');
        profileLi.innerHTML = `<a href="profile.html">Profile</a>`;
        navLinks.appendChild(profileLi);

        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" onclick="logoutUser()">Logout</a>`;
        navLinks.appendChild(logoutLi);
    }
}

function checkAdminAccess() {
    const isPageAdmin = window.location.pathname.toLowerCase().endsWith('admin.html') || 
                        window.location.href.toLowerCase().includes('/admin.html');
                        
    if (isPageAdmin) {
        if (!currentUser || currentUser.role !== 'admin') {
            showNotification('Access denied. Admin only.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
        }
    }
    
    // Hide admin links from footer/nav for regular users
    if (!currentUser || currentUser.role !== 'admin') {
        const adminLinks = document.querySelectorAll('.admin-link, a[href="admin.html"]');
        adminLinks.forEach(link => {
            if (!link.classList.contains('sidebar-link')) { // Don't hide if already in admin sidebar (though they should be redirected anyway)
                 link.style.display = 'none';
            }
        });
    }
}

function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = this.username.value.trim();
            const password = this.password.value.trim();
            
            try {
                if (await loginUser(username, password)) {
                    showNotification('Login successful! Welcome back.', 'success');
                    setTimeout(() => {
                        if (currentUser && currentUser.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'profile.html';
                        }
                    }, 1500);
                }
            } catch (err) { }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fullName = this.fullName.value.trim();
            const email = this.email.value.trim();
            const username = this.regUsername.value.trim();
            const password = this.regPassword.value.trim();
            const confirmPassword = this.confirmPassword.value.trim();

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            try {
                const result = await registerUser(fullName, email, username, password);
                if (result.user) {
                    // Auto-login
                    currentUser = result.user;
                    localStorage.setItem('cafeQoderUser', JSON.stringify(result.user));
                    showNotification('Registration successful! Welcome to Lumina Bite.', 'success');
                    setTimeout(() => window.location.href = 'profile.html', 1500);
                } else {
                    showNotification('Registration successful! Please login.', 'success');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                }
            } catch (err) {
                // Error handled by apiRequest
            }
        });
    }
}

// Initializations for Auth
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
    checkAdminAccess();
    initAuthForms();
    // renderCart(); // This is called in initCart() already
    // ... rest of init calls handled by the main DOMContentLoaded
});

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCart();
    initMenuTabs();
    initReservationForm();
    // initLoginForm(); // Redundant
    // initRegisterForm(); // Redundant
    initContactForm();
    initAdminDashboard();
    initTablesGrid();
    setMinDate();
    initSpecialOffersTimer();
});

// ========================================
// Navigation
// ========================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// ========================================
// Special Offers Timer
// ========================================
function initSpecialOffersTimer() {
    function updateTimers() {
        const now = new Date().getTime();
        let endTime = localStorage.getItem('cafeQoderOfferEnd');

        if (!endTime || now >= endTime) {
            // Set for 12 hours from now
            endTime = now + (12 * 60 * 60 * 1000);
            localStorage.setItem('cafeQoderOfferEnd', endTime);
        }

        const diff = endTime - now;

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.querySelectorAll('.timer').forEach(timer => {
            const h = timer.querySelector('.hours');
            const m = timer.querySelector('.minutes');
            const s = timer.querySelector('.seconds');
            if (h) h.textContent = hours.toString().padStart(2, '0');
            if (m) m.textContent = minutes.toString().padStart(2, '0');
            if (s) s.textContent = seconds.toString().padStart(2, '0');
        });
    }

    updateTimers();
    setInterval(updateTimers, 1000);
}

// ========================================
// Cart Functions
// ========================================
function initCart() {
    saveCart();
    updateCartCount();
    
    // Auto-fill table and arrival time if reserved
    const bookedTable = localStorage.getItem('bookedTable');
    const bookedArrivalTime = localStorage.getItem('bookedArrivalTime');
    if (bookedTable) {
        const tableInput = document.getElementById('orderTableNumber');
        if (tableInput) {
            tableInput.value = bookedTable;
            localStorage.removeItem('bookedTable');
        }
    }
    if (bookedArrivalTime) {
        const arrivalInput = document.getElementById('orderArrivalTime');
        if (arrivalInput) {
            arrivalInput.value = bookedArrivalTime;
            localStorage.removeItem('bookedArrivalTime');
        }
    }
    
    renderCart();
}

function addToCart(id, name, price, image = '') {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    showCartSummary();
    showNotification(`${name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
}

function saveCart() {
    localStorage.setItem('cafeQoderCart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCount.forEach(count => {
        count.textContent = totalItems;
    });
}

function showCartSummary() {
    const summaryBar = document.getElementById('cartSummaryBar');
    if (summaryBar) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('cartSummaryText').textContent = `${totalItems} item(s) in cart`;
        document.getElementById('cartSummaryTotal').textContent = `Total: ₹${totalPrice.toFixed(2)}`;
        
        summaryBar.style.display = 'block';
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
                <div class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;

    // Update summary
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

async function placeOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    try {
        const customerName = document.getElementById('orderCustomerName').value || (currentUser ? currentUser.fullName : '');
        const tableNumber = document.getElementById('orderTableNumber').value;
        const arrivalTime = document.getElementById('orderArrivalTime').value;

        if (!customerName || !tableNumber || !arrivalTime) {
            showNotification('Please fill in all order details', 'error');
            return;
        }

        const result = await apiRequest('/orders', 'POST', {
            items: cart,
            total: total,
            customer_name: customerName,
            table_number: tableNumber,
            arrival_time: arrivalTime
        });

        // Clear cart locally
        const orderedItems = [...cart];
        cart = [];
        saveCart();
        updateCartCount();

        // Show confirmation modal
        showOrderModal({
            id: result.order_id,
            items: orderedItems,
            total: total
        });
        
        showNotification('Order placed successfully!', 'success');
    } catch (err) {
        // Error handled by apiRequest
    }
}

function showOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');

    if (modal && details) {
        let itemsHtml = '<ul style="margin: 10px 0; padding-left: 20px;">';
        order.items.forEach(item => {
            itemsHtml += `<li>${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        itemsHtml += '</ul>';

        details.innerHTML = `
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Items:</strong></p>
            ${itemsHtml}
            <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
        `;

        modal.classList.add('active');
    }
}

// ========================================
// Menu Tabs
// ========================================
function initMenuTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuCategories = document.querySelectorAll('.menu-category');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;

            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding category
            menuCategories.forEach(cat => {
                cat.classList.remove('active');
                if (cat.id === category) {
                    cat.classList.add('active');
                }
            });
        });
    });
}

// ========================================
// Reservation Functions
// ========================================
function initReservationForm() {
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
}

function setMinDate() {
    const dateInput = document.getElementById('reservationDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

function selectSection(section) {
    selectedSection = section;
    
    // Update UI
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('selected');

    // Update form
    const sectionInput = document.getElementById('selectedSection');
    if (sectionInput) {
        sectionInput.value = section.charAt(0).toUpperCase() + section.slice(1) + ' Section';
    }

    // Generate tables for selected section
    generateTables(section);
}

function initTablesGrid() {
    generateTables('starters');
}

function generateTables(section) {
    const grid = document.getElementById('tablesGrid');
    if (!grid) return;

    const tableCounts = {
        'starters': 8,
        'beverages': 6,
        'desserts': 5
    };

    const count = tableCounts[section] || 6;
    let html = '';

    for (let i = 1; i <= count; i++) {
        const isReserved = Math.random() < 0.2; // 20% chance of being reserved
        const status = isReserved ? 'reserved' : 'available';
        html += `
            <div class="table-item ${status}" data-table="${i}" onclick="selectTable(${i}, this)">
                T${i}
            </div>
        `;
    }

    grid.innerHTML = html;
}

function selectTable(tableNum, element) {
    if (element.classList.contains('reserved')) {
        showNotification('This table is already reserved!', 'error');
        return;
    }

    // Remove previous selection
    document.querySelectorAll('.table-item').forEach(t => t.classList.remove('selected'));
    
    // Add selection
    element.classList.add('selected');
    selectedTable = tableNum;
}

async function handleReservationSubmit(e) {
    e.preventDefault();

    // Validate form
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const persons = document.getElementById('numPersons').value;
    const date = document.getElementById('reservationDate').value;
    const time = document.getElementById('arrivalTime').value;

    // Clear previous errors
    clearErrors();

    let isValid = true;
    if (!name) { showError('nameError', 'Please enter your name'); isValid = false; }
    if (!phone || !validatePhone(phone)) { showError('phoneError', 'Please enter a valid phone number'); isValid = false; }
    if (!persons) { showError('personsError', 'Please select number of persons'); isValid = false; }
    if (!date) { showError('dateError', 'Please select a date'); isValid = false; }
    if (!time) { showError('timeError', 'Please select a time'); isValid = false; }
    if (!selectedSection) { showError('sectionError', 'Please select a section'); isValid = false; }

    if (!isValid) return;

    try {
        const reservationData = {
            name, phone, persons, date, time,
            section: selectedSection,
            table: selectedTable,
            special_requests: document.getElementById('specialRequests').value
        };

        const result = await apiRequest('/reservations', 'POST', reservationData);
        
        // If from cart, store table info and arrival time
        if (sessionStorage.getItem('returnToCart') === 'true') {
            const tableStr = `${reservationData.section.charAt(0).toUpperCase() + reservationData.section.slice(1)} - T${reservationData.table}`;
            localStorage.setItem('bookedTable', tableStr);
            localStorage.setItem('bookedArrivalTime', reservationData.time);
        }

        // Show confirmation
        showConfirmationModal({ ...reservationData, id: result.reservation_id });

        // Reset form
        e.target.reset();
        selectedSection = '';
        selectedTable = null;
        document.querySelectorAll('.section-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.table-item').forEach(t => t.classList.remove('selected'));
        
        showNotification('Reservation submitted!', 'success');
    } catch (err) {
        // Error handled by apiRequest
    }
}

function showConfirmationModal(reservation) {
    const modal = document.getElementById('confirmationModal');
    const details = document.getElementById('confirmationDetails');

    if (modal && details) {
        details.innerHTML = `
            <p><strong>Name:</strong> ${reservation.name}</p>
            <p><strong>Phone:</strong> ${reservation.phone}</p>
            <p><strong>Section:</strong> ${reservation.section.charAt(0).toUpperCase() + reservation.section.slice(1)} Section</p>
            <p><strong>Table:</strong> Table ${reservation.table || 'TBD'}</p>
            <p><strong>Persons:</strong> ${reservation.persons}</p>
            <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
            <p><strong>Time:</strong> ${formatTime(reservation.time)}</p>
        `;

        modal.classList.add('active');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // If from cart, redirect back
    if (sessionStorage.getItem('returnToCart') === 'true') {
        sessionStorage.removeItem('returnToCart');
        window.location.href = 'cart.html';
    }
}

// ========================================
// Login & Register Forms
// ========================================
// Redundant login/register init functions removed in favor of initAuthForms

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    if (!strengthBar) return;

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    strengthBar.className = 'strength-bar';
    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            this.reset();
        });
    }
}

// ========================================
// Admin Dashboard
// ========================================
async function initAdminDashboard() {
    if (!document.querySelector('.admin-body')) return;

    try {
        await updateDashboardStats();
        await renderReservationsTable();
        await renderOrdersTable();
        await renderAdminMenu();
        initMenuManagement();
    } catch (err) {
        console.error('Admin initialization failed:', err);
    }
}

function showSection(sectionName) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

async function updateDashboardStats() {
    const totalReservations = document.getElementById('totalReservations');
    const totalOrders = document.getElementById('totalOrders');
    const totalRevenue = document.getElementById('totalRevenue');

    try {
        const reservationsData = await apiRequest('/reservations');
        const ordersData = await apiRequest('/orders');
        const menuData = await apiRequest('/menu');

        if (totalReservations) totalReservations.textContent = reservationsData.length;
        if (totalOrders) totalOrders.textContent = ordersData.length;
        
        if (totalRevenue) {
            const revenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
            totalRevenue.textContent = `₹${revenue.toFixed(2)}`;
        }

        const totalMenuItems = document.getElementById('totalMenuItems');
        if (totalMenuItems) totalMenuItems.textContent = menuData.length;

        // Render recent items
        renderRecentReservations(reservationsData);
        renderRecentOrders(ordersData);
    } catch (err) {
        console.error('Failed to update stats');
    }
}

function renderRecentReservations(data = []) {
    const container = document.getElementById('recentReservations');
    if (!container) return;

    const recent = data.slice(0, 5); // Data comes sorted by date from backend
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No reservations yet</p>';
        return;
    }

    container.innerHTML = recent.map(r => `
        <div class="recent-item">
            <div class="recent-item-info">
                <h4>${r.name}</h4>
                <p>${formatDate(r.date)} at ${formatTime(r.time)}</p>
            </div>
            <span class="recent-item-status status-badge status-${r.status.toLowerCase()}">${r.status}</span>
        </div>
    `).join('');
}

function renderRecentOrders(data = []) {
    const container = document.getElementById('recentOrders');
    if (!container) return;

    const recent = data.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No orders yet</p>';
        return;
    }

    container.innerHTML = recent.map(o => `
        <div class="recent-item">
            <div class="recent-item-info">
                <h4>Order #${o.id}</h4>
                <p>${o.items.length} items - ₹${o.total.toFixed(2)}</p>
            </div>
            <span class="recent-item-status status-badge status-${o.status.toLowerCase()}">${o.status}</span>
        </div>
    `).join('');
}

async function renderReservationsTable() {
    const tbody = document.getElementById('reservationsTableBody');
    if (!tbody) return;

    try {
        const reservationsData = await apiRequest('/reservations');
        
        if (reservationsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No reservations found</td></tr>';
            return;
        }

        tbody.innerHTML = reservationsData.map(r => {
            const status = (r.status || 'Pending').toLowerCase();
            let actionButtons = '';
            
            if (status === 'pending') {
                actionButtons = `
                    <button class="btn btn-small btn-success" onclick="updateResStatus(${r.id}, 'Confirmed')">Confirm</button>
                    <button class="btn btn-small btn-danger" onclick="updateResStatus(${r.id}, 'Cancelled')">Cancel</button>
                `;
            } else if (status === 'confirmed') {
                actionButtons = `
                    <button class="btn btn-small btn-danger" onclick="updateResStatus(${r.id}, 'Cancelled')">Cancel</button>
                `;
            } else if (status === 'cancelled') {
                actionButtons = `
                    <button class="btn btn-small btn-secondary" onclick="updateResStatus(${r.id}, 'Pending')">Restore</button>
                `;
            }

            return `
                <tr>
                    <td>#${r.id}</td>
                    <td>${r.name}</td>
                    <td>${r.phone}</td>
                    <td>${r.section}</td>
                    <td>${r.persons}</td>
                    <td>${formatDate(r.date)}</td>
                    <td>${formatTime(r.time)}</td>
                    <td><span class="status-badge status-${status}">${r.status || 'Pending'}</span></td>
                    <td class="actions">
                        ${actionButtons}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9">Error loading reservations</td></tr>';
    }
}

async function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    try {
        const ordersData = await apiRequest('/orders');
        
        if (ordersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = ordersData.map(o => {
            const status = (o.status || 'Pending').toLowerCase();
            let actionButtons = '';
            
            if (status === 'pending') {
                actionButtons = `
                    <button class="btn btn-small btn-primary" onclick="updateOrdStatus(${o.id}, 'Preparing')">Prepare</button>
                    <button class="btn btn-small btn-danger" onclick="updateOrdStatus(${o.id}, 'Cancelled')">Cancel</button>
                `;
            } else if (status === 'preparing') {
                actionButtons = `
                    <button class="btn btn-small btn-info" onclick="updateOrdStatus(${o.id}, 'Ready')">Mark Ready</button>
                    <button class="btn btn-small btn-danger" onclick="updateOrdStatus(${o.id}, 'Cancelled')">Cancel</button>
                `;
            } else if (status === 'ready') {
                actionButtons = `
                    <button class="btn btn-small btn-success" onclick="updateOrdStatus(${o.id}, 'Completed')">Complete</button>
                    <button class="btn btn-small btn-danger" onclick="updateOrdStatus(${o.id}, 'Cancelled')">Cancel</button>
                `;
            } else if (status === 'cancelled') {
                actionButtons = `
                    <button class="btn btn-small btn-secondary" onclick="updateOrdStatus(${o.id}, 'Pending')">Restore</button>
                `;
            }

            return `
                <tr>
                <td>#${o.id}</td>
                <td>${o.customer_name || 'Guest'}</td>
                <td>${o.table_number || 'TBD'}</td>
                <td>
                    <div class="order-items-summary">
                        ${o.items.map(item => `<div>${item.name} x ${item.quantity}</div>`).join('')}
                    </div>
                </td>
                <td>₹${o.total.toFixed(2)}</td>
                <td>${o.arrival_time || '-'}</td>
                    <td><span class="status-badge status-${status}">${o.status}</span></td>
                    <td class="actions">
                        ${actionButtons}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="8">Error loading orders</td></tr>';
    }
}

async function updateResStatus(id, status) {
    try {
        await apiRequest(`/reservations/${id}/status`, 'PUT', { status });
        renderReservationsTable();
        updateDashboardStats();
        showNotification('Reservation updated!', 'success');
    } catch (err) { }
}

async function delReservation(id) {
    if (confirm('Delete this reservation?')) {
        try {
            await apiRequest(`/reservations/${id}`, 'DELETE');
            renderReservationsTable();
            updateDashboardStats();
            showNotification('Reservation deleted!', 'success');
        } catch (err) { }
    }
}

async function updateOrdStatus(id, status) {
    try {
        await apiRequest(`/orders/${id}/status`, 'PUT', { status });
        renderOrdersTable();
        updateDashboardStats();
        showNotification('Order status updated!', 'success');
    } catch (err) { }
}

async function updateOrderStatus(id, status) {
    // Alias for existing calls if any
    await updateOrdStatus(id, status);
}

async function renderAdminMenu(filter = 'all') {
    const grid = document.getElementById('adminMenuGrid');
    if (!grid) return;

    try {
        const menuData = await apiRequest('/menu');
        const filtered = filter === 'all' ? menuData : menuData.filter(item => item.category === filter);

        grid.innerHTML = filtered.map(item => `
            <div class="admin-menu-item">
                <div class="admin-item-img">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80'}" alt="${item.name}">
                </div>
                <div class="admin-item-info">
                    <h4>${item.name}</h4>
                    <p class="category">${item.category}</p>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                    <div class="actions">
                        <button class="btn btn-small btn-primary" onclick="editMenuItem(${item.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<p>Error loading menu.</p>';
    }
}

function initMenuManagement() {
    const form = document.getElementById('menuItemForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = document.getElementById('editItemId').value;
            const name = document.getElementById('itemName').value;
            const price = parseFloat(document.getElementById('itemPrice').value);
            const category = document.getElementById('itemCategory').value;
            const description = document.getElementById('itemDescription').value;
            const image = document.getElementById('itemImage') ? document.getElementById('itemImage').value : '';

            const itemData = { name, price, category, description, image };
            if (id) itemData.id = id;

            try {
                await apiRequest('/menu', 'POST', itemData);
                renderAdminMenu();
                resetMenuForm();
                showNotification(id ? 'Item updated!' : 'Item added!', 'success');
            } catch (err) { }
        });
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderAdminMenu(this.dataset.filter);
        });
    });
}

async function editMenuItem(id) {
    try {
        const menuData = await apiRequest('/menu');
        const item = menuData.find(i => i.id === id);
        if (item) {
            document.getElementById('editItemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemDescription').value = item.description || '';
            const imageInput = document.getElementById('itemImage');
            if (imageInput) imageInput.value = item.image || '';
        }
    } catch (err) { }
}

async function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await apiRequest(`/menu/${id}`, 'DELETE');
            renderAdminMenu();
            showNotification('Item deleted!', 'success');
        } catch (err) { }
    }
}

function resetMenuForm() {
    const form = document.getElementById('menuItemForm');
    if (form) {
        form.reset();
        document.getElementById('editItemId').value = '';
    }
}

// ========================================
// Utility Functions
// ========================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .status-badge {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    .status-confirmed, .status-completed {
        background-color: #d4edda;
        color: #155724;
    }
    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }
    .status-preparing {
        background-color: #cce5ff;
        color: #004085;
    }
    .status-ready {
        background-color: #d1ecf1;
        color: #0c5460;
    }
    .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
    }
    .no-data {
        text-align: center;
        color: #999;
        padding: 20px;
    }
`;
document.head.appendChild(style);

// ========================================
// User Orders Logic
// ========================================
async function renderUserOrders() {
    const activeOrdersList = document.getElementById('activeOrdersList');
    const orderHistoryList = document.getElementById('orderHistoryList');
    
    if (!activeOrdersList || !orderHistoryList) return;

    if (!currentUser) {
        showNotification('Please login to view your orders', 'error');
        window.location.href = 'login.html';
        return;
    }

    try {
        const orders = await apiRequest('/orders');
        
        if (orders.length === 0) {
            activeOrdersList.innerHTML = '<div class="no-data">No active orders found.</div>';
            orderHistoryList.innerHTML = '<div class="no-data">No order history found.</div>';
            return;
        }

        const activeOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
        const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

        // Render Active Orders
        activeOrdersList.innerHTML = activeOrders.map(o => {
            const canCancel = o.status === 'Pending';
            const cancelBtn = canCancel ? `<button class="btn btn-small btn-danger cancel-order-btn" onclick="cancelOrder(${o.id})">Cancel Order</button>` : '';

            return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${o.id}</span>
                    <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
                </div>
                <div class="order-body">
                    <ul class="order-items">
                        ${o.items.map(item => `<li>${item.name} x ${item.quantity || 1}</li>`).join('')}
                    </ul>
                    <div class="order-meta">
                        <span>Total: ₹${o.total.toFixed(2)}</span>
                        <span>Date: ${formatDate(o.date)}</span>
                        ${o.arrival_time ? `<span>Arrival: ${o.arrival_time}</span>` : ''}
                    </div>
                </div>
                <div class="order-footer">
                    ${cancelBtn}
                    <p class="tracking-info">Estimated Delivery: 30-45 mins</p>
                </div>
            </div>
            `;
        }).join('');

        if (activeOrders.length === 0) {
            activeOrdersList.innerHTML = '<div class="no-data">No active orders found.</div>';
        }

        // Render Past Orders
        orderHistoryList.innerHTML = pastOrders.map(o => `
            <div class="order-card history-card">
                <div class="order-header">
                    <span class="order-id">Order #${o.id}</span>
                    <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
                </div>
                <div class="order-body">
                    <div class="order-meta">
                        <span>Items: ${o.items.length}</span>
                        <span>Total: ₹${o.total.toFixed(2)}</span>
                        <span>Date: ${formatDate(o.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (pastOrders.length === 0) {
            orderHistoryList.innerHTML = '<div class="no-data">No order history found.</div>';
        }

    } catch (err) {
        activeOrdersList.innerHTML = '<div class="no-data">Error loading orders.</div>';
    }
}

async function cancelOrder(orderId) {
    try {
        await apiRequest(`/orders/${orderId}/cancel`, 'PUT');
        showNotification('Order cancelled successfully!', 'success');
        renderUserOrders(); // Refresh the list
    } catch (err) {
        // Error handled by apiRequest
    }
}

// Add global listener for page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('orders.html')) {
        renderUserOrders();
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event && event.target && event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});
