let allProducts = [];
let cart = [];

// 1. Fetching logic for separate JSON files
async function loadVendors() {
    try {
        // These paths assume the JSON files are in the same folder as index.html
        const paths = ['vendor1.json', 'vendor2.json', 'vendor3.json'];
        
        const fetchPromises = paths.map(path => 
            fetch(path).then(res => {
                if (!res.ok) throw new Error(`Failed to load ${path}`);
                return res.json();
            })
        );

        const results = await Promise.all(fetchPromises);
        allProducts = results.flat(); // Combines the 3 arrays into one
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error loading JSON:", error);
        document.getElementById('productGrid').innerHTML = `<p>Error loading parts. Check console.</p>`;
    }
}

// 2. Rendering
function renderProducts(data) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = data.map(item => `
        <div class="card">
            <div class="card-img-container">
                <img src="${item.img}" alt="${item.part}">
                ${item.type === 'sale' ? '<span class="badge sale">SALE</span>' : ''}
            </div>
            <div class="card-content">
                <p class="brand">${item.brand}</p>
                <h3>${item.part}</h3>
                <div class="card-footer">
                    <span class="price">$${item.price.toLocaleString()}</span>
                    <button class="add-btn" onclick="addToCart('${item.sku}')">ADD</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Filtering & Search
window.filterProducts = (category, btn) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.type === category);
    renderProducts(filtered);
};

document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderProducts(allProducts.filter(p => 
        p.brand.toLowerCase().includes(term) || p.part.toLowerCase().includes(term)
    ));
});

// 4. Cart logic
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
            <button onclick="removeFromCart(${i})">Remove</button>
        </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('totalPrice').innerText = `$${total.toLocaleString()}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateUI(); };
window.toggleCart = () => document.getElementById('cartSidebar').classList.toggle('active');
window.checkout = () => { alert("Order processed!"); cart = []; updateUI(); toggleCart(); };

loadVendors();