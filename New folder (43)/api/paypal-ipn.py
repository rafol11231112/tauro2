from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import urllib.request

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Verify IPN with PayPal
            payload = post_data.decode('utf-8')
            validate_url = 'https://www.paypal.com/cgi-bin/webscr?cmd=_notify-validate&' + payload
            
            req = urllib.request.Request(validate_url)
            response = urllib.request.urlopen(req)
            result = response.read().decode('utf-8')

            if result == "VERIFIED":
                # Parse the original IPN message
                params = urllib.parse.parse_qs(payload)
                
                # Get the custom parameter (order ID)
                order_id = params.get('custom', [''])[0]
                payment_status = params.get('payment_status', [''])[0]

                if payment_status == "Completed":
                    # Payment was successful
                    self.send_response(200)
                    self.send_header('Content-type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b"OK")
                    return

            # Payment not verified
            self.send_response(400)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"Failed to verify payment")

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 
