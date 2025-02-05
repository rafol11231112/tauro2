document.addEventListener('DOMContentLoaded', function() {
    // Check admin login
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get DOM elements
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    const addProductForm = document.getElementById('addProductForm');
    const productsContainer = document.getElementById('productsContainer');

    // Show/hide product form
    if (addProductBtn && productForm) {
        addProductBtn.addEventListener('click', () => {
            productForm.style.display = productForm.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Handle product form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                productForm.style.display = 'none';
                loadProducts(); // Refresh the products list
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
    // Implement edit functionality
    alert('Edit functionality coming soon!');
};

window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Implement delete functionality
        alert('Delete functionality coming soon!');
    }
}; 
