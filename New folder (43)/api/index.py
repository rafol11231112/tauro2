from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
        print("Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/create-stripe-session', methods=['POST'])
def create_stripe_session():
    try:
        data = request.json
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500 
