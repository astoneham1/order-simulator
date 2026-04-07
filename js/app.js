// setup
const params = new URLSearchParams(window.location.search);
const restaurantId = params.get('id');

// fetch
if (restaurantId) {
    fetch(`data/${restaurantId}.json`)
        .then(response => {
            if (!response.ok) throw new Error("Restaurant not found");
            return response.json();
        })
        .then(data => {
            renderRestaurant(data);
        })
        .catch(err => {
            console.error(err);
            showError("Error loading restaurant. Check console");
        });
} else {
    showError("No Restaurant ID was provided in URL");
}

// errors
function showError(message) {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
        <div class="error-container">
            <h1>404 - Kitchen Closed</h1>
            <p>${message}</p>
            <a href="index.html" class="error-btn">Return to Home</a>
        </div>
    `;
    document.getElementById('restaurant-header').style.display = 'none';
}

// load page
function renderRestaurant(data) {
    const titleElement = document.getElementById('rest-name');
    titleElement.innerText = data.name;
    const taglineElement = document.getElementById('rest-tagline');
    taglineElement.innerText = data.tagline;

    document.documentElement.style.setProperty('--primary-color', data.styling.primaryColor);

    if (data.styling.titleColor) {
        titleElement.style.color = data.styling.titleColor;
        titleElement.style.textShadow = 'none';
        taglineElement.style.color = data.styling.titleColor;
        taglineElement.style.textShadow = 'none';
    }

    const header = document.getElementById('restaurant-header');
    if (data.assets.heroImage) {
        header.style.backgroundImage = `url('${data.assets.heroImage}')`;
    } else {
        header.style.backgroundImage = 'none';
    }

    const logoImg = document.getElementById('rest-logo');
    if (data.assets.logo) {
        logoImg.src = data.assets.logo;
        logoImg.style.display = 'inline-block';
    } else {
        logoImg.style.display = 'none';
    }

    const container = document.getElementById('menu-container');
    let menuHtml = ''; 

    data.menu.forEach((category, index) => {
        const gridId = `grid-${index}`;

        const categoryHtml = `
            <section class="menu-category">
                <div class="category-header" data-action="toggle" data-target="${gridId}">
                    <h2 class="category-title">${category.categoryName}</h2>
                    <span class="arrow-icon">▼</span>
                </div>
                ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
                
                <div id="${gridId}" class="menu-grid">
                    ${category.items.map(item => `
                        <div class="food-card">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">` : ''}
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <div class="price-row">
                                <span>£${item.price.toFixed(2)}</span>
                                <div class="action-row">
                                    <div class="menu-qty-controls">
                                        <button data-action="decrease-qty" data-id="${item.id}">-</button>
                                        <span id="qty-${item.id}">1</span>
                                        <button data-action="increase-qty" data-id="${item.id}">+</button>
                                    </div>
                                    <button class="add-btn" 
                                        data-action="add" 
                                        data-id="${item.id}" 
                                        data-name="${item.name.replace(/"/g, '&quot;')}" 
                                        data-price="${item.price}"
                                        data-rest-id="${restaurantId}"
                                        data-rest-name="${data.name.replace(/"/g, '&quot;')}"
                                        data-image="${item.image ? item.image : ''}"
                                        data-rest-logo="${data.assets.logo ? data.assets.logo : ''}"> 
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        menuHtml += categoryHtml;
    });

    container.innerHTML = menuHtml;
}

// handling of clicks
document.getElementById('menu-container').addEventListener('click', function(e) {
    const headerElement = e.target.closest('.category-header');
    if (headerElement && headerElement.getAttribute('data-action') === 'toggle') {
        const gridId = headerElement.getAttribute('data-target');
        toggleCategory(gridId, headerElement);
        return;
    }

    if (e.target.getAttribute('data-action') === 'decrease-qty') {
        const id = e.target.getAttribute('data-id');
        const qtySpan = document.getElementById(`qty-${id}`);
        let currentQty = parseInt(qtySpan.innerText);
        if (currentQty > 1) {
            qtySpan.innerText = currentQty - 1;
        }
        return;
    }

    if (e.target.getAttribute('data-action') === 'increase-qty') {
        const id = e.target.getAttribute('data-id');
        const qtySpan = document.getElementById(`qty-${id}`);
        let currentQty = parseInt(qtySpan.innerText);
        qtySpan.innerText = currentQty + 1;
        return;
    }

    const addBtn = e.target.closest('.add-btn');
    if (addBtn && addBtn.getAttribute('data-action') === 'add') {
        const id = addBtn.getAttribute('data-id');
        const name = addBtn.getAttribute('data-name');
        const price = parseFloat(addBtn.getAttribute('data-price'));
        const restId = addBtn.getAttribute('data-rest-id');
        const restName = addBtn.getAttribute('data-rest-name');
        const image = addBtn.getAttribute('data-image'); 
        const restLogo = addBtn.getAttribute('data-rest-logo'); 
        const qtySpan = document.getElementById(`qty-${id}`);
        const quantityToAdd = parseInt(qtySpan.innerText) || 1;
        
        addToCart(id, name, price, restId, restName, quantityToAdd, image, restLogo);
        
        qtySpan.innerText = '1';
        return;
    }
});

function toggleCategory(gridId, headerElement) {
    const grid = document.getElementById(gridId);
    const arrow = headerElement.querySelector('.arrow-icon');
    grid.classList.toggle('hidden');
    arrow.classList.toggle('collapsed');
}

// add item to basket
function addToCart(id, name, price, restId, restName, quantityAdded, image, restLogo) {
    let cart = JSON.parse(localStorage.getItem('my_cart')) || [];
    let existingItem = cart.find(item => item.id === id && item.restId === restId);

    if (existingItem) {
        existingItem.quantity += quantityAdded;
    } else {
        cart.push({ id, name, price, restId, restName, quantity: quantityAdded, image: image, restLogo: restLogo });
    }

    localStorage.setItem('my_cart', JSON.stringify(cart));
    showToast(`Added ${quantityAdded}x ${name} to basket`); 
    updateBasketBadge(); 
}

// message when item is added to basket
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); 
    }, 3000);
}

// basket badge
function updateBasketBadge() {
    const badge = document.getElementById('basket-badge');
    if (!badge) return; 

    let cart = JSON.parse(localStorage.getItem('my_cart')) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.style.display = 'inline-block'; 
    } else {
        badge.style.display = 'none'; 
    }
}

document.addEventListener('DOMContentLoaded', updateBasketBadge);