// Sample product data (in a real application, this would come from a backend)
const products = [
    {
        id: 1,
        name: "Smartphone Android",
        category: "electronique",
        price: 150000, // Prix en FCFA
        image: "https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg",
        description: "Smartphone Android dernière génération avec 8GB RAM et 128GB stockage",
        weight: 0.3, // en kg
        volume: 0.001, // en m³
        options: {
            colors: ["Noir", "Bleu", "Blanc"],
            storage: ["64GB", "128GB"]
        }
    },
    {
        id: 2,
        name: "Écouteurs Sans Fil",
        category: "electronique",
        price: 25000,
        image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg",
        description: "Écouteurs bluetooth avec réduction de bruit active",
        weight: 0.1,
        volume: 0.0002,
        options: {
            colors: ["Noir", "Blanc"]
        }
    },
    {
        id: 3,
        name: "Sac à Main",
        category: "mode",
        price: 45000,
        image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
        description: "Sac à main en cuir synthétique de haute qualité",
        weight: 0.5,
        volume: 0.005,
        options: {
            colors: ["Marron", "Noir", "Beige"]
        }
    },
    {
        id: 4,
        name: "Lampe LED",
        category: "maison",
        price: 35000,
        image: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg",
        description: "Lampe LED moderne avec télécommande",
        weight: 1.2,
        volume: 0.015,
        options: {
            colors: ["Blanc", "Noir"]
        }
    }
];

// Cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Shipping rates
const SHIPPING_RATES = {
    air: 15000, // FCFA per kg
    sea: 5000   // FCFA per m³
};

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, quantity = 1, selectedOptions = {}) {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const cartItem = {
        id: productId,
        quantity,
        options: selectedOptions,
        price: product.price,
        name: product.name
    };

    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.options) === JSON.stringify(selectedOptions)
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    updateCartUI();
    return true;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    // Update cart count in header if element exists
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Update cart page if we're on it
    const cartContainer = document.querySelector('.cart-items');
    if (cartContainer) {
        renderCart();
    }
}

function calculateShipping(method, weight, volume) {
    return method === 'air' 
        ? SHIPPING_RATES.air * weight 
        : SHIPPING_RATES.sea * volume;
}

// Page-specific initializations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart UI
    updateCartUI();

    // Handle popular products on homepage
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        const popularProducts = products.slice(0, 4); // Show first 4 products
        popularProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <a href="product.html?id=${product.id}" class="product-link">Voir détails</a>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    // Handle product detail page
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === productId);

        if (product) {
            renderProductDetail(product);
        }
    }

    // Handle shipping calculator
    const shippingForm = document.querySelector('.shipping-form');
    if (shippingForm) {
        shippingForm.addEventListener('change', calculateShippingCost);
    }
});

// WhatsApp notification simulation
function simulateWhatsAppNotification(orderDetails) {
    const { orderNumber, shippingMethod, total } = orderDetails;
    const estimatedDelivery = shippingMethod === 'air' ? '2 semaines' : '2 mois';
    
    const message = `
🛍️ Confirmation de commande #${orderNumber}

Merci pour votre commande !
Montant payé : ${formatPrice(total / 2)} (50% du total)
Mode de livraison : ${shippingMethod === 'air' ? 'Avion' : 'Bateau'}
Délai de livraison estimé : ${estimatedDelivery}

Nous vous tiendrons informé du suivi de votre commande.
    `;

    alert('Simulation de notification WhatsApp :\n\n' + message);
}

// Event handler for shipping calculation
function calculateShippingCost(e) {
    const method = document.querySelector('input[name="shipping-method"]:checked')?.value;
    const weightInput = document.querySelector('#weight');
    const volumeInput = document.querySelector('#volume');
    const shippingCostElement = document.querySelector('#shipping-cost');

    if (!method || !shippingCostElement) return;

    let cost = 0;
    if (method === 'air' && weightInput?.value) {
        cost = calculateShipping('air', parseFloat(weightInput.value), 0);
    } else if (method === 'sea' && volumeInput?.value) {
        cost = calculateShipping('sea', 0, parseFloat(volumeInput.value));
    }

    shippingCostElement.textContent = formatPrice(cost);
}

// Initialize on page load
updateCartUI();
