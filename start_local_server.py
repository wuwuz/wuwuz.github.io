#!/usr/bin/env python3
"""
Simple HTTP server for local development.
This allows the website to load Excel files without CORS issues.

Usage:
    python3 start_local_server.py

Then open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow loading Excel files
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Handle favicon requests gracefully
        if self.path == '/favicon.ico':
            self.send_response(204)  # No Content
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, format, *args):
        # Suppress verbose logging for favicon requests
        if '/favicon.ico' not in args[0] if args else True:
            pass  # Suppress all logging for cleaner output

def main():
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        # Allow address reuse to prevent "Address already in use" errors
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.TCPServer(("", PORT), Handler)
        
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("Local development server started!")
        print("=" * 60)
        print(f"Server running at: {url}")
        print(f"Serving directory: {os.getcwd()}")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 60)
        
        # Try to open browser automatically
        try:
            webbrowser.open(url)
            print(f"\nOpening {url} in your browser...")
        except:
            print(f"\nPlease manually open {url} in your browser")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nStopping server...")
            httpd.shutdown()
            httpd.server_close()
            print("Server stopped. Port 8000 is now free.")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Error: Port {PORT} is already in use.")
            print("Either stop the other server or change the PORT in this script.")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

