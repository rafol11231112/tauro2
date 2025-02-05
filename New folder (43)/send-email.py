from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__)

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "refaellugasi10@gmail.com"
SENDER_PASSWORD = "xhpy nded imfp ygtc"

@app.route('/api/send-email', methods=['POST', 'OPTIONS'])
def handler():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        data = request.json
        
        recipient_email = data.get('customerEmail')
        product_name = data.get('product')
        order_id = data.get('orderId')
        item = data.get('item')
        
        print(f"Sending email to {recipient_email} for order {order_id}")  # Debug log
        
        msg = MIMEMultipart()
        msg['From'] = f"Your Store <{SENDER_EMAIL}>"
        msg['To'] = recipient_email
        msg['Subject'] = f'Your Purchase: {product_name} - Order #{order_id}'
        
        body = f"""
        Thank you for your purchase!

        Order Details:
        - Product: {product_name}
        - Order ID: #{order_id}

        Your Item:
        {item}

        Keep this email safe as it contains your purchased item.

        Best regards,
        Your Store Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print("Email sent successfully!")  # Debug log
        
        response = jsonify({"success": True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Email error: {str(e)}")  # Debug log
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500 
