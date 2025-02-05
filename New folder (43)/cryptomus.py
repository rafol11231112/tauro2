from http.server import BaseHTTPRequestHandler
import json
import requests
import os
import hmac
import hashlib

CRYPTOMUS_MERCHANT_ID = "YOUR_MERCHANT_ID"  # Replace with your Cryptomus merchant ID
CRYPTOMUS_PAYMENT_KEY = "YOUR_PAYMENT_KEY"   # Replace with your Cryptomus payment key

class handler(BaseHTTPRequestHandler):
    def create_signature(self, payload):
        payload_str = json.dumps(payload, separators=(',', ':'))
        signature = hmac.new(
            CRYPTOMUS_PAYMENT_KEY.encode(),
            payload_str.encode(),
            hashlib.sha512
        ).hexdigest()
        return signature

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Create payment request payload
            payload = {
                "merchant_id": CRYPTOMUS_MERCHANT_ID,
                "amount": str(data['amount']),
                "currency": "USD",
                "order_id": data['order_id'],
                "network": "ETH",  # Can be dynamic based on user selection
                "url_callback": f"{data['origin']}/api/cryptomus-webhook",
                "url_return": f"{data['origin']}/customer-panel.html?order_id={data['order_id']}&status=success",
                "is_payment_multiple": False,
                "lifetime": "24",
                "to_currency": "USDT"
            }

            # Create signature
            signature = self.create_signature(payload)

            # Make request to Cryptomus API
            response = requests.post(
                'https://api.cryptomus.com/v1/payment',
                json=payload,
                headers={
                    'merchant': CRYPTOMUS_MERCHANT_ID,
                    'sign': signature,
                    'Content-Type': 'application/json'
                }
            )

            # Send response back to client
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.content)

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
