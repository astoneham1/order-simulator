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
            document.body.innerHTML = "<h1>Error loading restaurant. Check console.</h1>";
        });
} else {
    document.body.innerHTML = "<h1>No Restaurant ID provided in URL</h1>";
}

// rendering
function renderRestaurant(data) {
    // title and tagline
    const titleElement = document.getElementById('rest-name');
    titleElement.innerText = data.name;
    const taglineElement = document.getElementById('rest-tagline');
    taglineElement.innerText = data.tagline;

    // theme
    document.documentElement.style.setProperty('--primary-color', data.styling.primaryColor);

    // tagline colour
    if (data.styling.titleColor) {
        titleElement.style.color = data.styling.titleColor;
        titleElement.style.textShadow = 'none';
        taglineElement.style.color = data.styling.titleColor;
        taglineElement.style.textShadow = 'none';
    } else {
        titleElement.style.color = '';
        titleElement.style.textShadow = '';
        taglineElement.style.color = '';
        taglineElement.style.textShadow = '';
    }

    // hero image
    const header = document.getElementById('restaurant-header');
    if (data.assets.heroImage) {
        header.style.backgroundImage = `url('${data.assets.heroImage}')`;
    } else {
        // fallback: remove image to show just the color
        header.style.backgroundImage = 'none';
    }

    // logo
    const logoImg = document.getElementById('rest-logo');
    if (data.assets.logo) {
        logoImg.src = data.assets.logo;
        logoImg.style.display = 'inline-block';
    } else {
        logoImg.style.display = 'none'; // fallback
    }

    // menu
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; // clear anything from before

    data.menu.forEach((category, index) => {
        const gridId = `grid-${index}`;

        const categoryHtml = `
            <section class="menu-category">
                <div class="category-header" onclick="toggleCategory('${gridId}', this)">
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
                                <button class="add-btn" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Add +</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        container.innerHTML += categoryHtml;
    });
}

// collapsing categories
function toggleCategory(gridId, headerElement) {
    const grid = document.getElementById(gridId);
    const arrow = headerElement.querySelector('.arrow-icon');

    if (grid.classList.contains('hidden')) {
        grid.classList.remove('hidden');
        arrow.classList.remove('collapsed');
    } else {
        grid.classList.add('hidden');
        arrow.classList.add('collapsed');
    }
}

// cart handling
function addToCart(id, name, price) {
    console.log(`Added ${name} for £${price}`);
    alert(`Added ${name} to order!`);
}