document.addEventListener('DOMContentLoaded', async function() {
    // Check for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const status = urlParams.get('status');

    if (orderId && status === 'success') {
        console.log('Processing successful payment:', orderId);
        
        // Get pending order
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            console.log('Found pending order:', order);

            try {
                // Send email
                const customerEmail = localStorage.getItem('customerEmail');
                console.log('Sending email to:', customerEmail);
                
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerEmail: customerEmail,
                        product: order.product,
                        orderId: orderId,
                        item: Array.isArray(order.stock) ? order.stock.join('\n') : order.stock
                    })
                });

                if (!emailResponse.ok) {
                    throw new Error(`HTTP error! status: ${emailResponse.status}`);
                }

                const emailResult = await emailResponse.json();
                console.log('Email response:', emailResult);

                if (!emailResult.success) {
                    throw new Error(emailResult.error || 'Failed to send email');
                }

                // Add to purchases regardless of email status
                const purchases = JSON.parse(localStorage.getItem('customerPurchases')) || [];
                purchases.push({
                    id: orderId,
                    product: order.product,
                    price: order.price,
                    quantity: order.quantity,
                    paymentMethod: 'Card',
                    date: new Date().toLocaleDateString(),
                    delivered: true,
                    item: order.stock
                });

                // Remove from pending orders
                pendingOrders.splice(orderIndex, 1);

                // Save changes
                localStorage.setItem('customerPurchases', JSON.stringify(purchases));
                localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                console.log('Purchase completed successfully');
                
                // Refresh the page to show the purchase
                window.location.href = 'customer-panel.html';
            } catch (error) {
                console.error('Error processing purchase:', error);
                alert('There was an error processing your purchase. Please contact support.');
            }
        }
    }
});

async function verifyPayment(orderId) {
    try {
        // Check if it's a Stripe order
        if (orderId.startsWith('st_')) {
            console.log('Verifying Stripe payment for order:', orderId);
            
            const response = await fetch('/api/create-stripe-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order_id: orderId })
            });
            
            if (!response.ok) {
                throw new Error('Failed to verify payment');
            }
            
            const data = await response.json();
            console.log('Stripe verification response:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Always process the order for demo purposes
            // In production, check data.status === 'complete'
            const purchases = JSON.parse(localStorage.getItem('customerPurchases')) || [];
            const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
            
            // Find the pending order
            const pendingOrder = pendingOrders.find(order => order.id === orderId);
            if (pendingOrder) {
                console.log('Found pending order:', pendingOrder);  // Debug log
                
                // Send email to customer
                const customerEmail = localStorage.getItem('customerEmail');
                try {
                    console.log('Sending email to:', customerEmail);  // Debug log
                    const emailResponse = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customerEmail: customerEmail,
                            product: pendingOrder.product,
                            orderId: orderId,
                            item: Array.isArray(pendingOrder.stock) ? pendingOrder.stock.join('\n') : pendingOrder.stock
                        })
                    });

                    if (!emailResponse.ok) {
                        throw new Error(`HTTP error! status: ${emailResponse.status}`);
                    }

                    const emailResult = await emailResponse.json();
                    console.log('Email response:', emailResult);

                    if (!emailResult.success) {
                        throw new Error(emailResult.error || 'Failed to send email');
                    }
                } catch (emailError) {
                    console.error('Error sending email:', emailError);
                }

                // Add to purchases
                purchases.push({
                    id: orderId,
                    product: pendingOrder.product,
                    price: pendingOrder.price,
                    paymentMethod: 'Card',
                    date: new Date().toLocaleDateString(),
                    delivered: true,
                    item: pendingOrder.stock
                });
                
                // Remove from pending orders
                const updatedPendingOrders = pendingOrders.filter(order => order.id !== orderId);
                
                // Save changes
                localStorage.setItem('customerPurchases', JSON.stringify(purchases));
                localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
                
                console.log('Purchase completed successfully');  // Debug log
                return true;
            }
        }
        
        // Check if it's a PayPal order
        if (orderId.startsWith('pp')) {
            // For PayPal, we can verify using PayPal's API
            const verifyUrl = `https://api-m.paypal.com/v2/checkout/orders/${orderId}`;
            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('YOUR_PAYPAL_CLIENT_ID:YOUR_PAYPAL_SECRET')
                }
            });
            
            if (!response.ok) {
                throw new Error(`PayPal verification failed: ${response.status}`);
            }
            
            const data = await response.json();
            return data.status === 'COMPLETED';
        }
        
        // Hood Pay verification
        if (orderId.startsWith('m')) {
            const verifyUrl = `https://pay.hood-pay.com/status/${orderId}`;
            console.log('Verifying payment at:', verifyUrl);

            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer hoodpay_live_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI1NzEyIiwiZXhwIjoyMDUzMzY2Mzk3fQ.6-34sS40s2yu_47iiEO3znnWZW_U5JOS5szFq1pcD2I'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Verification response:', data);
            
            return data.status === 'completed' || data.status === 'success';
        }
        
        return false;
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
} 
