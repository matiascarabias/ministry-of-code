let allProducts = [];
let cart = [];
let currentCategory = 'all';

// 1. SVG Diagnostic Icons
const icons = {
    turbo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
    engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10h18M7 10V6M11 10V6M15 10V6M19 10V6M5 10v10h14V10M8 14h8M8 17h8"/></svg>`,
    brakes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 12L3 12M12 7l-2 5 2 5"/></svg>`,
    exhaust: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17h4m0 0a3 3 0 106 0m-6 0v-5a3 3 0 013-3h1m0 0a3 3 0 106 0m-6 0v5a3 3 0 003 3h4"/></svg>`,
    valve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v14m-4 0h8v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z"/></svg>`,
    generic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
};

// 2. Load Data from Vendors
async function loadVendors() {
    const files = ['vendor1.json', 'vendor2.json', 'vendor3.json'];
    try {
        const results = await Promise.all(files.map(async (f) => {
            const res = await fetch(f);
            if (!res.ok) {
                console.error(`ERROR: Could not load ${f}`);
                return null;
            }
            return res.json();
        }));
        
        allProducts = results.filter(r => r !== null).flat();
        renderProducts(allProducts);
    } catch (err) {
        console.error("System Error: Local Server required to load JSON files.");
    }
}

// 3. Render Cards
function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map(item => {
        const iconMarkup = icons[item.category] || icons.generic;
        const price = (typeof item.price === 'number') ? item.price.toLocaleString() : "0.00";

        return `
            <div class="card">
                <div class="card-icon-container">${iconMarkup}</div>
                <div class="card-content">
                    <p class="brand">${item.brand || 'DATABASE_ERR'}</p>
                    <h3 class="part-name">${item.part || 'UNKNOWN_UNIT'}</h3>
                    <div class="card-footer">
                        <span class="price">$${price}</span>
                        <button class="add-btn" onclick="addToCart('${item.sku}')">INSTALL</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Filtering Logic
window.filterByCategory = (cat, btn) => {
    currentCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const max = parseFloat(document.getElementById('priceRange').value);
    
    const filtered = allProducts.filter(p => {
        const catMatch = currentCategory === 'all' || p.type === currentCategory;
        const searchMatch = (p.brand + p.part).toLowerCase().includes(term);
        const priceMatch = (p.price || 0) <= max;
        return catMatch && searchMatch && priceMatch;
    });
    renderProducts(filtered);
}

// 5. Cart Logic
window.addToCart = (sku) => {
    const item = allProducts.find(p => p.sku === sku);
    if(item) {
        cart.push(item);
        updateUI();
    }
};

function updateUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const list = document.getElementById('cartItems');
    list.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <div>
                <h4>${item.part}</h4>
                <p>$${item.price.toLocaleString()}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${i})">✕</button>
        </div>
    `).join('');
    
    const total = cart.reduce((s, i) => s + (i.price || 0), 0);
    document.getElementById('totalPrice').innerText = `$${total.toLocaleString()}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateUI(); };
window.toggleCart = () => document.getElementById('cartSidebar').classList.toggle('active');
window.checkout = () => { alert("ORDER_SYNC_COMPLETE: Dispatching parts."); cart = []; updateUI(); toggleCart(); };

// Event Listeners
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('priceRange').addEventListener('input', (e) => {
    document.getElementById('priceLabel').innerText = e.target.value;
    applyFilters();
});

// Init
loadVendors();