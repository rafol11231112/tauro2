document.addEventListener('DOMContentLoaded', function() {
    // Check login first
    const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'customer-login.html';
        return;
    }

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Get elements
    const productTitle = document.getElementById('productTitle');
    const productPrice = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');
    const stockSelect = document.getElementById('stockSelect');
    const paymentOptions = document.getElementById('paymentOptions');
    const buyButton = document.getElementById('buyButton');

    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const product = products[productId];

    if (product) {
        // Display product details
        productTitle.textContent = product.title;
        productPrice.textContent = `$${product.price.toFixed(2)}`;
        productDescription.textContent = product.description;

        // Display stock items
        if (product.stock && product.stock.length > 0) {
            stockSelect.innerHTML = `
                <option value="">Select an item</option>
                ${product.stock.map((item, index) => `
                    <option value="${index}">${item}</option>
                `).join('')}
            `;
        } else {
            stockSelect.innerHTML = '<option value="">Out of Stock</option>';
            buyButton.disabled = true;
        }

        // Add payment methods
        const paymentMethods = {
            crypto: '<i class="fab fa-bitcoin"></i> Crypto',
            paypal: '<i class="fab fa-paypal"></i> PayPal',
            card: '<i class="fas fa-credit-card"></i> Card',
            hood: '<i class="fas fa-mask"></i> Hood Pay'
        };

        product.payment_methods.forEach(method => {
            const btn = document.createElement('button');
            btn.className = 'payment-option';
            btn.dataset.method = method;
            btn.innerHTML = paymentMethods[method];
            
            btn.onclick = function() {
                document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                buyButton.disabled = !stockSelect.value;
            };
            
            paymentOptions.appendChild(btn);
        });

        // Handle stock selection
        stockSelect.onchange = function() {
            const selectedPayment = document.querySelector('.payment-option.selected');
            buyButton.disabled = !this.value || !selectedPayment;
        };

        // Handle buy button
        buyButton.onclick = async function() {
            const selectedPayment = document.querySelector('.payment-option.selected').dataset.method;
            const selectedStockIndex = parseInt(stockSelect.value);
            const selectedStock = product.stock[selectedStockIndex];

            if (!selectedStock) {
                alert('Please select an item first');
                return;
            }

            try {
                if (selectedPayment === 'card') {
                    const orderId = 'st_' + Math.random().toString(36).substring(2, 8);
                    
                    const response = await fetch('/api/create-stripe-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_name: product.title,
                            price: product.price,
                            order_id: orderId,
                            success_url: window.location.origin + `/customer-panel.html?order_id=${orderId}&status=success`,
                            cancel_url: window.location.href
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const session = await response.json();
                    
                    // Save pending order
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        price: product.price,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                    // Remove used stock
                    product.stock.splice(selectedStockIndex, 1);
                    localStorage.setItem('storeProducts', JSON.stringify(products));

                    // Redirect to Stripe
                    const stripe = Stripe('pk_test_51OQofSHGgwl4L4aFBCBC75IHsfCXl4cV1yF3zFqpAdGJjprOTMVrgtawnBfSwzJOoePfshv1bdcnzFPyddaZl6bx00AHnVHXAJ');
                    const { error } = await stripe.redirectToCheckout({
                        sessionId: session.id
                    });

                    if (error) {
                        throw error;
                    }
                } else if (selectedPayment === 'paypal') {
                    const orderId = 'pp_' + Math.random().toString(36).substring(2, 8);
                    
                    // Save pending order
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        price: product.price,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                    // Remove used stock
                    product.stock.splice(selectedStockIndex, 1);
                    localStorage.setItem('storeProducts', JSON.stringify(products));

                    // Redirect to PayPal
                    window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=YOUR_PAYPAL_EMAIL&item_name=${encodeURIComponent(product.title)}&amount=${product.price}&currency_code=USD&return=${encodeURIComponent(window.location.origin + '/customer-panel.html?order_id=' + orderId + '&status=success')}`;
                } else if (selectedPayment === 'hood') {
                    const orderId = 'm_' + Math.random().toString(36).substring(2, 8);
                    
                    // Save pending order
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        price: product.price,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                    // Remove used stock
                    product.stock.splice(selectedStockIndex, 1);
                    localStorage.setItem('storeProducts', JSON.stringify(products));

                    // Redirect to Hood Pay
                    window.location.href = `https://pay.hood-pay.com/pay?amount=${product.price.toFixed(2)}&currency=USD&order_id=${orderId}&product_name=${encodeURIComponent(product.title)}&success_url=${encodeURIComponent(window.location.origin + '/customer-panel.html')}&merchant_id=23750`;
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed: ' + error.message);
            }
        };
    } else {
        document.body.innerHTML = '<div class="error">Product not found</div>';
    }
}); 