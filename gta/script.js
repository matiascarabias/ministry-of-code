/**
 * REVV PERFORMANCE - CORE ENGINE v3.0
 * Icon-Based Architecture (No External Images)
 */

let allProducts = [];
let cart = [];
let currentCategory = 'all';

// 1. SVG ICON REPOSITORY (Zero dependencies, zero 404s)
const icons = {
    turbo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
    engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M7 10V6M11 10V6M15 10V6M19 10V6M5 10v10h14V10M8 14h8M8 17h8"/></svg>`,
    brakes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 12L3 12M12 7l-2 5 2 5"/></svg>`,
    exhaust: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h4m0 0a3 3 0 106 0m-6 0v-5a3 3 0 013-3h1m0 0a3 3 0 106 0m-6 0v5a3 3 0 003 3h4"/></svg>`,
    valve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m-4 0h8v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z"/></svg>`,
    generic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
};

// 2. DATA LOADING & VALIDATION
async function validateAndLoad(fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
        
        const data = await response.json();

        // Integrity Check: Ensure price is a valid number
        data.forEach((item, index) => {
            if (typeof item.price !== 'number') {
                console.warn(`%c ! DATA WARNING [${fileName}]:`, 'color: orange; font-weight: bold;', 
                `Item #${index} (${item.part}) has an invalid price. Expected number, got ${typeof item.price}.`);
            }
        });

        console.log(`%c ✓ ${fileName} LOADED`, 'color: #00f2ff; font-weight: bold;');
        return data;
    } catch (err) {
        console.error(`%c ✘ FAILED ${fileName}:`, 'color: white; background: #ff2d2d; padding: 2px 5px;', err.message);
        return null; 
    }
}

async function init() {
    const grid = document.getElementById('productGrid');
    const vendors = ['vendor1.json', 'vendor2.json', 'vendor3.json'];
    
    const results = await Promise.all(vendors.map(v => validateAndLoad(v)));
    
    // Merge only successful loads
    allProducts = results.filter(r => r !== null).flat();

    if (allProducts.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                            <h2>DATABASE_OFFLINE</h2>
                            <p>Check console (F12) for file path errors.</p>
                          </div>`;
        return;
    }
    renderProducts(allProducts);
}

// 3. UI RENDERING (PURE ICON LOGIC)
// ... (Icon set and validateAndLoad functions remain exactly the same as previous)

function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = items.map(item => {
        const iconMarkup = icons[item.category] || icons.generic;
        const formattedPrice = (typeof item.price === 'number') 
            ? item.price.toLocaleString() 
            : "0.00";

        return `
            <div class="card">
                <div class="card-icon-container">
                    ${iconMarkup}
                </div>
                <div class="card-content">
                    <p class="brand">${item.brand || 'DATABASE_ERR'}</p>
                    <h3 class="part-name">${item.part || 'UNKNOWN_UNIT'}</h3>
                    <div class="card-footer">
                        <span class="price">$${formattedPrice}</span>
                        <button class="add-btn" onclick="addToCart('${item.sku}')">INSTALL</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ... (Rest of the functions: filterByCategory, applyFilters, addToCart, etc. remain the same)
// 4. FILTERING LOGIC
window.filterByCategory = function(category, element) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const maxPrice = parseFloat(document.getElementById('priceRange').value);

    const filtered = allProducts.filter(p => {
        const matchesCat = currentCategory === 'all' || p.type === currentCategory;
        const matchesSearch = p.brand?.toLowerCase().includes(term) || p.part?.toLowerCase().includes(term);
        const matchesPrice = (p.price || 0) <= maxPrice;
        return matchesCat && matchesSearch && matchesPrice;
    });

    renderProducts(filtered);
}

// 5. EVENT LISTENERS
document.getElementById('searchInput')?.addEventListener('input', applyFilters);
document.getElementById('priceRange')?.addEventListener('input', (e) => {
    document.getElementById('priceLabel').innerText = e.target.value;
    applyFilters();
});

// 6. GARAGE (CART) LOGIC
window.addToCart = function(sku) {
    const product = allProducts.find(p => p.sku === sku);
    if (product) {
        cart.push(product);
        updateCartUI();
    }
};

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    cartCount.innerText = cart.length;
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div>
                <h4>${item.part}</h4>
                <p>$${(item.price || 0).toLocaleString()}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    totalPrice.innerText = `$${total.toLocaleString()}`;
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

window.toggleCart = function() {
    document.getElementById('cartSidebar').classList.toggle('active');
};

window.checkout = function() {
    if(cart.length === 0) return alert("Your garage is empty!");
    alert("ORDER_TRANSMITTED: Parts are being prepared for dispatch.");
    cart = [];
    updateUI(); // Keep UI in sync
    toggleCart();
};

// FIRE ENGINE
init();