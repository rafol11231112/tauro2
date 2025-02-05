from http.server import BaseHTTPRequestHandler
import json
import os

# File to store products
PRODUCTS_FILE = '/tmp/products.json'

# Default products
DEFAULT_PRODUCTS = [
    {
        "title": "OTP Bot",
        "price": 18.99,
        "description": "Automates One-Time Passwords for secure logins.",
        "stock": ["Item 1", "Item 2", "Item 3"],
        "payment_methods": ["card", "paypal", "hood"],
        "category": "software"
    },
    {
        "title": "SMS Bot",
        "price": 24.99,
        "description": "Advanced SMS automation tool.",
        "stock": ["Item 1", "Item 2", "Item 3"],
        "payment_methods": ["card", "paypal", "hood"],
        "category": "software"
    }
]

def get_products():
    try:
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r') as f:
                return json.load(f)
        else:
            # Initialize with default products
            with open(PRODUCTS_FILE, 'w') as f:
                json.dump(DEFAULT_PRODUCTS, f)
            return DEFAULT_PRODUCTS
    except:
        return DEFAULT_PRODUCTS

def save_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        products = get_products()
        self.wfile.write(json.dumps(products).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        product_data = json.loads(post_data)

        # Get existing products
        products = get_products()
        
        # Add new product
        products.append(product_data)
        
        # Save updated products
        save_products(products)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"success": True}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 
