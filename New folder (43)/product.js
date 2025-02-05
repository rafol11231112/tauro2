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

        // Simplified stock selection and quantity
        if (product.stock && product.stock.length > 0) {
            stockSelect.innerHTML = `
                <option value="">Select to Purchase</option>
                <option value="0">${product.title} (${product.stock.length} in stock)</option>
            `;
            
            // Add quantity selector after stock selection
            const quantityDiv = document.createElement('div');
            quantityDiv.className = 'quantity-selection';
            quantityDiv.innerHTML = `
                <label>Quantity:</label>
                <div class="quantity-controls">
                    <button type="button" class="quantity-btn minus">-</button>
                    <input type="number" id="quantityInput" value="1" min="1" max="${product.stock.length}">
                    <button type="button" class="quantity-btn plus">+</button>
                </div>
            `;
            stockSelect.parentNode.appendChild(quantityDiv);
            
            // Handle quantity controls
            const quantityInput = document.getElementById('quantityInput');
            const minusBtn = quantityDiv.querySelector('.minus');
            const plusBtn = quantityDiv.querySelector('.plus');
            
            minusBtn.onclick = () => {
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            };
            
            plusBtn.onclick = () => {
                if (quantityInput.value < product.stock.length) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                }
            };
            
            quantityInput.onchange = () => {
                let value = parseInt(quantityInput.value);
                if (value < 1) value = 1;
                if (value > product.stock.length) value = product.stock.length;
                quantityInput.value = value;
            };
        } else {
            stockSelect.innerHTML = `
                <option value="">Product Unavailable</option>
            `;
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
            const quantity = parseInt(document.getElementById('quantityInput').value);
            
            // Get the selected stock items
            const selectedStock = product.stock.slice(0, quantity);
            
            try {
                if (selectedPayment === 'card') {
                    const orderId = 'st_' + Math.random().toString(36).substring(2, 8);
                    
                    const response = await fetch('/api/create-stripe-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_name: `${product.title} x${quantity}`,
                            price: product.price * quantity,
                            order_id: orderId,
                            success_url: window.location.origin + `/customer-panel.html?order_id=${orderId}&status=success`,
                            cancel_url: window.location.href
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const session = await response.json();
                    
                    // Update the stock removal
                    product.stock.splice(0, quantity);
                    localStorage.setItem('storeProducts', JSON.stringify(products));
                    
                    // Update the pending order
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        quantity: quantity,
                        price: product.price * quantity,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

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
                    
                    // Save pending order first
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        quantity: quantity,
                        price: product.price * quantity,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                    // Create PayPal URL with proper parameters
                    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
                    paypalUrl.searchParams.append('cmd', '_xclick');
                    paypalUrl.searchParams.append('business', 'YOUR_PAYPAL_EMAIL@gmail.com'); // Replace with your PayPal email
                    paypalUrl.searchParams.append('item_name', encodeURIComponent(`${product.title} x${quantity}`));
                    paypalUrl.searchParams.append('amount', (product.price * quantity).toFixed(2));
                    paypalUrl.searchParams.append('currency_code', 'USD');
                    paypalUrl.searchParams.append('return', encodeURIComponent(`${window.location.origin}/customer-panel.html?order_id=${orderId}&status=success`));
                    paypalUrl.searchParams.append('cancel_return', encodeURIComponent(window.location.href));
                    paypalUrl.searchParams.append('notify_url', encodeURIComponent(`${window.location.origin}/api/paypal-ipn`));
                    paypalUrl.searchParams.append('custom', orderId);

                    // Redirect to PayPal
                    window.location.href = paypalUrl.toString();
                } else if (selectedPayment === 'hood') {
                    const orderId = 'm_' + Math.random().toString(36).substring(2, 8);
                    
                    // Update the stock removal
                    product.stock.splice(0, quantity);
                    localStorage.setItem('storeProducts', JSON.stringify(products));
                    
                    // Update the pending order
                    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
                    pendingOrders.push({
                        id: orderId,
                        product: product.title,
                        quantity: quantity,
                        price: product.price * quantity,
                        stock: selectedStock,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                    // Redirect to Hood Pay
                    window.location.href = `https://pay.hood-pay.com/pay?amount=${product.price * quantity}&currency=USD&order_id=${orderId}&product_name=${encodeURIComponent(product.title)}&success_url=${encodeURIComponent(window.location.origin + '/customer-panel.html')}&merchant_id=23750`;
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
