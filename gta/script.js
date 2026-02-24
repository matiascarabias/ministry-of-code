let allProducts = [];
let cart = [];
let currentCategory = 'all';

// Vector Icon Set
const icons = {
    turbo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
    engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10h18M7 10V6M11 10V6M15 10V6M19 10V6M5 10v10h14V10M8 14h8M8 17h8"/></svg>`,
    brakes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 12L3 12M12 7l-2 5 2 5"/></svg>`,
    exhaust: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17h4m0 0a3 3 0 106 0m-6 0v-5a3 3 0 013-3h1m0 0a3 3 0 106 0m-6 0v5a3 3 0 003 3h4"/></svg>`,
    valve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v14m-4 0h8v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z"/></svg>`,
    generic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
};

async function init() {
    try {
        const [v1, v2, v3] = await Promise.all([
            fetch('vendor1.json').then(res => res.json()),
            fetch('vendor2.json').then(res => res.json()),
            fetch('vendor3.json').then(res => res.json())
        ]);
        allProducts = [...v1, ...v2, ...v3];
        renderProducts(allProducts);
    } catch (e) {
        console.error("Connection Error. Ensure Live Server is used.", e);
    }
}

function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = items.map(item => {
        const icon = icons[item.category] || icons.generic;
        
        // SAFETY FIX: If price is missing, use 0
        const displayPrice = item.price ? item.price.toLocaleString() : "0.00";

        return `
            <div class="card">
                <div class="card-icon-container">
                    ${icon}
                </div>
                <div class="card-content">
                    <p class="brand">${item.brand}</p>
                    <h3>${item.part}</h3>
                    <div class="card-footer">
                        <span class="price">$${displayPrice}</span>
                        <button class="add-btn" onclick="addToCart('${item.sku}')">ADD_UNIT</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
// Global Filter Logic
window.filterByCategory = function(category, element) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const max = document.getElementById('priceRange').value;
    const filtered = allProducts.filter(p => {
        const catMatch = currentCategory === 'all' || p.type === currentCategory;
        const searchMatch = p.brand.toLowerCase().includes(term) || p.part.toLowerCase().includes(term);
        const priceMatch = p.price <= max;
        return catMatch && searchMatch && priceMatch;
    });
    renderProducts(filtered);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('priceRange').addEventListener('input', (e) => {
    document.getElementById('priceLabel').innerText = e.target.value;
    applyFilters();
});

// Cart Controls
window.addToCart = (sku) => {
    const item = allProducts.find(p => p.sku === sku);
    cart.push(item);
    updateUI();
};

function updateUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const list = document.getElementById('cartItems');
    list.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <span>${item.part}</span>
            <button onclick="removeFromCart(${i})">✕</button>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('totalPrice').innerText = `$${total.toLocaleString()}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateUI(); };
window.toggleCart = () => document.getElementById('cartSidebar').classList.toggle('active');
window.checkout = () => { alert("ORDER TRANSMITTED."); cart = []; updateUI(); toggleCart(); };

async function init() {
    const grid = document.getElementById('productGrid');
    const vendorFiles = ['vendor1.json', 'vendor2.json', 'vendor3.json'];
    
    // Clear array before loading
    allProducts = [];

    // Map through each file and load individually to catch specific errors
    const loadPromises = vendorFiles.map(file => validateAndLoad(file));
    
    const results = await Promise.all(loadPromises);
    
    // Flatten the array (removing any nulls from failed files)
    allProducts = results.filter(data => data !== null).flat();

    if (allProducts.length > 0) {
        renderProducts(allProducts);
    } else {
        grid.innerHTML = `<p style="text-align:center; color:red;">CRITICAL ERROR: No valid data found in any vendor files.</p>`;
    }
}

async function validateAndLoad(fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();

        // Check every item in this specific file for the 'price' property
        data.forEach((item, index) => {
            if (item.price === undefined || item.price === null) {
                console.error(`%c DATA ERROR in ${fileName}:`, 'color: white; background: red; font-weight: bold;', 
                `Item at index ${index} (${item.part || 'Unknown Part'}) is missing a "price" field.`);
            }
        });

        console.log(`%c ✓ ${fileName} loaded successfully`, 'color: #00f2ff');
        return data;

    } catch (err) {
        console.error(`%c ✘ FAILED TO LOAD ${fileName}:`, 'color: white; background: #ff2d2d; font-weight: bold;', err.message);
        return null; // Return null so the rest of the app doesn't crash
    }
}