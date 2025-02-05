from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS
import stripe

app = Flask(__name__)
CORS(app)

# Stripe configuration
STRIPE_KEY = 'sk_test_51OQofSHGgwl4L4aF3XjdpXVc8OpHOQIobAsgVwU8ZwGWe2AqbIc8KymV6rf4VgqQ5URavCnYCNDIgHUH1JMLJ98G00cVHukVAU'
stripe.api_key = STRIPE_KEY

@app.route('/api/create-stripe-session', methods=['POST'])
def create_stripe_session():
    try:
        data = request.json
        
        # Create Stripe session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': data['product_name'],
                    },
                    'unit_amount': int(float(data['price']) * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=data['success_url'],
            cancel_url=data['cancel_url'],
            metadata={
                'order_id': data['order_id']
            }
        )
        
        return jsonify({'id': session.id})

    except Exception as e:
        print("Stripe Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        print("Received data:", data)

        # Email configuration
        SMTP_SERVER = "smtp.gmail.com"
        SMTP_PORT = 587
        SENDER_EMAIL = "refaellugasi10@gmail.com"
        SENDER_PASSWORD = "myrj uyuw kpfu bvdo"

        msg = MIMEMultipart()
        msg['From'] = f"Your Store <{SENDER_EMAIL}>"
        msg['To'] = data['customerEmail']
        msg['Subject'] = f"Your Purchase: {data['product']} - Order #{data['orderId']}"

        body = f"""
Thank you for your purchase!

Order Details:
- Product: {data['product']}
- Order ID: #{data['orderId']}

Your Item(s):
{data['item']}

Keep this email safe as it contains your purchased item(s).

Best regards,
Your Store Team
        """

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        return jsonify({"success": True})

    except Exception as e:
        print("Email Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

# For local testing
if __name__ == '__main__':
    app.run(port=3000) 
