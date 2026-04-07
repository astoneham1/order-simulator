document.addEventListener('DOMContentLoaded', renderBasket);

function renderBasket() {
    const container = document.getElementById('basket-content');
    let cart = JSON.parse(localStorage.getItem('my_cart')) || [];

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Your basket is empty</h2>
                <p>Looks like you haven't added any food yet!</p>
            </div>
        `;
        return;
    }

    const groupedCart = cart.reduce((groups, item) => {
        if (!groups[item.restId]) {
            groups[item.restId] = {
                restName: item.restName,
                restLogo: item.restLogo,
                items: []
            };
        }
        groups[item.restId].items.push(item);
        return groups;
    }, {});

    let html = '';
    let grandTotal = 0;

    for (const [restId, group] of Object.entries(groupedCart)) {
        html += `<div class="basket-section">`;
        html += `<h2 class="rest-group-title">
                    ${group.restLogo ? `<img src="${group.restLogo}" alt="${group.restName} logo" class="rest-group-logo">` : '🍽️'}
                    ${group.restName}
                 </h2>`;
        
        group.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;

            html += `
                <div class="basket-item">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" class="basket-item-img">` : 
                        `<div class="basket-item-img placeholder-img">🍽️</div>`
                    }
                    <div class="item-details">
                        <strong>${item.name}</strong>
                        <small>£${item.price.toFixed(2)} each</small>
                    </div>
                    
                    <div class="qty-controls">
                        <button onclick="updateQty('${item.id}', '${item.restId}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty('${item.id}', '${item.restId}', 1)">+</button>
                    </div>
                    
                    <div class="item-total">
                        £${itemTotal.toFixed(2)}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }

    html += `
        <div class="total-row">
            <span>Total:</span>
            <span>£${grandTotal.toFixed(2)}</span>
        </div>
        <button class="checkout-btn" onclick="checkout()">Checkout & Pay</button>
        <button class="clear-btn" onclick="emptyBasket()">Empty Basket</button>
    `;

    container.innerHTML = html;
}

function updateQty(itemId, restId, change) {
    let cart = JSON.parse(localStorage.getItem('my_cart')) || [];
    
    const index = cart.findIndex(item => item.id === itemId && item.restId === restId);
    
    if (index !== -1) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        localStorage.setItem('my_cart', JSON.stringify(cart));
        renderBasket();
    }
}

function checkout() {
    alert("Thanks for your order! Simulated payment complete.");
    localStorage.removeItem('my_cart');
    renderBasket(); 
}

function emptyBasket() {
    const confirmClear = confirm("Are you sure you want to empty your entire basket?");
    
    if (confirmClear) {
        localStorage.removeItem('my_cart');
        renderBasket(); 
    }
}