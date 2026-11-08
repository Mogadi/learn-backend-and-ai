#!/usr/bin/env python3
"""Local static server with the same clean paths as vercel.json.

    python3 scripts/serve.py

Serves the repository root. /search, /whats-new, and /subjects/<slug>
return the same HTML files Vercel rewrites to. Unknown paths return 404.html.
"""
import os
import re
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8741


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if not self._rewrite():
            super().do_GET()

    def do_HEAD(self):
        if not self._rewrite():
            super().do_HEAD()

    def _rewrite(self):
        parsed = urllib.parse.urlsplit(self.path)
        path = urllib.parse.unquote(parsed.path)
        query = ("?" + parsed.query) if parsed.query else ""
        if path != "/" and path.endswith("/"):
            dest = (path.rstrip("/") or "/") + query
            self.send_response(308)
            self.send_header("Location", dest)
            self.end_headers()
            return True
        new = None
        if path == "/subjects" or re.fullmatch(r"/subjects/[^/]+", path):
            new = "/subject.html"
        elif path in ("/search", "/whats-new", "/subject"):
            new = path + ".html"
        if new:
            self.path = new + query
        return False

    def send_error(self, code, message=None, explain=None):
        page = os.path.join(ROOT, "404.html")
        if code == 404 and not getattr(self, "_serving_404", False) and os.path.isfile(page):
            self._serving_404 = True
            with open(page, "rb") as handle:
                body = handle.read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("Study path at http://127.0.0.1:%s/" % PORT, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
