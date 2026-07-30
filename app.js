const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const icon = (n) => ({package:'▣',chart:'▥',inbox:'▤',alert:'⚠',truck:'▱',credit:'◫',users:'♙',plug:'⌁',settings:'⚙',search:'⌕',bell:'♧',plus:'＋',logout:'↗',eye:'◉',menu:'☰',chevron:'›',map:'⌖'})[n] || '•';
const formatINR = n => `₹${Number(n || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
const shortDate = d => new Date(d).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
const now = () => new Date().toISOString();
const routes = {SuperAdmin:'/admin', InternalManager:'/manager', ClientAdmin:'/client', ClientStaff:'/staff'};

const seed = {
  users:[
    {id:1,name:'Platform Admin',email:'passhhu15@gmail.com',password:'Admin@123',role:'SuperAdmin',brand:'Shiptix',permissions:[]},
    {id:2,name:'Amit Sharma',email:'amit@shiptix.in',password:'Manager@123',role:'InternalManager',brand:'Shiptix',permissions:[]},
    {id:3,name:'Rahul Sharma',email:'rahul@freshkart.in',password:'Client@123',role:'ClientAdmin',brand:'FreshKart',phone:'+91 98765 42411',permissions:[]},
    {id:4,name:'Priya Menon',email:'priya@zapstyle.com',password:'Client@123',role:'ClientAdmin',brand:'ZapStyle',phone:'+91 98450 11342',permissions:[]},
    {id:5,name:'Deepak Kumar',email:'deepak@freshkart.in',password:'Staff@123',role:'ClientStaff',clientId:3,brand:'FreshKart',permissions:['create_order','view_orders','view_wallet','print_labels']}
  ],
  orders:[
    {id:1,orderId:'SX1001',clientId:3,userId:3,awbNumber:'BD7812345601',status:'Delivered',weight:1.2,shippingCost:95,createdAt:'2026-07-27T09:15:00Z'},
    {id:2,orderId:'SX1002',clientId:3,userId:5,awbNumber:'BD7812345602',status:'InTransit',weight:.4,shippingCost:45,createdAt:'2026-07-28T12:10:00Z'},
    {id:3,orderId:'SX1003',clientId:4,userId:4,awbNumber:'BD7812345603',status:'OutForDelivery',weight:2.5,shippingCost:130,createdAt:'2026-07-29T06:30:00Z'},
    {id:4,orderId:'SX1004',clientId:3,userId:3,awbNumber:'BD7812345604',status:'RTO',weight:1.4,shippingCost:95,createdAt:'2026-07-27T15:22:00Z'},
    {id:5,orderId:'SX1005',clientId:4,userId:4,awbNumber:'BD7812345605',status:'Booked',weight:.8,shippingCost:65,createdAt:'2026-07-29T08:00:00Z'}
  ],
  transactions:[
    {id:1,userId:3,type:'Credit',amount:5000,description:'Wallet recharge',createdAt:'2026-07-25T09:00:00Z',balance:5000},
    {id:2,userId:3,type:'Debit',amount:85.5,description:'Shipment SX1001',createdAt:'2026-07-27T09:16:00Z',balance:4914.5},
    {id:3,userId:3,type:'Debit',amount:120,description:'Shipment SX1004',createdAt:'2026-07-27T15:25:00Z',balance:4794.5},
    {id:4,userId:4,type:'Credit',amount:10000,description:'Wallet recharge',createdAt:'2026-07-24T11:00:00Z',balance:10000}
  ],
  customers:[
    {id:3,brand:'FreshKart',name:'Rahul Sharma',phone:'+91 98765 42411',email:'rahul@freshkart.in',joined:'12 Jul 2026',status:'Active'},
    {id:4,brand:'ZapStyle',name:'Priya Menon',phone:'+91 98450 11342',email:'priya@zapstyle.com',joined:'11 Jul 2026',status:'Active'},
    {id:7,brand:'BrewBazaar',name:'Ayesha Khan',phone:'+91 99117 05500',email:'hello@brewbazaar.in',joined:'28 Jul 2026',status:'Pending'},
    {id:8,brand:'NestNook',name:'Vikram Jain',phone:'+91 98222 33530',email:'team@nestnook.in',joined:'27 Jul 2026',status:'Pending'},
    {id:9,brand:'GlowBox',name:'Maya Roy',phone:'+91 98470 81820',email:'contact@glowbox.in',joined:'22 Jul 2026',status:'Blocked'}
  ],
  shopify:null
};
let db = JSON.parse(localStorage.getItem('shiptix_db') || 'null') || seed;
let session = JSON.parse(localStorage.getItem('shiptix_session') || 'null');
const persist = () => localStorage.setItem('shiptix_db', JSON.stringify(db));
const saveSession = () => localStorage.setItem('shiptix_session', JSON.stringify(session));
const currentUser = () => session ? db.users.find(u => u.id === session.id) : null;
const walletUserId = u => u.role === 'ClientStaff' ? u.clientId : u.id;
const balanceOf = u => { const x = db.transactions.filter(t => t.userId === walletUserId(u)); return x.length ? x[x.length-1].balance : 0; };
const roleName = r => ({SuperAdmin:'Super Admin',InternalManager:'Internal Manager',ClientAdmin:'Client Admin',ClientStaff:'Client Staff'})[r] || r;

function toast(message, type='success') { const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = message; $('#toast-stack').append(el); setTimeout(() => el.remove(), 3600); }
function nav(path) { location.hash = path; }
function esc(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function statusBadge(s) { const cls = ['Delivered','Active','Operational','Converted'].includes(s) ? 'success' : ['RTO','Blocked','Offline','Cancelled'].includes(s) ? 'danger' : ['Pending','Booked','InTransit','OutForDelivery','New'].includes(s) ? 'info' : ['Open'].includes(s) ? 'danger' : ['In Progress','Contacted','Degraded'].includes(s) ? 'warn' : 'muted'; return `<span class="badge badge-${cls}">${esc(s)}</span>`; }
function trackingCard() { return `<div class="tracking-card"><div class="tracking-top"><div><div class="eyebrow" style="color:#a5b4fc">LIVE SHIPMENT</div><b style="font:700 14px Manrope">Blue Dart Express</b></div><span class="live">● LIVE</span></div><div class="awb"><div><b>BD9876543210</b><small>FreshKart → Mumbai · 1.2kg</small></div><span style="color:#f97316;font-size:20px">▣</span></div><div class="route"><div class="route-node active"><i></i><span>Delhi</span></div><div class="route-node"><i></i><span>Mumbai</span></div><div class="route-node"><i></i><span>Kolkata</span></div><div class="route-node"><i></i><span>Bangalore</span></div></div><div style="display:flex;justify-content:space-between;color:#a8b3c7;font-size:11px;border-top:1px solid #334155;padding-top:13px"><span>Picked up 10:32 AM</span><span>ETA Tomorrow</span></div></div>`; }

let __sceneCleanup = null
let __landingObserver = null

function renderLanding() {
  if (__sceneCleanup) { try { __sceneCleanup() } catch (e) {} __sceneCleanup = null }
  if (__landingObserver) { __landingObserver.disconnect(); __landingObserver = null }

  const pillars = [
    ['truck', 'Ship', 'Book across 15+ carriers', 'Rate-shop Blue Dart, Delhivery, Xpressbees, Ekart and more, then auto-assign the smartest carrier and generate labels in under two seconds.'],
    ['map', 'Track', 'Follow every mile, live', 'A single control tower for every shipment with real-time status, proactive NDR alerts and automated buyer notifications across the journey.'],
    ['chart', 'Grow', 'Turn logistics into leverage', 'Cut RTO, reconcile COD faster and unlock delivery insights that lift first-attempt success — so shipping becomes a growth engine, not a cost centre.']
  ]
  const rows = [
    ['assets/warehouse.png', 'Fulfilment, on autopilot', 'From order to pickup in minutes', 'Import orders from Shopify or your storefront, batch-generate AWBs, print labels and schedule pickups — all from one screen. Auto-assign rules pick the best carrier for every pin code so your team stops copy-pasting between portals.', ['One-click Shopify sync', 'Bulk label generation', 'Smart auto-assign rules']],
    ['assets/fleet.png', 'Nationwide reach', '19,000+ pin codes, one platform', 'Reach customers everywhere with pan-India carrier coverage and intelligent serviceability checks at checkout. Route each parcel through the fastest, most reliable carrier for its destination automatically.', ['Serviceability at checkout', 'Fastest-route selection', 'Live capacity balancing']],
    ['assets/courier.png', 'Delight at the doorstep', 'Fewer failed deliveries, happier buyers', 'Proactive NDR management, branded tracking pages and automated WhatsApp and email updates keep buyers informed and reduce returns — lifting first-attempt delivery and repeat purchases.', ['Automated NDR follow-ups', 'Branded tracking pages', 'COD reconciliation']]
  ]
  const stats = [
    ['2.4', 'M+', 'Shipments processed'],
    ['1.2', 'K+', 'D2C brands scaling'],
    ['19', 'K+', 'Pin codes served'],
    ['84.3', '%', 'First-attempt delivery']
  ]
  const quotes = [
    ['Shiptix cut our label time from minutes to seconds. Our ops team finally stopped drowning in browser tabs.', 'Rahul Sharma', 'Founder, FreshKart', 'RS'],
    ['The unified wallet and NDR view alone paid for itself. Delivery success is up 11% this quarter.', 'Priya Menon', 'Head of Ops, ZapStyle', 'PM'],
    ['We scaled from 200 to 6,000 orders a month without adding a single ops hire. The automation just works.', 'Ayesha Khan', 'Founder, BrewBazaar', 'AK']
  ]
  const plans = [
    ['Starter', '₹0', 'For new D2C brands finding their feet.', ['Up to 200 shipments / mo', '2 carriers', 'Prepaid wallet', 'Email support'], false],
    ['Growth', '₹1,499', 'For scaling brands that ship daily.', ['Unlimited shipments', 'All carriers + auto-assign', 'Analytics & NDR tools', 'Priority support', 'Shopify integration'], true],
    ['Enterprise', 'Custom', 'For high-volume, multi-team operations.', ['Everything in Growth', 'Dedicated account manager', 'Custom SLAs & pricing', 'API & webhook access', 'Role-based teams'], false]
  ]
  const faqs = [
    ['How quickly can I go live?', 'Most brands are shipping within a day. Connect Shopify or import a CSV, add wallet credit, and generate your first label in minutes.'],
    ['Which carriers are supported?', 'Blue Dart, Delhivery, Xpressbees, Ekart, DTDC and more — with new carriers added regularly. Auto-assign picks the best one per shipment.'],
    ['Do you handle COD and NDR?', 'Yes. Shiptix reconciles COD remittances automatically and gives you a dedicated NDR workflow to recover failed deliveries fast.'],
    ['Is there a long-term contract?', 'No lock-in. Start on the free plan, upgrade when you are ready, and cancel anytime. Enterprise plans are tailored to your volume.']
  ]
  const carriers = ['Blue Dart', 'Delhivery', 'Xpressbees', 'Ekart', 'DTDC', 'Shopify']

  app.innerHTML = `<main class="landing lp">
    <div class="lp-announce"><span class="lp-announce-dot"></span> New: Automated NDR recovery is live — cut failed deliveries by up to 30%. <a data-nav="/login">Try it free →</a></div>

    <nav class="lp-nav">
      <div class="lp-nav-inner">
        <button class="logo" data-nav="/"><span class="logo-mark">▣</span>Shiptix</button>
        <div class="lp-links"><a href="#capabilities">Platform</a><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
        <div class="nav-actions"><button class="btn btn-ghost" data-nav="/login">Log in</button><button class="btn btn-primary" data-nav="/login">Get started <span>→</span></button></div>
      </div>
    </nav>

    <section class="lp-hero">
      <div class="lp-hero-inner">
        <div class="lp-hero-copy reveal">
          <span class="lp-pill">◆ The logistics operating system for D2C</span>
          <h1>Ship faster.<br>Track everything.<br><span class="lp-accent">Scale without the chaos.</span></h1>
          <p>Shiptix is the single control centre where growing brands book, track and optimise every shipment across every carrier — no spreadsheets, no guesswork, no dropped parcels.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" data-nav="/login">Start free trial <span>→</span></button>
            <a class="btn btn-ghost btn-lg" href="#features">See the platform</a>
          </div>
          <div class="lp-proof">
            <div><strong>&lt; 2 sec</strong><span>Label generation</span></div>
            <div><strong>99.3%</strong><span>API uptime</span></div>
            <div><strong>19K+</strong><span>Pin codes covered</span></div>
          </div>
        </div>
        <div class="lp-hero-visual">
          <div class="lp-canvas-wrap">
            <canvas id="truck-canvas" aria-hidden="true"></canvas>
            <div class="lp-canvas-badge lp-badge-a"><span class="lp-float-icon" style="background:#dcfce7;color:#16a34a">✓</span><div><b>Label generated</b><small>AWB BD9876543210</small></div></div>
            <div class="lp-canvas-badge lp-badge-b"><span class="lp-float-icon" style="background:#eef2ff;color:#4338ca">◫</span><div><b>₹4,914.50</b><small>Wallet balance</small></div></div>
          </div>
        </div>
      </div>
      <div class="lp-trust reveal">
        <span>Powering shipments with</span>
        <div class="lp-trust-logos">${carriers.map(c => `<b>${c}</b>`).join('')}</div>
      </div>
    </section>

    <section class="lp-section" id="capabilities">
      <div class="section-heading center reveal">
        <div class="eyebrow">One platform, end to end</div>
        <h2>Everything you need to ship, track and grow.</h2>
        <p>Three connected pillars replace the tangle of carrier portals, spreadsheets and support tickets your team fights today.</p>
      </div>
      <div class="lp-pillars">
        ${pillars.map((p, i) => `<article class="lp-pillar reveal" style="--d:${i * 90}ms"><div class="lp-pillar-icon">${icon(p[0])}</div><span class="lp-pillar-kicker">${p[1]}</span><h3>${p[2]}</h3><p>${p[3]}</p></article>`).join('')}
      </div>
    </section>

    <section class="lp-features" id="features">
      <div class="lp-section">
        ${rows.map((r, i) => `<div class="lp-row ${i % 2 ? 'lp-row-rev' : ''} reveal">
          <div class="lp-row-media"><img src="${r[0]}" alt="${r[2]}" loading="lazy"><div class="lp-row-glow"></div></div>
          <div class="lp-row-copy">
            <div class="eyebrow">${r[1]}</div>
            <h3>${r[2]}</h3>
            <p>${r[3]}</p>
            <ul>${r[4].map(x => `<li><span>✓</span>${x}</li>`).join('')}</ul>
            <button class="btn btn-ghost" data-nav="/login">Explore ${r[1].toLowerCase()} <span>→</span></button>
          </div>
        </div>`).join('')}
      </div>
    </section>

    <section class="lp-stats">
      <div class="lp-stats-inner">
        ${stats.map(s => `<div class="reveal"><b><span class="lp-count" data-to="${s[0]}">0</span>${s[1]}</b><span>${s[2]}</span></div>`).join('')}
      </div>
    </section>

    <section class="lp-section" id="testimonials">
      <div class="section-heading center reveal">
        <div class="eyebrow">Loved by operators</div>
        <h2>Teams ship calmer with Shiptix.</h2>
        <p>From first order to ten-thousandth, ambitious brands run their logistics on Shiptix.</p>
      </div>
      <div class="lp-quotes">
        ${quotes.map((q, i) => `<article class="lp-quote reveal" style="--d:${i * 80}ms"><div class="lp-stars">★★★★★</div><p>“${q[0]}”</p><div class="person"><div class="avatar">${q[3]}</div><div><b>${q[1]}</b><span>${q[2]}</span></div></div></article>`).join('')}
      </div>
    </section>

    <section class="lp-section" id="pricing">
      <div class="section-heading center reveal">
        <div class="eyebrow">Pricing</div>
        <h2>Simple plans that scale with you.</h2>
        <p>Start free. Upgrade when you are ready. No lock-in, cancel anytime.</p>
      </div>
      <div class="lp-pricing">
        ${plans.map((p, i) => `<article class="lp-plan ${p[4] ? 'featured' : ''} reveal" style="--d:${i * 80}ms">${p[4] ? '<span class="lp-plan-tag">Most popular</span>' : ''}<h3>${p[0]}</h3><div class="lp-price">${p[1]}${p[1].startsWith('₹') && p[1] !== '₹0' ? '<small>/mo</small>' : ''}</div><p class="lp-plan-desc">${p[2]}</p><ul>${p[3].map(x => `<li><span>✓</span>${x}</li>`).join('')}</ul><button class="btn ${p[4] ? 'btn-primary' : 'btn-ghost'} btn-block" data-nav="/login">${p[0] === 'Enterprise' ? 'Talk to sales' : 'Get started'}</button></article>`).join('')}
      </div>
    </section>

    <section class="lp-section lp-faq-section" id="faq">
      <div class="section-heading center reveal">
        <div class="eyebrow">FAQ</div>
        <h2>Everything else you might ask.</h2>
      </div>
      <div class="lp-faq">
        ${faqs.map(f => `<details class="lp-faq-item reveal"><summary>${f[0]}<span class="lp-faq-plus">+</span></summary><p>${f[1]}</p></details>`).join('')}
      </div>
    </section>

    <section class="lp-cta" id="contact">
      <div class="lp-cta-inner">
        <div class="lp-cta-copy reveal">
          <div class="eyebrow" style="color:#fdba74">Get in touch</div>
          <h2>Ready to take control of your shipping?</h2>
          <p>Tell us about your brand and our team will set you up with a tailored demo within 24 hours.</p>
          <div class="lp-cta-points"><span>✓ Free onboarding</span><span>✓ No credit card</span><span>✓ Live in a day</span></div>
        </div>
        <form class="lp-form reveal" id="inquiry-form">
          <div class="field"><label>Full name</label><input name="name" placeholder="Your name" required></div>
          <div class="field"><label>Work email</label><input name="email" type="email" placeholder="you@company.com" required></div>
          <div class="field"><label>Brand / company</label><input name="brand" placeholder="Your brand" required></div>
          <div class="field"><label>Monthly shipments</label><select name="volume"><option>0 – 200</option><option>200 – 1,000</option><option>1,000 – 5,000</option><option>5,000+</option></select></div>
          <button class="btn btn-primary btn-block" type="submit">Request a demo <span>→</span></button>
        </form>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-footer-inner">
        <div class="lp-footer-brand"><div class="logo"><span class="logo-mark">▣</span>Shiptix</div><p>Precision operations, scaled. The logistics operating system for modern D2C brands.</p></div>
        <div class="lp-footer-cols">
          <div><h4>Platform</h4><a href="#capabilities">Overview</a><a href="#features">Features</a><a href="#pricing">Pricing</a></div>
          <div><h4>Company</h4><a href="#contact">Contact</a><a href="#">About</a><a href="#">Careers</a></div>
          <div><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a></div>
        </div>
      </div>
      <div class="lp-footer-bar"><span>© ${new Date().getFullYear()} Shiptix. All rights reserved.</span><span>Made for brands that move.</span></div>
    </footer>
  </main>`

  $('#inquiry-form').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('Inquiry submitted! Our team will contact you within 24 hours.') }
  $$('[data-nav]').forEach(e => e.onclick = () => nav(e.dataset.nav))

  // Scroll-reveal animations
  __landingObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in')
        if (en.target.classList.contains('lp-stats-inner') || en.target.querySelector) {}
        obs.unobserve(en.target)
      }
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  $$('.reveal').forEach(el => __landingObserver.observe(el))

  // Animated counters
  const counters = $$('.lp-count')
  if (counters.length) {
    const cObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return
        const el = en.target, to = parseFloat(el.dataset.to), dec = (to % 1 !== 0) ? 1 : 0
        const start = performance.now(), dur = 1400
        const step = t => {
          const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3)
          el.textContent = (to * e).toFixed(dec)
          if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec)
        }
        requestAnimationFrame(step)
        obs.unobserve(el)
      })
    }, { threshold: 0.6 })
    counters.forEach(c => cObs.observe(c))
  }

  // 3D truck hero (progressive enhancement)
  const canvas = $('#truck-canvas')
  if (canvas) {
    import('./truck-scene.js')
      .then(m => { __sceneCleanup = m.initTruckScene(canvas) })
      .catch(err => { console.log('[v0] 3D scene failed to load:', err.message); canvas.closest('.lp-canvas-wrap')?.classList.add('lp-canvas-fallback') })
  }
}

function renderLogin() { app.innerHTML = `<main class="login"><section class="login-main"><button class="logo" style="background:transparent;padding:0;text-align:left" data-nav="/"><span class="logo-mark">▣</span>Shiptix</button><div class="login-card"><h1>Log in to your account</h1><p>Welcome back. Please enter your details.</p><form class="login-form" id="login-form"><div class="field"><label>Email address</label><input name="email" type="email" placeholder="you@company.com" required></div><div class="field"><label>Password</label><input name="password" type="password" placeholder="Enter your password" required></div><button class="btn btn-primary" type="submit">Log in <span>→</span></button></form><div class="demo-hint"><b>Demo access</b><br>Try <b>rahul@freshkart.in</b> / <b>Client@123</b><br><span class="muted">Use the other seeded accounts listed in the README to explore each role.</span></div></div></section><aside class="login-visual"> <div>${trackingCard()}<div class="login-quote"><b>Precision operations, scaled.</b><p>&lt; 2 sec label generation&nbsp;&nbsp; · &nbsp;&nbsp;99.3% API uptime&nbsp;&nbsp; · &nbsp;&nbsp;19K+ pin codes</p></div></div></aside></main>`; $('#login-form').onsubmit = login; }
function login(e) { e.preventDefault(); const f = new FormData(e.target), user = db.users.find(u => u.email.toLowerCase() === f.get('email').toLowerCase() && u.password === f.get('password')); if (!user) return toast('Incorrect email or password.', 'error'); session = {id:user.id, token:'demo_shiptix_'+user.id}; saveSession(); nav(routes[user.role]); }
function logout() { session = null; localStorage.removeItem('shiptix_session'); nav('/login'); toast('You have been logged out.'); }

const adminGroups = [{label:'MAIN',items:[['Dashboard','chart']]},{label:'ORDER MANAGEMENT',items:[['Booking List','package'],['Multiple Status Update','chart'],['AWB Tracking','map'],['Weight Discrepancy','alert']]},{label:'FINANCIALS',items:[['Customer Wallets','credit'],['COD Remittance','credit'],['B2B / B2C Invoice','package'],['Price List','chart']]},{label:'CUSTOMERS',items:[['Customer Details','users'],['Pending Customers','users'],['Leads List','inbox']]},{label:'ANALYTICS',items:[['COD Prepaid Sum','chart'],['NDR & Exceptions','alert'],['Pickup Pending','truck']]},{label:'SYSTEM CONFIG',items:[['Pincode Serviceability','map'],['Carrier Master','truck'],['Carrier Config','settings'],['Auto Assign Rule','settings'],['API Gateways','plug']]}];
function adminSidebar(section) { return `<aside class="side admin-side" id="sidebar"><div class="side-head"><div class="logo"><span class="logo-mark" style="background:#6366f1">▣</span>Shiptix</div><span class="role-pill">ADMIN</span></div><nav class="side-nav">${adminGroups.map(g=>`<div class="nav-group-label">${g.label}</div>${g.items.map(([x,i])=>`<button class="side-item ${section===x?'active':''}" data-section="${x}"><span>${icon(i)}</span>${x}</button>`).join('')}`).join('')}</nav><div class="side-foot"><span style="font-size:10px">SHIPTIX PLATFORM v2.4.0</span></div></aside>`; }
function shell(user, section, body, admin=false) { const title = admin ? section : roleName(user.role); app.innerHTML = `<main class="app-shell">${admin ? adminSidebar(section) : roleSidebar(user, section)}<div class="shell-main"><header class="topbar"><button class="btn btn-ghost btn-sm mobile-menu" id="mobile-menu">☰</button><div class="crumb">${title}<span class="muted"> ${admin?' / '+section:''}</span></div>${admin?`<label class="search"><span>⌕</span><input placeholder="Search Order ID or AWB Number…"></label>`:'<div style="flex:1"></div>'}<div class="top-actions">${admin?'<button class="btn btn-ghost btn-sm" id="rate-calc">Rate Calculator</button><span class="bell">♧</span>':''}<div class="profile-mini"><div class="avatar" style="background:#e0e7ff;color:#4338ca">${user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>${esc(user.name)}</b><span>${roleName(user.role)}</span></div></div><button class="btn btn-ghost btn-sm" data-logout>↗</button></div></header><section class="content ${admin?'admin-content':''}">${body}</section></div></main>`; $$('[data-section]').forEach(b=>b.onclick=()=>renderAdmin(b.dataset.section)); $('[data-logout]').onclick=logout; const menu=$('#mobile-menu'); if(menu)menu.onclick=()=>$('#sidebar').classList.toggle('open'); const rate=$('#rate-calc'); if(rate)rate.onclick=()=>toast('Rate Calculator is ready for your next shipment.'); bindGlobal(); }
const $$ = (s,e=document) => [...e.querySelectorAll(s)];
function roleSidebar(user, active) { const items = user.role==='InternalManager' ? [['Overview','chart'],['Inquiries','inbox'],['NDR Management','alert'],['Live Shipments','truck']] : user.role==='ClientAdmin' ? [['Dashboard','chart'],['Orders','package'],['Integrations','plug'],['Wallet & Billing','credit'],['Staff Management','users']] : [['Overview','chart'],...(user.permissions.includes('create_order')||user.permissions.includes('view_orders') ? [['Orders','package']]:[]),...(user.permissions.includes('view_wallet') ? [['Wallet','credit']]:[])]; return `<aside class="side" id="sidebar"><div class="side-head"><div class="logo"><span class="logo-mark">▣</span>Shiptix</div><span class="role-pill">${user.role==='ClientAdmin'?'CLIENT':user.role==='ClientStaff'?'STAFF':'MANAGER'}</span></div><nav class="side-nav"><div class="nav-group-label">WORKSPACE</div>${items.map(([x,i])=>`<button class="side-item ${active===x?'active':''}" data-role-section="${x}"><span>${icon(i)}</span>${x}${x==='Integrations'&&db.shopify?'<span style="margin-left:auto;color:#16a34a">✓</span>':''}</button>`).join('')}</nav><div class="side-foot"><div class="profile-mini"><div class="avatar">${user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>${esc(user.name)}</b><span>${esc(user.email)}</span></div></div></div></aside>`; }
function bindGlobal(){ $$('[data-nav]').forEach(e=>e.onclick=()=>nav(e.dataset.nav)); $$('[data-role-section]').forEach(e=>e.onclick=()=>renderRole(e.dataset.roleSection)); }

function metric(label,num,iconChar,color,note='') { return `<article class="card metric"><div class="metric-top"><p>${label}</p><div class="metric-icon" style="background:${color}22;color:${color}">${iconChar}</div></div><h3>${num}</h3>${note?`<div class="mini-note">${note}</div>`:''}</article>`; }
function miniChart(){ return `<div class="line-chart">${[28,44,35,59,42,72,62,85,54,78,65,91,69,88,76,95,83,63,72,82,91,68,79,84,67,93,79,86,72,98].map(x=>`<span style="height:${x}%"></span>`).join('')}</div>`; }
function adminDashboard() { const date = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); return `<div class="page-title-row"><div><div class="eyebrow" style="color:#6366f1">${date}</div><h1>Good morning, Platform Admin 👋</h1><p>Here’s what’s moving across Shiptix today.</p></div><button class="btn btn-indigo" id="add-client">＋ Add New Client</button></div><div class="metric-grid">${metric('New Orders','175','▣','#6366f1')}${metric('Pickup Pending','548','▱','#f59e0b','32 breached SLA')}${metric('In Transit','967','⌖','#06b6d4')}${metric('Delivered','222','✓','#10b981','84.3% success rate')}${metric('RTO Orders','1,314','↗','#ef4444','↑ 4% this week')}</div><div class="wallet-grid"><article class="card wallet-card"><small>Wallet — Yesterday</small><b>₹30,200.00</b></article><article class="card wallet-card"><small>Wallet — This Month</small><b>₹3,87,600.00</b></article><article class="card wallet-card"><small>Wallet — Last Month</small><b>₹5,31,257.08</b></article></div><div class="charts-grid"><article class="card"><h3 class="card-title">Customer Registrations <span class="muted" style="font-weight:400;font-size:11px">· last 30 days</span></h3>${miniChart()}</article><article class="card"><h3 class="card-title">Carrier-wise Shipments</h3><div class="donut-wrap"><div class="donut"></div></div><div class="legend"><span><i style="background:#6366f1"></i>BlueDart 44%</span><span><i style="background:#22d3ee"></i>Delhivery 35%</span><span><i style="background:#f59e0b"></i>Xpressbees 21%</span></div></article></div><div class="table-grid"><article class="card"><h3 class="card-title">Recent Registered Customers</h3><div class="table-scroll"><table><thead><tr><th>Brand</th><th>Phone</th><th>Email</th><th>Status</th><th></th></tr></thead><tbody>${db.customers.map(c=>`<tr><td><b>${c.brand}</b></td><td>${c.phone}</td><td>${c.email}</td><td>${statusBadge(c.status)}</td><td>${c.status==='Pending'?`<button class="btn btn-sm" style="background:#ecfdf5;color:#047857" data-approve="${c.id}">Approve</button>`:''}</td></tr>`).join('')}</tbody></table></div></article><article class="card"><h3 class="card-title">Support Tickets & Exceptions</h3><div class="table-scroll"><table><thead><tr><th>Ticket ID</th><th>Customer</th><th>Status</th><th>Priority</th></tr></thead><tbody>${[['TKT-0041','FreshKart','Open','High'],['TKT-0042','ZapStyle','In Progress','Medium'],['TKT-0043','BrewBazaar','Resolved','Low'],['TKT-0044','GlowBox','Open','High'],['TKT-0045','NestNook','Open','Medium']].map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${statusBadge(r[2])}</td><td>${statusBadge(r[3])}</td></tr>`).join('')}</tbody></table></div></article></div><article class="card"><h3 class="card-title">Courier Health Quick View</h3><div class="courier-grid">${[['BlueDart','Operational','142ms','ok'],['Delhivery','Operational','198ms','ok'],['Xpressbees','Degraded','311ms','degraded'],['Ekart','Offline','—','offline'],['DTDC','Operational','224ms','ok']].map(x=>`<div class="card courier"><b>${x[0]}</b><span class="${x[3]}">● ${x[1]} · ${x[2]}</span></div>`).join('')}</div></article>`; }
function customersPage() { return `<div class="page-title-row"><div><h1>Customer Hub</h1><p>Manage brand partners and onboarding status.</p></div><button class="btn btn-indigo" id="add-client">＋ Add Client</button></div><div class="manager-grid"><article class="card kpi"><p>Total Customers</p><span class="num">${db.customers.length}</span></article><article class="card kpi"><p>Active Customers</p><span class="num">${db.customers.filter(c=>c.status==='Active').length}</span></article><article class="card kpi"><p>Pending Approval</p><span class="num">${db.customers.filter(c=>c.status==='Pending').length}</span></article></div><article class="card"><h3 class="card-title">All Customers</h3><div class="table-scroll"><table><thead><tr><th>Brand</th><th>Phone</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>${db.customers.map(c=>`<tr><td><b>${c.brand}</b></td><td>${c.phone}</td><td>${c.email}</td><td>${c.joined}</td><td>${statusBadge(c.status)}</td><td>${c.status==='Pending'?`<button class="btn btn-sm" style="background:#ecfdf5;color:#047857" data-approve="${c.id}">Approve</button>`:''}<button class="btn btn-ghost btn-sm" style="margin-left:5px" data-toggle-client="${c.id}">${c.status==='Blocked'?'Activate':'Block'}</button></td></tr>`).join('')}</tbody></table></div></article>`; }
function carrierPage(){return `<div class="page-title-row"><div><h1>Carrier Master</h1><p>Network visibility and carrier configuration.</p></div><button class="btn btn-indigo">＋ Add Carrier</button></div><div class="manager-grid"><article class="card kpi"><p>Operational</p><span class="num" style="color:#059669">3</span></article><article class="card kpi"><p>Degraded</p><span class="num" style="color:#d97706">1</span></article><article class="card kpi"><p>Offline</p><span class="num" style="color:#dc2626">1</span></article></div><article class="card"><h3 class="card-title">Courier Network</h3><table><thead><tr><th>Carrier</th><th>Status</th><th>API Latency</th><th>Coverage</th><th>Last checked</th></tr></thead><tbody>${[['BlueDart','Operational','142ms','19,000 pin codes','Just now'],['Delhivery','Operational','198ms','18,450 pin codes','Just now'],['Xpressbees','Degraded','311ms','17,980 pin codes','2 min ago'],['Ekart','Offline','—','15,240 pin codes','6 min ago'],['DTDC','Operational','224ms','18,870 pin codes','Just now']].map(x=>`<tr><td><b>${x[0]}</b></td><td>${statusBadge(x[1])}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td></tr>`).join('')}</tbody></table></article>`;}
function renderAdmin(section='Dashboard'){const u=currentUser(); if(!u||u.role!=='SuperAdmin')return guard(); let body=section==='Dashboard'?adminDashboard():section==='Customer Details'||section==='Pending Customers'?customersPage():section==='Carrier Master'?carrierPage():`<div class="card placeholder"><div><div class="big">⚙</div><h2>${section}</h2><p>This operational module is being prepared for your team.</p></div></div>`; shell(u,section,body,true); bindAdminActions();}
function bindAdminActions(){ $$('[data-approve]').forEach(b=>b.onclick=()=>{const c=db.customers.find(x=>x.id==b.dataset.approve);c.status='Active';persist();toast(`${c.brand} is now active.`);renderAdmin('Dashboard')}); $$('[data-toggle-client]').forEach(b=>b.onclick=()=>{const c=db.customers.find(x=>x.id==b.dataset.toggleClient);c.status=c.status==='Blocked'?'Active':'Blocked';persist();toast(`${c.brand} ${c.status==='Blocked'?'blocked':'activated'}.`);renderAdmin('Customer Details')}); const add=$('#add-client');if(add)add.onclick=showClientModal;}
function showClientModal(){modal('Add Client',`<div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Brand</label><input name="brand" required></div><div class="field"><label>Email</label><input type="email" name="email" required></div><div class="field"><label>Phone</label><input name="phone" required></div></div>`,form=>{const f=new FormData(form);db.customers.push({id:Date.now(),name:f.get('name'),brand:f.get('brand'),email:f.get('email'),phone:f.get('phone'),joined:shortDate(now()),status:'Pending'});persist();toast('Client added as pending.');renderAdmin('Customer Details')});}

function orderRows(user, status='All', search=''){let data=db.orders.filter(o=>user.role==='SuperAdmin'||user.role==='InternalManager'||o.clientId==walletUserId(user));if(status!=='All')data=data.filter(o=>o.status===status); if(search)data=data.filter(o=>(o.orderId+o.awbNumber).toLowerCase().includes(search.toLowerCase()));return data.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
function ordersTable(user, status='All'){const orders=orderRows(user,status);return `<div class="table-scroll"><table><thead><tr><th>Order ID</th><th>AWB</th><th>Status</th><th>Weight</th><th>Created</th><th>Cost</th></tr></thead><tbody>${orders.map(o=>`<tr><td><b>${o.orderId}</b></td><td><code>${o.awbNumber}</code></td><td>${statusBadge(o.status)}</td><td>${o.weight} kg</td><td>${shortDate(o.createdAt)}</td><td>${formatINR(o.shippingCost)}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">No shipments match this filter.</td></tr>'}</tbody></table></div>`;}
function managerOverview(){ const u=currentUser();return `<div class="page-title-row"><div><div class="eyebrow" style="color:#6366f1">OPERATIONS DESK</div><h1>Good morning, Amit</h1><p>Your live view of customer demand and delivery exceptions.</p></div></div><div class="manager-grid">${metric('New Inquiries','12','▤','#6366f1')}${metric('Pending NDR','24','⚠','#f59e0b')}${metric('RTO Count','18','↗','#ef4444')}</div><div class="workspace"><article class="card"><h3 class="card-title">Recent Orders</h3>${ordersTable(u)}</article><article class="card"><h3 class="card-title">Keep operations moving</h3><p class="muted" style="font-size:13px;line-height:1.6">Review inbound leads before the afternoon and action delivery exceptions awaiting a decision.</p><div class="section-tabs"><button class="tab" data-manager="Inquiries">View inquiries</button><button class="tab" data-manager="NDR Management">Manage NDRs</button></div></article></div>`;}
const leads=[['Kiran Patel','Orbit Snacks','500–2,000','29 Jul 2026','New'],['Meera Joshi','LoomCraft','100–500','28 Jul 2026','New'],['Rohit Das','VelvetBrew','500–2,000','28 Jul 2026','In Review'],['Anjali Nair','FitMesh','2,000–10,000','27 Jul 2026','Converted'],['Suresh Kumar','WoodCraft India','Under 100','26 Jul 2026','Closed']];
function managerLeads(){return `<div class="page-title-row"><div><h1>Inbound Leads</h1><p>Evaluate brands that want to scale their shipping.</p></div></div><article class="card"><div class="search" style="max-width:none;margin:0 0 20px"><span>⌕</span><input id="lead-search" placeholder="Search brand, name or email"></div><div id="leads-table">${leadTable(leads)}</div></article>`;}
function leadTable(data){return `<div class="table-scroll"><table><thead><tr><th>Name</th><th>Brand</th><th>Volume</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead><tbody>${data.map((x,i)=>`<tr><td><b>${x[0]}</b><br><small class="muted">${x[0].toLowerCase().replace(' ','@')}.in</small></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${statusBadge(x[4])}</td><td>${x[4]==='New'?`<button class="btn btn-sm btn-ghost" data-lead="${i}" data-lead-action="contact">Mark contacted</button>`:''}${!['Converted','Closed'].includes(x[4])?`<button class="btn btn-sm" style="margin-left:5px;background:#ecfdf5;color:#047857" data-lead="${i}" data-lead-action="convert">Convert</button>`:''}</td></tr>`).join('')}</tbody></table></div>`;}
function managerNdr(){return `<div class="page-title-row"><div><h1>NDR Management</h1><p>Resolve non-delivery reports before they become returns.</p></div></div><div class="manager-grid">${metric('Pending NDR','24','⚠','#f59e0b')}${metric('RTO Initiated','8','↗','#ef4444')}${metric('Retrying','16','↻','#6366f1')}</div><article class="card"><table><thead><tr><th>AWB</th><th>Brand</th><th>Reason</th><th>Attempts</th><th>Last Attempt</th><th>Action</th></tr></thead><tbody>${[['BD7812345602','FreshKart','Customer Unavailable','1','Today, 09:30'],['BD7812345609','FreshKart','Wrong Address','2','Yesterday'],['BD7812345610','ZapStyle','Refused Delivery','1','Today, 10:20'],['BD7812345612','ZapStyle','Door Locked','2','Yesterday']].map((r,i)=>`<tr><td><code>${r[0]}</code></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><select class="ndr-select" data-ndr="${i}"><option>Choose action</option><option>Retry Delivery</option><option>Initiate RTO</option></select></td></tr>`).join('')}</tbody></table></article>`;}
function managerShipments(){const u=currentUser();return `<div class="page-title-row"><div><h1>Live Shipments</h1><p>Monitor all active shipments across brands.</p></div></div><div class="section-tabs">${['All','InTransit','Delivered','RTO'].map((x,i)=>`<button class="tab ${i===0?'active':''}" data-order-filter="${x}">${x==='All'?'All shipments':x}</button>`).join('')}</div><article class="card" id="shipments-table">${ordersTable(u)}</article>`;}
function renderManager(section='Overview'){const u=currentUser();if(!u||u.role!=='InternalManager')return guard();shell(u,section,section==='Overview'?managerOverview():section==='Inquiries'?managerLeads():section==='NDR Management'?managerNdr():managerShipments());$$('[data-manager]').forEach(b=>b.onclick=()=>renderManager(b.dataset.manager)); const input=$('#lead-search');if(input)input.oninput=()=>$('#leads-table').innerHTML=leadTable(leads.filter(x=>x.join(' ').toLowerCase().includes(input.value.toLowerCase()))); $$('[data-lead-action]').forEach(b=>b.onclick=()=>{leads[b.dataset.lead][4]=b.dataset.leadAction==='contact'?'Contacted':'Converted';toast('Lead updated.');renderManager('Inquiries')});$$('.ndr-select').forEach(s=>s.onchange=()=>s.value!=='Choose action'&&toast(`${s.value} request logged.`));$$('[data-order-filter]').forEach(b=>b.onclick=()=>{$$('[data-order-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#shipments-table').innerHTML=ordersTable(u,b.dataset.orderFilter)});}

function clientDashboard(u){const mine=orderRows(u),delivered=mine.filter(o=>o.status==='Delivered').length;return `<div class="page-title-row"><div><div class="eyebrow">${u.brand.toUpperCase()} OPERATIONS</div><h1>Good morning, ${u.name.split(' ')[0]}</h1><p>Keep your fulfilment operation on track.</p></div></div><div class="dashboard-grid">${metric('Wallet Balance',formatINR(balanceOf(u)),'◫','#6366f1','Add Funds →')}${metric('Total Orders',mine.length,'▣','#06b6d4','↑ 12% this month')}${metric('Delivery Rate',mine.length?`${Math.round(delivered/mine.length*100)}%`:'—','✓','#10b981')}${metric('Active Staff',db.users.filter(x=>x.clientId===u.id).length,'♙','#f59e0b')}</div><div class="workspace"><article class="card"><h3 class="card-title">Monthly Shipping Volume</h3>${miniChart()}</article><article class="card"><h3 class="card-title">Recent Shipments</h3>${ordersTable(u)}</article></div>`;}
function clientOrders(u){return `<div class="page-title-row"><div><h1>Orders</h1><p>Manage labels, pickup and shipment visibility.</p></div><button class="btn btn-primary" id="new-shipment">＋ New Shipment</button></div><article class="card">${ordersTable(u)}</article>`;}
function clientIntegrations(){const connected=!!db.shopify;return `<div class="page-title-row"><div><h1>Integrations</h1><p>Connect the systems your brand relies on.</p></div></div><article class="card integration"><div class="integration-head"><div class="shopify-mark">♟</div><div><h3>Shopify</h3><p>Sync orders, tracking and fulfilment updates.</p></div><span style="margin-left:auto">${statusBadge(connected?'Active':'Not connected')}</span></div>${connected?`<div class="success-box">✓ Shopify Successfully Connected</div><p class="muted" style="font-size:13px">Connected store</p><a style="font-size:13px;color:#4f46e5" href="#">${db.shopify.shopUrl}</a><p class="muted" style="font-size:12px">Installed ${shortDate(db.shopify.installedAt)}</p><ul class="check-list"><li>Automatic order import</li><li>Live tracking sync</li><li>Fulfilment webhooks</li></ul><div class="section-tabs"><button class="btn btn-ghost btn-sm">Open Shopify Admin ↗</button><button class="btn btn-danger btn-sm" id="disconnect-shopify">Disconnect</button></div>`:`<ul class="check-list"><li>Automatically import new orders</li><li>Keep tracking details in sync</li><li>Send fulfilment webhooks</li></ul><div class="field"><label>Store URL</label><input id="shop-url" placeholder="yourstore.myshopify.com"></div><button id="connect-shopify" class="btn btn-green" style="margin-top:15px">Connect Shopify</button><div class="success-box" style="background:#eff6ff;color:#1d4ed8;font-weight:500">You will be redirected to Shopify to approve this connection.</div>`}</article><div class="coming-grid"><div class="coming"><b>WooCommerce</b><br>Coming soon</div><div class="coming"><b>Magento</b><br>Coming soon</div><div class="coming"><b>Amazon Seller Central</b><br>Coming soon</div></div>`;}
function clientWallet(u,staff=false){const tx=db.transactions.filter(t=>t.userId===walletUserId(u)).slice().reverse();return `<div class="page-title-row"><div><h1>${staff?'Wallet':'Wallet & Billing'}</h1><p>${staff?'Your team wallet balance.':'Fund your wallet and review each transaction.'}</p></div></div><article class="card wallet-balance"><small>AVAILABLE BALANCE</small><b id="balance-text">${formatINR(balanceOf(u))}</b>${staff?'':`<button class="btn btn-ghost btn-sm" id="toggle-balance" style="color:white;border-color:#ffffff55">◉ Hide balance</button>`}</article>${staff?'':`<article class="card" style="margin-top:16px"><h3 class="card-title">Add funds</h3><div class="recharge-grid"><button class="btn btn-sm" data-recharge="1000">₹1,000</button><button class="btn btn-sm" data-recharge="5000">₹5,000</button><button class="btn btn-sm" data-recharge="10000">₹10,000</button><input id="custom-recharge" type="number" min="1" placeholder="Custom amount" style="border:1px solid #e2e8f0;border-radius:8px;padding:0 10px;width:140px"><button class="btn btn-indigo btn-sm" id="custom-add">Add</button></div></article>`}<article class="card" style="margin-top:16px"><h3 class="card-title">Transaction history</h3><div class="table-scroll"><table><thead><tr><th>Txn ID</th><th>Description</th><th>Date</th><th>Amount</th></tr></thead><tbody>${tx.map((t,i)=>`<tr><td><b>TXN-${String(t.id||i+1).padStart(3,'0')}</b></td><td>${t.description}</td><td>${shortDate(t.createdAt)}</td><td style="color:${t.type==='Credit'?'#15803d':'#dc2626'};font-weight:700">${t.type==='Credit'?'+':'-'}${formatINR(t.amount)}</td></tr>`).join('')}</tbody></table></div></article>`;}
function clientStaff(u){const list=db.users.filter(x=>x.clientId===u.id);return `<div class="page-title-row"><div><h1>Staff Management</h1><p>Set up access for your operations team.</p></div></div><article class="card"><h3 class="card-title">Add Staff Member</h3><form id="staff-form" class="shipment-form"><div class="field"><label>Full Name</label><input name="name" required></div><div class="field"><label>Work Email</label><input type="email" name="email" required></div><div class="field"><label>Temporary Password</label><input name="password" required placeholder="Minimum 8 characters"></div><div class="field" style="grid-column:1/-1"><label>Permissions</label><div class="section-tabs">${[['create_order','Create Orders'],['view_orders','View Orders'],['view_wallet','View Wallet'],['print_labels','Print Labels']].map(x=>`<label class="tab"><input name="permission" type="checkbox" value="${x[0]}" checked> ${x[1]}</label>`).join('')}</div></div><button class="btn btn-primary" type="submit">Add staff member</button></form></article><article class="card" style="margin-top:16px"><h3 class="card-title">Current Staff</h3><table><thead><tr><th>Name</th><th>Email</th><th>Permissions</th><th>Status</th></tr></thead><tbody>${list.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.email}</td><td>${x.permissions.join(', ').replaceAll('_',' ')}</td><td>${statusBadge('Active')}</td></tr>`).join('')||'<tr><td colspan="4">No staff members yet.</td></tr>'}</tbody></table></article>`;}
function shipmentForm(u){return `<div class="page-title-row"><div><h1>New Shipment</h1><p>Create a Blue Dart label and schedule pickup.</p></div></div><article class="card"><form id="shipment-form" class="shipment-form"><div class="field"><label>Order reference</label><input name="orderId" placeholder="e.g. FK-1006" required></div><div class="field"><label>Package weight (kg)</label><input name="weight" type="number" step="0.1" min="0.1" placeholder="1.2" required></div><div class="field"><label>Pickup status</label><select name="status"><option>Booked</option><option>PickupScheduled</option></select></div><button class="btn btn-primary" type="submit">Generate label & book</button></form><p class="muted" style="font-size:12px;margin:16px 0 0">Pricing: ₹45 up to 500g · ₹65 up to 1kg · ₹95 up to 2kg · ₹130 up to 5kg</p></article>`;}
function staffOverview(u){const m=orderRows(u);return `<div class="page-title-row"><div><div class="eyebrow">${u.brand.toUpperCase()}</div><h1>Hello, ${u.name.split(' ')[0]}</h1><p>Your shipment work for today.</p></div></div><div class="manager-grid">${metric('Orders today',m.filter(x=>shortDate(x.createdAt)===shortDate(now())).length,'▣','#6366f1')}${metric('Pending pickups',m.filter(x=>['Booked','PickupScheduled'].includes(x.status)).length,'▱','#f59e0b')}${metric('Delivered this week',m.filter(x=>x.status==='Delivered').length,'✓','#10b981')}</div><article class="card"><h3 class="card-title">Latest shipments</h3>${ordersTable(u)}</article>`;}
function calcCost(w){return w<=.5?45:w<=1?65:w<=2?95:w<=5?130:w<=10?165:200;}
function handleShipment(e,u){e.preventDefault();const f=new FormData(e.target),w=Number(f.get('weight')),cost=calcCost(w),owner=walletUserId(u);if(balanceOf(u)<cost)return toast('Insufficient wallet balance.', 'error');const order={id:Date.now(),orderId:'SX'+String(Math.floor(1000+Math.random()*8999)),clientId:owner,userId:u.id,awbNumber:'BD'+String(Math.floor(1000000000+Math.random()*8999999999)),status:f.get('status'),weight:w,shippingCost:cost,createdAt:now()};db.orders.push(order);db.transactions.push({id:Date.now()+1,userId:owner,type:'Debit',amount:cost,description:`Shipment ${order.orderId}`,createdAt:now(),balance:balanceOf(u)-cost});persist();toast(`Label generated — ${order.awbNumber}. Wallet debited ${formatINR(cost)}.`);renderRole('Orders');}
function recharge(u,amount){amount=Number(amount);if(!amount||amount<=0)return toast('Enter a valid recharge amount.','error');const own=walletUserId(u);db.transactions.push({id:Date.now(),userId:own,type:'Credit',amount,description:'Wallet recharge',createdAt:now(),balance:balanceOf(u)+amount});persist();toast(`${formatINR(amount)} added to your wallet.`);renderRole('Wallet & Billing');}
function renderRole(section){const u=currentUser();if(!u)return guard(); if(u.role==='InternalManager')return renderManager(section); if(u.role==='ClientAdmin'){let body=section==='Dashboard'?clientDashboard(u):section==='Orders'?clientOrders(u):section==='Integrations'?clientIntegrations():section==='Wallet & Billing'?clientWallet(u):clientStaff(u);shell(u,section,body);bindClient(u,section);return;}if(u.role==='ClientStaff'){let body=section==='Overview'?staffOverview(u):section==='Orders'?shipmentForm(u):section==='Wallet'?clientWallet(u,true):'';shell(u,section,body);if(section==='Orders')$('#shipment-form').onsubmit=e=>handleShipment(e,u);return;}renderAdmin('Dashboard');}
function bindClient(u,section){if(section==='Orders')$('#new-shipment').onclick=()=>{shell(u,'Orders',shipmentForm(u));$('#shipment-form').onsubmit=e=>handleShipment(e,u);};if(section==='Integrations'){const connect=$('#connect-shopify');if(connect)connect.onclick=()=>{const url=$('#shop-url').value.trim()||'freshkart.myshopify.com';db.shopify={shopUrl:url.includes('.')?url:`${url}.myshopify.com`,installedAt:now()};persist();toast('Shopify Successfully Connected');renderRole('Integrations')};const disc=$('#disconnect-shopify');if(disc)disc.onclick=()=>{db.shopify=null;persist();toast('Shopify disconnected.');renderRole('Integrations')};}if(section==='Wallet & Billing'){$$('[data-recharge]').forEach(b=>b.onclick=()=>recharge(u,b.dataset.recharge));$('#custom-add').onclick=()=>recharge(u,$('#custom-recharge').value);let shown=true;$('#toggle-balance').onclick=()=>{shown=!shown;$('#balance-text').textContent=shown?formatINR(balanceOf(u)):'•••••••';$('#toggle-balance').textContent=shown?'◉ Hide balance':'◉ Show balance'};}if(section==='Staff Management')$('#staff-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);if(db.users.some(x=>x.email===f.get('email')))return toast('That email already exists.','error');db.users.push({id:Date.now(),name:f.get('name'),email:f.get('email'),password:f.get('password'),role:'ClientStaff',clientId:u.id,brand:u.brand,permissions:f.getAll('permission')});persist();toast('Staff member added.');renderRole('Staff Management')};}
function modal(title,content,onSave){const el=document.createElement('div');el.className='modal-overlay';el.innerHTML=`<form class="modal"><h2>${title}</h2>${content}<div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-indigo" type="submit">Save client</button></div></form>`;document.body.append(el);$('[data-close]',el).onclick=()=>el.remove();$('form',el).onsubmit=e=>{e.preventDefault();onSave(e.target);el.remove()};}
function guard(){if(!currentUser())return nav('/login');nav(routes[currentUser().role]);}
function router(){const r=location.hash.slice(1)||'/';const u=currentUser();if(r==='/'||r==='/login'){if(r==='/login')renderLogin();else renderLanding();return;}if(!u)return nav('/login');if(r!==routes[u.role])return nav(routes[u.role]);if(r==='/admin')renderAdmin();else if(r==='/manager')renderManager();else renderRole(u.role==='ClientAdmin'?'Dashboard':'Overview');}
window.addEventListener('hashchange',router);router();
