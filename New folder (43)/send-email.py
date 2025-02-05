from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        print("Received data:", data)  # Debug log

        # Email configuration
        SMTP_SERVER = "smtp.gmail.com"
        SMTP_PORT = 587
        SENDER_EMAIL = "refaellugasi10@gmail.com"
        # Use an App Password instead of regular password
        SENDER_PASSWORD = "myrj uyuw kpfu bvdo"  # Replace with your new app password

        # Create message
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

        try:
            # Send email
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                print("Connecting to SMTP server...")
                server.starttls()
                print("Logging in...")
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                print("Sending email...")
                server.send_message(msg)
                print("Email sent successfully!")
        except Exception as smtp_error:
            print("SMTP Error:", str(smtp_error))
            raise smtp_error

        return jsonify({
            "success": True,
            "message": "Email sent successfully"
        })

    except Exception as e:
        print("Error sending email:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# For local testing
if __name__ == '__main__':
    app.run(port=8000) 
