document.addEventListener('DOMContentLoaded', function() {
    // Check admin login
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get DOM elements - Fix the IDs to match the HTML
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    const addProductForm = document.getElementById('addProductForm');
    const productsContainer = document.getElementById('productsContainer');

    console.log('Elements found:', {
        addProductBtn: !!addProductBtn,
        productForm: !!productForm,
        addProductForm: !!addProductForm,
        productsContainer: !!productsContainer
    });

    // Show/hide product form
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            console.log('Add Product button clicked');
            if (productForm) {
                // Toggle visibility
                if (productForm.style.display === 'none' || !productForm.style.display) {
                    productForm.style.display = 'block';
                } else {
                    productForm.style.display = 'none';
                }
            } else {
                console.error('Product form element not found');
            }
        });
    } else {
        console.error('Add Product button not found');
    }

    // Handle form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');

            const formData = new FormData(addProductForm);
            const newProduct = {
                title: formData.get('title'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                stock: formData.get('stock').split(',').map(item => item.trim()),
                payment_methods: ['card', 'paypal', 'hood'],
                category: formData.get('category') || 'software'
            };

            try {
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

                alert('Product added successfully!');
                addProductForm.reset();
                if (productForm) {
                    productForm.style.display = 'none';
                }
                loadProducts();
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            }
        });
    }

    // Load and display products
    async function loadProducts() {
        if (!productsContainer) return;

        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            console.log('Loaded products:', products);

            productsContainer.innerHTML = products.map((product, index) => `
                <div class="product-item">
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <p class="description">${product.description}</p>
                        <p class="stock">Stock: ${product.stock.length} items</p>
                    </div>
                    <div class="product-actions">
                        <button onclick="editProduct(${index})" class="edit-btn">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteProduct(${index})" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading products:', error);
            productsContainer.innerHTML = '<p class="error">Error loading products. Please try again later.</p>';
        }
    }

    // Initial load of products
    loadProducts();

    // Add logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }
});

// Global functions for edit and delete
window.editProduct = function(index) {
    alert('Edit functionality coming soon!');
};

window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        alert('Delete functionality coming soon!');
    }
}; 
