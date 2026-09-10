from pyngrok import ngrok

# Start tunnel on port 8000
t = ngrok.connect(8000, "http")
print('NGROK_URL=' + str(t.public_url))
print('Press Ctrl+C in the terminal to stop the tunnel')

try:
    import time
    while True:
        time.sleep(3600)
except KeyboardInterrupt:
    ngrok.disconnect(t.public_url)
    print('Tunnel stopped')
