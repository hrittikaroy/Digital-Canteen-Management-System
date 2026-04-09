// Staff positions with monthly allowance
const staffPositions = {
    manager: { name: "Manager", monthlyAllowance: 500 },
    assistant: { name: "Assistant", monthlyAllowance: 350 },
    staff: { name: "Staff", monthlyAllowance: 250 },
    intern: { name: "Intern", monthlyAllowance: 150 }
};

// Department definitions
const departmentSlots = {
    it: { name: "IT Department" },
    hr: { name: "HR Department" },
    finance: { name: "Finance Department" },
    marketing: { name: "Marketing Department" }
};

// Departments can order anytime
function isWithinTimeSlot(department) {
    return true;
}

// Current user and cart persistence
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userBalances = JSON.parse(localStorage.getItem('userBalances')) || {};
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let revenue = parseFloat(localStorage.getItem('revenue')) || 0;
let balance = 0;

// Menu with categories and food images - now loaded from backend
let menuItems = [];

// Default menu items for fallback
const defaultMenuItems = [
    { id: 1, name: "Paneer Butter Masala", item_name: "Paneer Butter Masala", price: 120, category: "indian", stock: 50 },
    { id: 2, name: "Salad", item_name: "Salad", price: 100, category: "continental", stock: 30 },
    { id: 3, name: "Chicken Curry", item_name: "Chicken Curry", price: 130, category: "indian", stock: 35 },
    { id: 4, name: "Chow Mein", item_name: "Chow Mein", price: 80, category: "snacks", stock: 75 },
    { id: 5, name: "Grilled Chicken", item_name: "Grilled Chicken", price: 150, category: "continental", stock: 45 },
    { id: 6, name: "White Sauce Pasta", item_name: "White Sauce Pasta", price: 90, category: "continental", stock: 55 },
    { id: 7, name: "Samosa", item_name: "Samosa", price: 40, category: "snacks", stock: 100 },
    { id: 8, name: "Spring Roll", item_name: "Spring Roll", price: 50, category: "snacks", stock: 80 },
    { id: 9, name: "French Fries", item_name: "French Fries", price: 60, category: "snacks", stock: 120 },
    { id: 10, name: "Butter Chicken with Roti", item_name: "Butter Chicken with Roti", price: 140, category: "indian", stock: 40 },
    { id: 11, name: "Sushi", item_name: "Sushi", price: 150, category: "japanese", stock: 65 },
    { id: 12, name: "Fish and Chips", item_name: "Fish and Chips", price: 110, category: "continental", stock: 35 },
    { id: 13, name: "Burger", item_name: "Burger", price: 90, category: "continental", stock: 60 },
    { id: 14, name: "Cold Coffee", item_name: "Cold Coffee", price: 70, category: "snacks", stock: 80 },
    { id: 15, name: "Ramen", item_name: "Ramen", price: 120, category: "japanese", stock: 40 },
    { id: 16, name: "Tempura", item_name: "Tempura", price: 100, category: "japanese", stock: 50 },
    { id: 17, name: "Grilled Fish", item_name: "Grilled Fish", price: 160, category: "continental", stock: 30 },
    { id: 18, name: "Pasta Carbonara", item_name: "Pasta Carbonara", price: 110, category: "continental", stock: 45 },
    { id: 19, name: "Caesar Salad", item_name: "Caesar Salad", price: 80, category: "continental", stock: 55 },
    { id: 20, name: "Dal Makhani", item_name: "Dal Makhani", price: 100, category: "indian", stock: 60 },
    { id: 21, name: "Nachos", item_name: "Nachos", price: 90, category: "snacks", stock: 70 },
    { id: 22, name: "Pakora", item_name: "Pakora", price: 50, category: "snacks", stock: 90 },
    { id: 23, name: "Onigiri", item_name: "Onigiri", price: 70, category: "japanese", stock: 80 },
    { id: 24, name: "Steak", item_name: "Steak", price: 200, category: "continental", stock: 25 },
    { id: 25, name: "Chole Bhature", item_name: "Chole Bhature", price: 80, category: "indian", stock: 50 },
    { id: 26, name: "Popcorn", item_name: "Popcorn", price: 40, category: "snacks", stock: 100 }
];

const imageMap = {
    "paneer butter masala": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    "salad": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80",
    "chicken curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80",
    "chow mein": "https://images.pexels.com/photos/7138913/pexels-photo-7138913.jpeg?auto=compress&cs=tinysrgb&w=400",
    "grilled chicken": "https://images.pexels.com/photos/6107768/pexels-photo-6107768.jpeg?auto=compress&cs=tinysrgb&w=400",
    "white sauce pasta": "https://images.pexels.com/photos/4374556/pexels-photo-4374556.jpeg?auto=compress&cs=tinysrgb&w=400",
    "samosa": "https://images.pexels.com/photos/21078315/pexels-photo-21078315.jpeg?auto=compress&cs=tinysrgb&w=400",
    "spring roll": "https://images.pexels.com/photos/12356601/pexels-photo-12356601.jpeg?auto=compress&cs=tinysrgb&w=400",
    "french fries": "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
    "butter chicken with roti": "https://images.pexels.com/photos/29186508/pexels-photo-29186508.jpeg?auto=compress&cs=tinysrgb&w=400",
    "sushi": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80",
    "fish and chips": "https://images.pexels.com/photos/34019400/pexels-photo-34019400.jpeg?auto=compress&cs=tinysrgb&w=400",
    "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "cold coffee": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80",
    "ramen": "https://images.pexels.com/photos/33493350/pexels-photo-33493350.jpeg?auto=compress&cs=tinysrgb&w=400",
    "tempura": "https://images.pexels.com/photos/8953714/pexels-photo-8953714.jpeg?auto=compress&cs=tinysrgb&w=400",
    "grilled fish": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80",
    "pasta carbonara": "https://images.pexels.com/photos/20352388/pexels-photo-20352388.jpeg?auto=compress&cs=tinysrgb&w=400",
    "caesar salad": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80",
    "dal makhani": "https://images.pexels.com/photos/28674557/pexels-photo-28674557.jpeg?auto=compress&cs=tinysrgb&w=400",
    "nachos": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80",
    "pakora": "https://images.pexels.com/photos/29547419/pexels-photo-29547419.jpeg?auto=compress&cs=tinysrgb&w=400",
    "onigiri": "https://images.pexels.com/photos/17593638/pexels-photo-17593638.jpeg?auto=compress&cs=tinysrgb&w=400",
    "steak": "https://images.pexels.com/photos/33967668/pexels-photo-33967668.jpeg?auto=compress&cs=tinysrgb&w=400",
    "chole bhature": "https://images.pexels.com/photos/31306976/pexels-photo-31306976.jpeg?auto=compress&cs=tinysrgb&w=400",
    "popcorn": "https://images.pexels.com/photos/7234408/pexels-photo-7234408.jpeg?auto=compress&cs=tinysrgb&w=400"
};

function getDisplayName(itemName) {
    if (itemName === "Paneer Butter Masala") return "Samosa";
    return itemName;
}

// Load menu from backend
async function loadMenu() {
    try {
        const response = await fetch('http://localhost:5000/api/menu');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        menuItems = data.map(item => {
            const originalName = item.item_name || item.name || '';
            const displayName = getDisplayName(originalName);
            const displayNameLower = displayName.toLowerCase().trim();
            const originalNameLower = originalName.toLowerCase().trim();
            return {
                ...item,
                name: displayName,
                item_name: displayName,
                image: item.image_url || imageMap[displayNameLower] || imageMap[originalNameLower] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                price: parseFloat(item.price) || 0,
                stock: item.stock != null ? parseInt(item.stock, 10) : 0
            };
        });

        const container = document.getElementById('menu-grid');
        container.innerHTML = '';

        menuItems.forEach(item => {
            const finalImage = item.image;
            const card = `
                <div class="food-card">
                    <img src="${finalImage}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found';">
                    <div class="food-info">
                        <h3>${item.name}</h3>
                        <p class="category">${item.category}</p>
                        <p class="price">₹${item.price}</p>
                        <button onclick="addToCart(${item.id})">Add to Order</button>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error('Failed to load menu from server:', error);
        console.log('Using fallback menu data');
        
        const container = document.getElementById('menu-grid');
        container.innerHTML = '';

        menuItems = defaultMenuItems.map(item => {
            const originalName = item.item_name || item.name || '';
            const displayName = getDisplayName(originalName);
            const displayNameLower = displayName.toLowerCase().trim();
            const originalNameLower = originalName.toLowerCase().trim();
            return {
                ...item,
                name: displayName,
                item_name: displayName,
                image: item.image_url || imageMap[displayNameLower] || imageMap[originalNameLower] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                price: parseFloat(item.price) || 0,
                stock: item.stock != null ? parseInt(item.stock, 10) : 0
            };
        });

        menuItems.forEach(item => {
            const finalImage = item.image;
            const card = `
                <div class="food-card">
                    <img src="${finalImage}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found';">
                    <div class="food-info">
                        <h3>${item.name}</h3>
                        <p class="category">${item.category}</p>
                        <p class="price">₹${item.price}</p>
                        <button onclick="addToCart(${item.id})">Add to Order</button>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }
}



// Call loadMenu on page load
document.addEventListener('DOMContentLoaded', () => {
    getSeatFromURL();
    loadMenu();
    loadWallet();
});

// QR-Based Seat System
let currentSeat = null;

// Get seat from URL parameters
function getSeatFromURL() {
    const params = new URLSearchParams(window.location.search);
    currentSeat = params.get('seat');
    if (currentSeat) {
        console.log(`Seat: ${currentSeat}`);
        // Display seat info if needed
        const seatDisplay = document.getElementById('seat-display');
        if (seatDisplay) {
            seatDisplay.textContent = `Seat: ${currentSeat}`;
        }
    }
}

// Wallet System
let walletBalance = 0;

// Load wallet balance
async function loadWallet() {
    if (currentUser && currentUser.id) {
        try {
            const response = await fetch(`http://localhost:5000/api/wallet/${currentUser.id}`);
            const data = await response.json();
            walletBalance = data.balance;
            updateWalletDisplay();
        } catch (error) {
            console.error('Failed to load wallet:', error);
        }
    }
}

// Update wallet display
function updateWalletDisplay() {
    const walletElement = document.getElementById('wallet-balance');
    if (walletElement) {
        walletElement.textContent = `₹${walletBalance}`;
    }
}

// Pay from wallet
async function payFromWallet(amount) {
    if (walletBalance < amount) {
        alert('Insufficient wallet balance!');
        return false;
    }
    try {
        const response = await fetch('http://localhost:5000/api/wallet/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, amount })
        });
        const data = await response.json();
        if (data.success) {
            walletBalance = data.new_balance;
            updateWalletDisplay();
            return true;
        } else {
            alert('Payment failed: ' + data.error);
            return false;
        }
    } catch (error) {
        console.error('Payment error:', error);
        return false;
    }
}

// Live Order Status
let currentOrderId = null;

// Place order API call
async function placeOrderAPI() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!payFromWallet(total)) return;

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                seat: currentSeat,
                items: cart,
                total
            })
        });
        const data = await response.json();
        currentOrderId = data.order_id;
        alert(`Order placed! Order ID: ${currentOrderId}`);
        cart = [];
        saveCart();
        displayCart();
        startOrderTracking();
    } catch (error) {
        console.error('Order placement error:', error);
    }
}

// Track order status
function startOrderTracking() {
    if (!currentOrderId) return;
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${currentOrderId}`);
            const data = await response.json();
            updateOrderStatus(data.status);
            if (data.status === 'Delivered') {
                clearInterval(interval);
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    }, 2000); // Poll every 2 seconds
}

// Update order status display
function updateOrderStatus(status) {
    const statusElement = document.getElementById('order-status');
    if (statusElement) {
        statusElement.textContent = `Order Status: ${status}`;
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    getSeatFromURL();
    loadMenu();
    loadWallet();
});

// Check if it's a new day and reset stock if needed
function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastStockReset');
    
    if (lastReset !== today) {
        // Reset stock to initial values
        const initialStock = {
            1: 50, // Paneer Butter Masala
            2: 30, // Salad
            3: 35, // Chicken Curry
            4: 75, // Chow Mein
            5: 45, // Grilled Chicken
            6: 55, // White Sauce Pasta
            7: 100, // Samosa
            8: 80, // Spring Roll
            9: 120, // French Fries
            10: 40, // Butter Chicken with Roti
            11: 65, // Sushi
            12: 35, // Fish and Chips
            13: 60, // Burger
            14: 80, // Cold Coffee
            15: 40, // Ramen
            16: 50, // Tempura
            17: 30, // Grilled Fish
            18: 45, // Pasta Carbonara
            19: 55, // Caesar Salad
            20: 60, // Dal Makhani
            21: 70, // Nachos
            22: 90, // Pakora
            23: 80, // Onigiri
            24: 25, // Steak
            25: 50, // Chole Bhature
            26: 100  // Popcorn
        };
        
        menuItems.forEach(item => {
            item.stock = initialStock[item.id] || item.stock;
        });
        
        localStorage.setItem('lastStockReset', today);
        localStorage.setItem('menu', JSON.stringify(menuItems));
    }
}

// Call daily reset check
checkDailyReset();

// Save data
function saveData() {
    localStorage.setItem('menu', JSON.stringify(menuItems));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('userBalances', JSON.stringify(userBalances));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('revenue', revenue.toString());
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const position = document.getElementById('position').value;
        const department = document.getElementById('department').value;

        if (!email || !password || !position || !department) {
            document.getElementById('loginMessage').textContent = 'Please fill all fields!';
            return;
        }

        if (email === 'admin@canteen.com' && password === 'admin') {
            window.location.href = 'admin.html';
            return;
        }

        currentUser = {
            id: 1,
            email,
            role: 'staff',
            position,
            department,
            monthlyAllowance: staffPositions[position].monthlyAllowance,
            joinDate: new Date().toISOString()
        };

        const userKey = `${email}_${position}_${department}`;
        if (!userBalances[userKey]) {
            userBalances[userKey] = currentUser.monthlyAllowance;
        }
        balance = userBalances[userKey];

        saveData();

        console.log('Login successful:', currentUser);
        window.location.href = 'menu.html';
    });
});

// Menu page
if (document.getElementById('menu')) {
    if (!currentUser) {
        window.location = 'index.html';
    }
    const userKey = `${currentUser.email}_${currentUser.position}`;
    balance = userBalances[userKey] || currentUser.monthlyAllowance;
    
    // Check time slot
displayMenu();
    
    updateCartCount();
    if (document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

function displayMenu(selectedCategory = 'all') {
    const user = currentUser || JSON.parse(localStorage.getItem('currentUser'));
    const isMenuPage = window.location.pathname.endsWith('menu.html');

    if (!user) {
        if (isMenuPage) {
            alert('Please login first');
            window.location.href = 'login.html';
        }
        return;
    }

    const container = document.getElementById('menu-grid');
    if (!container) return;
    
    // Filter by category
    const filtered = selectedCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category.toLowerCase() === selectedCategory);
    
    const menuHTML = filtered.map(item => {
        const isSoldOut = item.stock <= 0;
        const image = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
        return `
            <div class="menu-item ${isSoldOut ? 'sold-out-item' : ''}">
                <div class="item-image" onclick="getRecommendation('${item.name}')">
                    <img src="${image}" alt="${item.name}" class="food-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}';">
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${parseFloat(item.price).toFixed(2)}</p>
                    <p class="stock ${item.stock > 10 ? 'in-stock' : item.stock > 0 ? 'low-stock' : 'out-of-stock'}">
                        ${item.stock > 0 ? item.stock + ' available' : 'Sold out'}
                    </p>
                    ${isSoldOut 
                        ? '<button class="btn-primary" disabled>Sold Out</button>' 
                        : `<button class="btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = menuHTML;
    updateCartDisplay();
}

function addToCart(id) {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    
    if (item.stock <= 0) {
        alert(`${item.name} is sold out!`);
        return;
    }
    
    const cartItem = {
        ...item,
        cartId: Date.now(),
        name: item.name || item.item_name || item.name,
        price: parseFloat(item.price) || 0
    };
    cart.push(cartItem);
    item.stock--; // Decrement stock
    saveData();
    updateCartCount();
    updateCartDisplay();
    alert(`${item.name} added to cart! (${item.stock} left in stock)`);
}

async function getRecommendation(itemName) {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ item: itemName })
  });

  const data = await res.json();
  alert("Try this: " + data.recommendations.join(", "));
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    if (document.getElementById('cartCount')) {
        document.getElementById('cartCount').textContent = cart.length;
    }
    if (document.getElementById('cartBadge')) {
        document.getElementById('cartBadge').textContent = `(${cart.length})`;
    }
    if (document.getElementById('cart-total')) {
        document.getElementById('cart-total').textContent = total.toFixed(2);
    }
    if (document.getElementById('total')) {
        document.getElementById('total').textContent = total.toFixed(2);
    }
}

function filterByCategory(category) {
    // Update active button
    const buttons = document.querySelectorAll('.category-filters button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category === 'all' ? 'all' : category)) {
            btn.classList.add('active');
        }
    });
    
    displayMenu(category);
}

async function filterMenuBySearch() {
    const searchTerm = document.getElementById('searchMenu').value;
    let filtered = [];
    
    if (searchTerm) {
        try {
            const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchTerm)}`);
            const suggestions = await response.json();
            filtered = menuItems.filter(item => suggestions.includes(item.name));
        } catch (error) {
            console.error('Smart search failed, using local search:', error);
            filtered = menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    } else {
        filtered = menuItems;
    }
    
    const container = document.getElementById('menu-grid');
    const menuHTML = filtered.map(item => {
        const isSoldOut = item.stock <= 0;
        const image = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80";
        return `
            <div class="menu-item ${isSoldOut ? 'sold-out-item' : ''}">
                <div class="item-image" onclick="getRecommendation('${item.name}')">
                    <img src="${image}" alt="${item.name}" class="food-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}';">
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${parseFloat(item.price).toFixed(2)}</p>
                    <p class="stock ${item.stock > 10 ? 'in-stock' : item.stock > 0 ? 'low-stock' : 'out-of-stock'}">
                        ${item.stock > 0 ? item.stock + ' available' : 'Sold out'}
                    </p>
                    ${isSoldOut 
                        ? '<button class="btn-primary" disabled>Sold Out</button>' 
                        : `<button class="btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = menuHTML;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">₹${item.price}</span>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        total += item.price;
    });
    
    cartItems.innerHTML = cartHTML;
    
    if (document.getElementById('cart-total')) {
        document.getElementById('cart-total').textContent = total;
    }
}

function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    
    // Find and restore stock
    const menuItem = menuItems.find(m => m.id === item.id);
    if (menuItem) {
        menuItem.stock++;
    }
    
    saveData();
    updateCartDisplay();
    displayMenu();
}

// Cart page
if (document.getElementById('cart')) {
    if (!currentUser) {
        window.location = 'index.html';
    }
    const userKey = `${currentUser.email}_${currentUser.position}_${currentUser.department}`;
    balance = userBalances[userKey] || currentUser.monthlyAllowance;
    
    displayCart();
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) placeOrderBtn.disabled = false;
}

function displayCart() {
    let html = '';
    let total = 0;

    if (cart.length === 0) {
        html = '<p class="empty-cart">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            html += `
                <div class="cart-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            total += parseFloat(item.price) || 0;
        });
    }

    document.getElementById('cart').innerHTML = html;
    document.getElementById('total').textContent = total.toFixed(2);
    updateCartCount();
}

function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    const menuItem = menuItems.find(m => m.id === item.id);
    if (menuItem) {
        menuItem.stock = (parseInt(menuItem.stock, 10) || 0) + 1;
    }
    saveData();
    displayCart();
    updateCartDisplay();
}

async function placeOrder() {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    if (cart.length === 0) {
        document.getElementById('orderMessage').textContent = 'Your cart is empty!';
        return;
    }
    if (!currentUser) {
        document.getElementById('orderMessage').textContent = 'Please login first!';
        return;
    }
    if (walletBalance < total) {
        document.getElementById('orderMessage').textContent = `Insufficient balance! Your balance: ₹${walletBalance}, Required: ₹${total}`;
        return;
    }
    
    // Check time slot if needed, but for now skip or adapt
    
    await placeOrderAPI();
    document.getElementById('orderMessage').textContent = `Order placed successfully! Amount deducted: ₹${total}. Remaining balance: ₹${walletBalance}`;
    document.getElementById('orderMessage').style.color = '#4CAF50';
}

// Wallet page
if (document.getElementById('balance')) {
    if (currentUser) {
        const userKey = `${currentUser.email}_${currentUser.position}_${currentUser.department}`;
        balance = userBalances[userKey] || currentUser.monthlyAllowance;
        document.getElementById('balance').textContent = balance;
        document.getElementById('staffPosition').textContent = staffPositions[currentUser.position].name;
        document.getElementById('departmentName').textContent = departmentSlots[currentUser.department].name;
        document.getElementById('monthlyAllowance').textContent = currentUser.monthlyAllowance;
        document.getElementById('timeSlot').textContent = 'Anytime';
    } else {
        window.location = 'index.html';
    }
}

// Admin page
if (document.getElementById('foodList')) {
    displayDashboardStats();
    displayFoodList();
    displayOrders();
    displayAnalytics();
    displaySettings();
}

function addFood() {
    const name = document.getElementById('food').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value) || 50; // Default stock
    
    if (name && price > 0) {
        const newId = menu.length > 0 ? Math.max(...menu.map(item => item.id)) + 1 : 1;
        menu.push({ id: newId, name, price, stock });
        saveData();
        document.getElementById('food').value = '';
        document.getElementById('price').value = '';
        document.getElementById('stock').value = '';
        displayFoodList();
        displayMenu(); // Update menu if on menu page
        alert(`${name} added to menu with ${stock} stock!`);
    } else {
        alert('Please enter valid food name, price, and stock.');
    }
}

function resetStock(itemId) {
    const item = menuItems.find(m => m.id === itemId);
    if (item) {
        const initialStock = {
            1: 50, // Paneer Butter Masala
            2: 30, // Veg Biryani
            3: 35, // Chicken Curry
            4: 75, // Chow Mein
            5: 45, // Grilled Chicken
            6: 55, // Veg Pasta
            7: 100, // Samosa
            8: 80  // Spring Roll
        };
        item.stock = initialStock[itemId] || 50;
        saveData();
        displayFoodList();
        displayMenu();
        alert(`${item.name} stock reset to ${item.stock}!`);
    }
}

function displayFoodList() {
    let html = '';
    menuItems.forEach((item, index) => {
        html += `
            <div class="food-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>₹${item.price} | Stock: ${item.stock}</p>
                </div>
                <div class="admin-actions">
                    <button onclick="resetStock(${item.id})" class="reset-btn">Reset Stock</button>
                    <button onclick="removeFood(${index})" class="remove-btn">Remove</button>
                </div>
            </div>
        `;
    });
    document.getElementById('foodList').innerHTML = html;
}

function removeFood(index) {
    menu.splice(index, 1);
    saveData();
    displayFoodList();
    displayMenu(); // Update menu
}

// Navigation functions
function goToMenu() {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    if (currentUser) {
        window.location = 'menu.html';
    } else {
        window.location = 'login.html';
    }
}

function goToLogin() {
    window.location = 'login.html';
}

function logout() {
    currentUser = null;
    cart = [];
    saveData();
    window.location = 'index.html';
}

// Admin Dashboard Functions
function displayDashboardStats() {
    document.getElementById('totalRevenue').textContent = `₹${revenue}`;
    document.getElementById('totalOrders').textContent = orders.length;
    
    const totalItemsSold = orders.reduce((sum, order) => sum + order.items.length, 0);
    document.getElementById('totalItemsSold').textContent = totalItemsSold;
    
    const uniqueUsers = new Set(orders.map(order => order.user)).size;
    document.getElementById('activeUsers').textContent = uniqueUsers;
}

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function displayOrders(filter = 'all') {
    let filteredOrders = orders;
    
    if (filter === 'today') {
        const today = new Date().toDateString();
        filteredOrders = orders.filter(order => new Date(order.timestamp).toDateString() === today);
    } else if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.department === filter);
    }
    
    let html = '';
    if (filteredOrders.length === 0) {
        html = '<p>No orders found.</p>';
    } else {
        filteredOrders.reverse().forEach(order => {
            const time = new Date(order.timestamp).toLocaleString();
            html += `
                <div class="order-card">
                    <div class="order-header">
                        <span><strong>Order #${order.id}</strong></span>
                        <span>${time}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>User:</strong> ${order.user}</p>
                        <p><strong>Department:</strong> ${departmentSlots[order.department]?.name || order.department}</p>
                        <p><strong>Position:</strong> ${order.position}</p>
                        <p><strong>Items:</strong> ${order.items.map(item => `${item.name} (₹${item.price})`).join(', ')}</p>
                        <p><strong>Total:</strong> ₹${order.total}</p>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                </div>
            `;
        });
    }
    document.getElementById('ordersList').innerHTML = html;
}

function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    displayOrders(filter);
}

function displayAnalytics() {
    // Revenue by department
    const deptRevenue = {};
    orders.forEach(order => {
        if (!deptRevenue[order.department]) deptRevenue[order.department] = 0;
        deptRevenue[order.department] += order.total;
    });
    
    let revenueHtml = '<ul>';
    Object.keys(deptRevenue).forEach(dept => {
        const deptName = departmentSlots[dept]?.name || dept;
        revenueHtml += `<li>${deptName}: ₹${deptRevenue[dept]}</li>`;
    });
    revenueHtml += '</ul>';
    document.getElementById('revenueByDept').innerHTML = revenueHtml;
    
    // Popular items - fetch from Python analytics service
    fetch('http://localhost:8000/analytics')
        .then(response => response.json())
        .then(data => {
            let popularHtml = '<ul>';
            Object.entries(data)
                .sort(([,a], [,b]) => b - a)
                .forEach(([item, count]) => {
                    popularHtml += `<li>${item}: ${count} orders</li>`;
                });
            popularHtml += '</ul>';
            document.getElementById('popularItems').innerHTML = popularHtml;
        })
        .catch(error => {
            console.error('Failed to load analytics:', error);
            // Fallback to local calculation
            const itemCount = {};
            orders.forEach(order => {
                order.items.forEach(item => {
                    if (!itemCount[item.name]) itemCount[item.name] = 0;
                    itemCount[item.name]++;
                });
            });
            
            let popularHtml = '<ul>';
            Object.entries(itemCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([item, count]) => {
                    popularHtml += `<li>${item}: ${count} orders</li>`;
                });
            popularHtml += '</ul>';
            document.getElementById('popularItems').innerHTML = popularHtml;
        });
    
    // Stock status
    let stockHtml = '<div class="stock-grid">';
    menuItems.forEach(item => {
        const percentage = ((item.stock / 50) * 100).toFixed(0); // Assuming 50 is max
        const statusClass = item.stock === 0 ? 'out' : item.stock < 10 ? 'low' : 'good';
        stockHtml += `
            <div class="stock-item ${statusClass}">
                <h4>${item.name}</h4>
                <p>${item.stock} left</p>
                <div class="stock-bar">
                    <div class="stock-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    stockHtml += '</div>';
    document.getElementById('stockStatus').innerHTML = stockHtml;
}

function displaySettings() {
    const lastReset = localStorage.getItem('lastStockReset') || 'Never';
    document.getElementById('lastReset').textContent = lastReset === 'Never' ? 'Never' : new Date(lastReset).toLocaleDateString();
    
    let timeSlotsHtml = '<div class="time-slots-grid">';
    Object.values(departmentSlots).forEach(slot => {
        timeSlotsHtml += `
            <div class="time-slot-card">
                <h4>${slot.name}</h4>
                <p>${slot.display}</p>
            </div>
        `;
    });
    timeSlotsHtml += '</div>';
    document.getElementById('timeSlotsDisplay').innerHTML = timeSlotsHtml;
}

function manualStockReset() {
    if (confirm('Are you sure you want to reset all stock to initial levels?')) {
        const initialStock = {
            1: 50, // Paneer Butter Masala
            2: 30, // Salad
            3: 35, // Chicken Curry
            4: 75, // Chow Mein
            5: 45, // Grilled Chicken
            6: 55, // White Sauce Pasta
            7: 100, // Samosa
            8: 80, // Spring Roll
            9: 120, // French Fries
            10: 40, // Butter Chicken with Roti
            11: 65, // Sushi
            12: 35, // Fish and Chips
            13: 60, // Burger
            14: 80, // Cold Coffee
            15: 40, // Ramen
            16: 50, // Tempura
            17: 30, // Grilled Fish
            18: 45, // Pasta Carbonara
            19: 55, // Caesar Salad
            20: 60, // Dal Makhani
            21: 70, // Nachos
            22: 90, // Pakora
            23: 80, // Onigiri
            24: 25, // Steak
            25: 50, // Chole Bhature
            26: 100  // Popcorn
        };
        
        menuItems.forEach(item => {
            item.stock = initialStock[item.id] || 50;
        });
        
        localStorage.setItem('lastStockReset', new Date().toDateString());
        localStorage.setItem('menu', JSON.stringify(menuItems));
        
        displayFoodList();
        displayAnalytics();
        displaySettings();
        alert('Stock reset successfully!');
    }
}