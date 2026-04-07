document.addEventListener('DOMContentLoaded', () => {

    // fade in
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 50);

    // fade out
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');

            // animate if an internal link only
            if (target && target.startsWith('http') === false && target !== '#') {
                e.preventDefault(); // STOP the immediate navigation

                // start fading out
                document.body.classList.remove('page-loaded');

                // wait for animation then change page
                setTimeout(() => {
                    window.location.href = target;
                }, 200);
            }
        });
    });
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.add('page-loaded');
    }
});

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