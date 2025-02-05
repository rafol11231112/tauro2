document.addEventListener('DOMContentLoaded', function() {
    // Check login first
    const isLoggedIn = localStorage.getItem('customerLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'customer-login.html';
        return;
    }

    const purchasesList = document.getElementById('purchasesList');
    
    // Check for URL parameters (coming from successful payment)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const status = urlParams.get('status');

    // If we have an order_id and success status, verify the payment
    if (orderId && status === 'success') {
        verifyPayment(orderId).then(verified => {
            if (verified) {
                console.log('Payment verified successfully');
                displayPurchases(); // Refresh the display after verification
            }
        });
    } else {
        displayPurchases(); // Normal display if not coming from payment
    }

    function displayPurchases() {
        // Get purchases from localStorage
        const purchases = JSON.parse(localStorage.getItem('customerPurchases')) || [];
        console.log('Current purchases:', purchases); // Debug log
        
        if (purchases.length > 0) {
            purchasesList.innerHTML = purchases.map(purchase => `
                <div class="purchase-card">
                    <div class="purchase-header">
                        <h3 class="purchase-title">${purchase.product}</h3>
                        <span class="purchase-date">${purchase.date}</span>
                    </div>
                    <div class="purchase-info">
                        <p>Order ID: #${purchase.id}</p>
                        <p>Payment Method: ${purchase.paymentMethod}</p>
                        <p>Price: $${typeof purchase.price === 'number' ? purchase.price.toFixed(2) : purchase.price}</p>
                        ${purchase.quantity ? `<p>Quantity: ${purchase.quantity}</p>` : ''}
                    </div>
                    ${purchase.delivered ? `
                        <div class="purchase-details">
                            ${Array.isArray(purchase.item) ? purchase.item.join('<br>') : purchase.item}
                        </div>
                    ` : `
                        <div class="purchase-pending">
                            Your item will appear here once payment is confirmed
                        </div>
                    `}
                    <div class="delivery-status ${purchase.delivered ? 'delivered' : 'pending'}">
                        <i class="fas ${purchase.delivered ? 'fa-check-circle' : 'fa-clock'}"></i>
                        ${purchase.delivered ? 'Delivered' : 'Processing Payment'}
                    </div>
                </div>
            `).join('');
        } else {
            purchasesList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <h3>No purchases yet</h3>
                    <p>Visit our <a href="index.html#products">products page</a> to get started!</p>
                </div>
            `;
        }
    }
}); 
