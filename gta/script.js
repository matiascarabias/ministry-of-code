let allProducts = [];
let cart = [];
let currentCategory = 'all';

const icons = {
    turbo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
    engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10h18M7 10V6M11 10V6M15 10V6M19 10V6M5 10v10h14V10M8 14h8M8 17h8"/></svg>`,
    brakes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 12L3 12M12 7l-2 5 2 5"/></svg>`,
    exhaust: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17h4m0 0a3 3 0 106 0m-6 0v-5a3 3 0 013-3h1m0 0a3 3 0 106 0m-6 0v5a3 3 0 003 3h4"/></svg>`,
    valve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v14m-4 0h8v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z"/></svg>`,
    generic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
};

async function validateAndLoad(fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();

        // Check for common data errors
        data.forEach((item, index) => {
            if (item.price === undefined) {
                console.error(`%c ERROR in ${fileName}:`, 'background: red; color: white;', `Item #${index} (${item.part}) is missing "price"`);
            }
        });

        console.log(`%c SUCCESS: ${fileName} parsed`, 'color: #00f2ff');
        return data;
    } catch (err) {
        console.error(`%c CRITICAL: ${fileName} failed`, 'background: #550000; color: white;', err.message);
        return null; 
    }
}

async function init() {
    const grid = document.getElementById('productGrid');
    const vendors = ['vendor1.json', 'vendor2.json', 'vendor3.json'];
    
    const results = await Promise.all(vendors.map(v => validateAndLoad(v)));
    allProducts = results.filter(r => r !== null).flat();

    if (allProducts.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center;"><h2>SYSTEM_ERROR</h2><p>No valid data files found. Check console (F12).</p></div>`;
        return;
    }
    renderProducts(allProducts);
}

function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map(item => {
        const icon = icons[item.category] || icons.generic;
        const priceDisplay = (item.price && typeof item.price === 'number') 
            ? item.price.toLocaleString() 
            : "PRICE_ERR";

        return `
            <div class="card">
                <div class="card-icon-container">${icon}</div>
                <div class="card-content">
                    <p class="brand">${item.brand}</p>
                    <h3>${item.part}</h3>
                    <div class="card-footer">
                        <span class="price">$${priceDisplay}</span>
                        <button class="add-btn" onclick="addToCart('${item.sku}')">ADD_UNIT</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Global UI Controls
window.filterByCategory = (cat, el) => {
    currentCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const max = document.getElementById('priceRange').value;
    const filtered = allProducts.filter(p => {
        const cMatch = currentCategory === 'all' || p.type === currentCategory;
        const sMatch = p.brand.toLowerCase().includes(term) || p.part.toLowerCase().includes(term);
        const pMatch = p.price <= max;
        return cMatch && sMatch && pMatch;
    });
    renderProducts(filtered);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('priceRange').addEventListener('input', (e) => {
    document.getElementById('priceLabel').innerText = e.target.value;
    applyFilters();
});

window.addToCart = (sku) => {
    const item = allProducts.find(p => p.sku === sku);
    if(item) { cart.push(item); updateUI(); }
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
    const total = cart.reduce((s, i) => s + (i.price || 0), 0);
    document.getElementById('totalPrice').innerText = `$${total.toLocaleString()}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateUI(); };
window.toggleCart = () => document.getElementById('cartSidebar').classList.toggle('active');
window.checkout = () => { alert("ORDER RECEIVED."); cart = []; updateUI(); toggleCart(); };

init();