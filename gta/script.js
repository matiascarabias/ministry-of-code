let allProducts = [];
let cart = [];
let currentCategory = 'all';

// 1. Initial Data Fetch
async function init() {
    try {
        // Fetching from your 3 separate JSON files
        const [v1, v2, v3] = await Promise.all([
            fetch('vendor1.json').then(res => res.json()),
            fetch('vendor2.json').then(res => res.json()),
            fetch('vendor3.json').then(res => res.json())
        ]);
        
        allProducts = [...v1, ...v2, ...v3];
        renderProducts(allProducts);
    } catch (e) {
        console.error("Data load error. Ensure you are using a local server!", e);
        document.getElementById('productGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p>⚠️ JSON files must be accessed via a local server (e.g., Live Server in VS Code).</p>
            </div>`;
    }
}

// 2. The Core Render Function
function renderProducts(productsToDisplay) {
    const grid = document.getElementById('productGrid');
    
    if (productsToDisplay.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No matching parts found.</p>`;
        return;
    }

    grid.innerHTML = productsToDisplay.map(item => `
        <div class="card">
            <div class="card-img-container">
                <img src="${item.img}" alt="${item.part}">
                ${item.type === 'sale' ? '<span class="badge sale">SALE</span>' : ''}
                ${item.type === 'popular' ? '<span class="badge popular">HOT</span>' : ''}
            </div>
            <div class="card-content">
                <p class="brand">${item.brand}</p>
                <h3 class="part-name">${item.part}</h3>
                <div class="card-footer">
                    <span class="price">$${item.price.toLocaleString()}</span>
                    <button class="add-btn" onclick="addToCart('${item.sku}')">ADD</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Filtering Logic (Category)
window.filterByCategory = function(category, element) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    applyAllFilters();
};

// 4. Combined Filtering (Search + Category + Price)
function applyAllFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const maxPrice = document.getElementById('priceRange').value;

    let filtered = allProducts.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.type === currentCategory;
        const matchesSearch = p.brand.toLowerCase().includes(searchTerm) || p.part.toLowerCase().includes(searchTerm);
        const matchesPrice = p.price <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
    });

    renderProducts(filtered);
}

// Event Listeners for Filter Inputs
document.getElementById('searchInput').addEventListener('input', applyAllFilters);
document.getElementById('priceRange').addEventListener('input', (e) => {
    document.getElementById('priceLabel').innerText = e.target.value;
    applyAllFilters();
});

// 5. Cart Management
window.addToCart = function(sku) {
    const product = allProducts.find(p => p.sku === sku);
    cart.push(product);
    updateCartUI();
    
    // Animate cart count
    const counter = document.getElementById('cartCount');
    counter.style.transform = "scale(1.4)";
    setTimeout(() => counter.style.transform = "scale(1)", 200);
};

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    document.getElementById('cartCount').innerText = cart.length;
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div>
                <h4>${item.part}</h4>
                <p>$${item.price.toLocaleString()}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
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
    alert("Order Received! Shipping parts to your location.");
    cart = [];
    updateCartUI();
    toggleCart();
};

// Start
init();