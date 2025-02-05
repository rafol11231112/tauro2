from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        print("Received data:", data)  # Debug log

        # Email configuration
        SMTP_SERVER = "smtp.gmail.com"
        SMTP_PORT = 587
        SENDER_EMAIL = "refaellugasi10@gmail.com"
        SENDER_PASSWORD = "xhpy nded imfp ygtc"

        # Create message
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = data['customerEmail']
        msg['Subject'] = f"Your Purchase: {data['product']}"

        body = f"""
        Thank you for your purchase!

        Order Details:
        - Product: {data['product']}
        - Order ID: {data['orderId']}

        Your Item:
        {data['item']}

        Keep this email safe as it contains your purchased item.

        Best regards,
        Your Store Team
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        print("Email sent successfully!")
        return jsonify({"success": True})

    except Exception as e:
        print("Error sending email:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

# For local testing
if __name__ == '__main__':
    app.run(port=8000) 
