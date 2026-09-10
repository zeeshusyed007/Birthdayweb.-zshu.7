addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

const ACCESS_EXPIRY = new Date(Date.UTC(2026, 8, 22, 0, 0, 0))

// Simple password protection using a hashed password stored in environment variable
// Set `PASSWORD_HASH` in Cloudflare Worker secrets (SHA-256 hex of the password)
async function handle(request){
  const url=new URL(request.url)

  // After the access expiry date, the page becomes public automatically.
  if(Date.now() >= ACCESS_EXPIRY.getTime()){
    return fetch(request)
  }

  // Allow assets to be fetched normally
  if(url.pathname.startsWith('/assets') || url.pathname.endsWith('.mp3')){
    return fetch(request)
  }

  if(request.method==='POST' && url.pathname==='/_verify'){
    try{
      const {password}=await request.json()
      const pwHash=await sha256Hex(password || '')
      const secret = PASSWORD_HASH || ''
      if(pwHash===secret){
        return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json','Set-Cookie':'birthday_auth=1;Path=/;Max-Age=31536000;SameSite=Lax'}})
      }else{
        return new Response(JSON.stringify({ok:false}),{status:401,headers:{'Content-Type':'application/json'}})
      }
    }catch(e){return new Response('Bad Request', {status:400})}
  }

  // If cookie present, serve index.html
  const cookie = request.headers.get('Cookie') || ''
  if(cookie.includes('birthday_auth=1')){
    return fetch(request)
  }

  // Otherwise show a minimal password page that posts to /_verify
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`+
    `<title>Enter Password</title><style>body{background:#030012;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,Segoe UI,Roboto}form{display:flex;flex-direction:column;gap:12px;padding:28px;border-radius:14px;background:linear-gradient(180deg,#10071a,#0b0610);min-width:280px}</style></head><body>`+
    `<form onsubmit="event.preventDefault();fetch('/_verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:document.getElementById('p').value})}).then(r=>{if(r.ok)location.reload();else alert('Wrong')})">`+
    `<h3>Private Birthday</h3><input id='p' type='password' placeholder='Password' style='padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#fff'><button type='submit' style='padding:10px;border-radius:8px;background:#ff6b88;border:0;color:#05060a;font-weight:700'>Enter</button>`+
    `</form></body></html>
    `,{headers:{'content-type':'text/html'}})
}

async function sha256Hex(str){
  const buf=new TextEncoder().encode(str)
  const hash=await crypto.subtle.digest('SHA-256',buf)
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
}
