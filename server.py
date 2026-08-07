import http.server
import socketserver
import os
import sys

# Force UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8000
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

if __name__ == "__main__":
    print(f"KAIRO Web App Server starting at http://localhost:{PORT}")
    print(f"Serving files from: {WEB_DIR}")
    print("Press Ctrl+C to stop the server.")
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            sys.exit(0)
