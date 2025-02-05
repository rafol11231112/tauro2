from http.server import BaseHTTPRequestHandler
import json
import stripe
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime

# Configurations
STRIPE_KEY = 'sk_test_51OQofSHGgwl4L4aF3XjdpXVc8OpHOQIobAsgVwU8ZwGWe2AqbIc8KymV6rf4VgqQ5URavCnYCNDIgHUH1JMLJ98G00cVHukVAU'
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "refaellugasi10@gmail.com"
SENDER_PASSWORD = "xhpy nded imfp ygtc"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"

# Initialize Stripe
stripe.api_key = STRIPE_KEY

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            response_data = {}
            
            # Auth endpoints
            if self.path == '/api/auth/register':
                email = data.get('email', '').lower()
                password = data.get('password')
                fullname = data.get('fullname')
                
                # For demo purposes, auto-verify without email
                response_data = {
                    "success": True,
                    "user": {
                        "email": email,
                        "fullname": fullname,
                        "password": password  # In production, hash this!
                    }
                }
                    
            elif self.path == '/api/auth/login':
                email = data.get('email', '').lower()
                password = data.get('password')
                
                # For demo, accept any login
                response_data = {
                    "success": True,
                    "user": {
                        "email": email,
                        "fullname": email.split('@')[0]  # Use email username as fullname
                    }
                }
            
            # Stripe endpoint
            elif self.path == '/api/create-stripe-session':
                try:
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
                            'quantity': data.get('quantity', 1),
                        }],
                        mode='payment',
                        success_url=data['success_url'],
                        cancel_url=data['cancel_url'],
                        metadata={
                            'order_id': data['order_id']
                        }
                    )
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'id': session.id}).encode())
                    return
                    
                except Exception as e:
                    print("Stripe Error:", str(e))
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': str(e)}).encode())
                    return

            # Admin login endpoint
            elif self.path == '/api/admin/login':
                username = data.get('username')
                password = data.get('password')
                
                if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                    response_data = {
                        "success": True,
                        "message": "Admin login successful"
                    }
                else:
                    response_data = {
                        "success": False,
                        "message": "Invalid credentials"
                    }

            # Handle email sending
            elif self.path == '/api/send-email':
                try:
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

                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': True}).encode())
                    return

                except Exception as e:
                    print("Email Error:", str(e))
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': str(e)}).encode())
                    return

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 
