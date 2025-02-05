from http.server import BaseHTTPRequestHandler
import json
import hmac
import hashlib

CRYPTOMUS_MERCHANT_ID = "YOUR_MERCHANT_ID"
CRYPTOMUS_PAYMENT_KEY = "YOUR_PAYMENT_KEY"

class handler(BaseHTTPRequestHandler):
    def verify_signature(self, payload, signature):
        payload_str = json.dumps(payload, separators=(',', ':'))
        expected_signature = hmac.new(
            CRYPTOMUS_PAYMENT_KEY.encode(),
            payload_str.encode(),
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Verify signature
            signature = self.headers.get('sign')
            if not signature or not self.verify_signature(data, signature):
                raise ValueError("Invalid signature")

            # Process payment status
            if data['status'] == 'paid':
                order_id = data['order_id']
                # Update order status in your database
                # Send confirmation email
                # Release product to customer
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid payment status'}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode()) 
