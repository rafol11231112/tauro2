function createDots() {
    const background = document.querySelector('.background-dots');
    const numberOfDots = 30; // Reduced number for better visibility
    
    // Clear existing dots to prevent too many
    background.innerHTML = '';

    for (let i = 0; i < numberOfDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        // Random starting position
        dot.style.left = `${Math.random() * 100}%`;
        
        // Random size variation (5px to 7px)
        const size = 5 + (Math.random() * 2);
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        
        // Random opacity variation
        dot.style.opacity = 0.1 + (Math.random() * 0.2);
        
        // Random animation duration (15s to 25s)
        const duration = 15 + (Math.random() * 10);
        dot.style.animationDuration = `${duration}s`;
        
        // Random animation delay
        dot.style.animationDelay = `${Math.random() * -20}s`;
        
        background.appendChild(dot);
    }
}

// Create new dots every 20 seconds
setInterval(createDots, 20000);
createDots();

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
    const customerEmail = localStorage.getItem('customerEmail');
    const userBtn = document.querySelector('.user-btn');
    
    if (isLoggedIn && userBtn) {
        userBtn.innerHTML = `
            <i class="fas fa-user" style="color: #00ff00;"></i>
            ${customerEmail}
        `;
        userBtn.href = '#';
        
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Do you want to logout?')) {
                localStorage.removeItem('customerLoggedIn');
                localStorage.removeItem('customerEmail');
                localStorage.removeItem('customerName');
                window.location.href = 'customer-login.html';
            }
        });
    } else if (userBtn) {
        userBtn.innerHTML = `
            <i class="fas fa-user"></i>
            Customer Login
        `;
        userBtn.href = 'customer-login.html';
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Update the displayProducts function
async function displayProducts() {
    const productsContainer = document.querySelector('.product-grid');
    if (!productsContainer) return;

    try {
        // Fetch products from the API
        const response = await fetch('/api/products');
        const products = await response.json();

        productsContainer.innerHTML = products.map((product, index) => `
            <a href="product.html?id=${index}" class="product-card">
                <h3>${product.title}</h3>
                <p class="description">${product.description}</p>
                <div class="price-row">
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <span class="stock-status">
                        ${product.stock.length > 0 ? 'IN STOCK ✓' : 'OUT OF STOCK'}
                    </span>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p class="error">Error loading products. Please try again later.</p>';
    }
}

// Update the admin form handler
if (productForm) {
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(productForm);
        const newProduct = {
            title: formData.get('title'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            stock: [], // Add stock items as needed
            payment_methods: ['card', 'paypal', 'hood'],
            category: formData.get('category')
        };

        try {
            // Send new product to the API
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct)
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            // Refresh the display
            displayProducts();
            
            // Clear form
            productForm.reset();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        }
    });
}

function createReview() {
    return {
        stars: 5,
        time: '15 hours ago',
        verified: true
    };
}

function displayReviews() {
    const reviewGrid = document.querySelector('.review-grid');
    const reviews = Array(6).fill(null).map(createReview);
    
    reviewGrid.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="stars">${'★'.repeat(review.stars)}</div>
            <p class="time">${review.time}</p>
            <p class="verified"><i class="fas fa-check"></i> Verified Purchase</p>
        </div>
    `).join('');
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayReviews();
});

// Add smooth loading and animations
document.addEventListener('DOMContentLoaded', function() {
    // Smooth loading for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    });

    // Smooth counter animation for stats
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current).toLocaleString();
            
            if (current >= end) {
                element.textContent = end.toLocaleString();
                clearInterval(timer);
            }
        }, 16);
    }

    // Animate stats when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValue = entry.target;
                const endValue = parseInt(statValue.getAttribute('data-value'));
                animateValue(statValue, 0, endValue, 2000);
                observer.unobserve(statValue);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item h2').forEach(stat => {
        observer.observe(stat);
    });

    // Smoother product display
    function displayProducts() {
        const productsList = document.getElementById('productsList');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        productsList.style.opacity = '0';
        productsList.innerHTML = products.map((product, index) => `
            <div class="product-card" style="animation-delay: ${index * 0.1}s">
                <img src="${product.image}" alt="${product.title}" class="product-logo">
                <h3>${product.title}</h3>
                <p class="description">${product.description}</p>
                <div class="price-row">
                    <p class="price">$${product.price}</p>
                    <span class="stock-status">IN STOCK</span>
                </div>
            </div>
        `).join('');
        
        setTimeout(() => {
            productsList.style.opacity = '1';
        }, 100);
    }

    // Smoother review display
    function displayReviews() {
        const reviewGrid = document.querySelector('.review-grid');
        const reviews = Array(6).fill(null).map(createReview);
        
        reviewGrid.style.opacity = '0';
        reviewGrid.innerHTML = reviews.map((review, index) => `
            <div class="review-card" style="animation-delay: ${index * 0.1}s">
                <div class="stars">${'★'.repeat(review.stars)}</div>
                <p class="time">${review.time}</p>
                <p class="verified"><i class="fas fa-check"></i> Verified Purchase</p>
            </div>
        `).join('');
        
        setTimeout(() => {
            reviewGrid.style.opacity = '1';
        }, 100);
    }

    // Initialize everything
    createDots();
    displayProducts();
    displayReviews();
});

// Add this function at the top of script.js
function checkLoginRequired() {
    const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
    const customerEmail = localStorage.getItem('customerEmail');
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && !window.location.href.includes('customer-login.html')) {
        window.location.href = 'customer-login.html';
        return false;
    }
    
    return true;
}

// Add this right after the DOMContentLoaded event starts
document.addEventListener('DOMContentLoaded', function() {
    // Check login first
    if (!checkLoginRequired()) return;
    
    // Rest of your existing code...
});

// Add this to your existing checkLoginStatus function
function updateLoginLinks() {
    const currentPage = encodeURIComponent(window.location.href);
    const links = document.querySelectorAll('a[href*="product.html"]');
    
    links.forEach(link => {
        const originalHref = link.getAttribute('href');
        if (!originalHref.includes('customer-login.html')) {
            link.addEventListener('click', (e) => {
                const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
                if (!isLoggedIn) {
                    e.preventDefault();
                    window.location.href = `customer-login.html?return=${encodeURIComponent(originalHref)}`;
                }
            });
        }
    });
}

// Call this function after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    updateLoginLinks();
    // ... rest of your code
});

// Add these functions to script.js
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links
    const navLinks = {
        'Home': '/',
        'Products': '/#products',
        'Contact': '/#contact',
        'Reviews': '/#reviews'
    };

    // Add click handlers for nav links
    Object.entries(navLinks).forEach(([text, href]) => {
        const link = document.querySelector(`.nav-links a[href*="${href}"]`);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (href === '/') {
                    window.location.href = 'index.html';
                } else {
                    // If we're already on index.html, just scroll
                    if (window.location.pathname.includes('index.html')) {
                        const targetId = href.replace('#', '');
                        const target = document.getElementById(targetId);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else {
                        window.location.href = 'index.html' + href;
                    }
                }
            });
        }
    });

    // Cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cartBtn.querySelector('span').textContent = cart.length;
            // You can add cart modal/page logic here
        });
    }

    // User button
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
            if (isLoggedIn) {
                if (confirm('Do you want to logout?')) {
                    localStorage.removeItem('customerLoggedIn');
                    localStorage.removeItem('customerEmail');
                    window.location.href = 'customer-login.html';
                }
            } else {
                window.location.href = 'customer-login.html';
            }
        });
    }

    // Admin Panel button
    const adminBtn = document.querySelector('.admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            if (isAdminLoggedIn) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'admin-login.html';
            }
        });
    }

    // Update email display
    const emailText = document.querySelector('.email-text');
    if (emailText) {
        const customerEmail = localStorage.getItem('customerEmail');
        if (customerEmail) {
            emailText.textContent = customerEmail;
        }
    }

    // Update cart count
    const cartCount = document.querySelector('.cart-btn span');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartCount.textContent = cart.length;
    }
}); 
