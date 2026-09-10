# Private Birthday Wish — Hosted & Password Protected

This project provides a small cinematic birthday website and a Cloudflare Worker to password-protect it.

Deployment (Cloudflare Pages + Worker)

1. Create a Cloudflare account and a Pages site.
2. Upload the repository (or connect to GitHub) and set build output to the root.
3. Add a Worker using the `worker.js` script and route it to your Pages domain root.
4. Set a secret environment variable `PASSWORD_HASH` equal to the SHA-256 hex of your desired password.

To generate the hash locally (Node):
```
node -e "const crypto=require('crypto');console.log(crypto.createHash('sha256').update(process.argv[1]).digest('hex'))" 'your-password'
```

Notes:
- The Worker checks `birthday_auth=1` cookie and serves the site only when present.
- Change the password by updating the `PASSWORD_HASH` secret in Cloudflare.
- The site is fully static and will remain online independently of your PC.
Happy Birthday - Premium Card

How to customize:
- Replace `assets/images/photo*.svg` with your photos (keep the same filenames).
- Replace `assets/music/placeholder.mp3` with your chosen audio (do NOT autoplay by default).
- Edit the countdown date in `Happy_Birthday-3.html` (the `data-target` on `.countdown`).
- Replace `[Your Name]` in `Happy_Birthday-3.html`.

Run locally:
Use any static server, e.g. Python 3:

```bash
python -m http.server 8000
```

Open http://localhost:8000/Happy_Birthday-3.html

