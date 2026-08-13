const PHONE_WA = "27632139447";
  const MENU = [
    { id:"burger_classic", cat:"Burgers", name:"Classic Burger", price:40, img:"../images/burger_classic.jpg",
      desc:"Seasoned beef patty, melted cheese, fresh lettuce, tomato, pickles & onion on a toasted bun with our house sauce." },
    { id:"burger_double", cat:"Burgers", name:"Double Cheeseburger", price:50, img:"../images/burger_double.jpg",
      desc:"Two flame-grilled patties stacked with double cheese, tomato and lettuce. For a serious hunger." },
    { id:"wings", cat:"Wings", name:"Crispy Chicken Wings", price:35, img:"../images/wings.jpg",
      desc:"Golden, crunchy fried wings seasoned just right, with a fresh wedge of lime." },
    { id:"combo_burger", cat:"Combos", name:"Burger & Chips Combo", price:50, img:"../images/combo_burger.jpg",
      desc:"A juicy cheeseburger with a generous side of hot, golden chips." },
    { id:"combo_double", cat:"Combos", name:"Double Burger & Chips Combo", price:60, img:"../images/combo_double.jpg",
      desc:"Double-patty cheeseburger loaded up, with a full side of crispy chips." },
    { id:"combo_strips", cat:"Combos", name:"Chicken Strips & Chips Combo", price:50, img:"../images/combo_strips.jpg",
      desc:"Crunchy fried chicken strips, golden chips and dipping sauces." },
    { id:"combo_feast", cat:"Combos", name:"Wings, Burger & Chips Combo", price:80, img:"../images/combo_feast.jpg",
      desc:"The full feast — fried wings, a loaded burger, chips." }
  ];

  const state = {};            // id -> qty
  let orderType = "Collection";
  let currentCat = "all";
  const form = { name:"", phone:"", addr:"", notes:"" };  // preserved across re-renders

  const $ = s => document.querySelector(s);
  const rand = MENU.reduce((a,m)=>(a[m.id]=m,a),{});
  const rands = ["Let's eat","Nice choice","On it","Grab more?"];

  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ----- animation helpers ----- */
  const ANIM = document.documentElement.classList.contains("anim");
  let shownTotal = 0, flashId = null;

  const revObserver = ANIM ? new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); revObserver.unobserve(e.target); } });
  }, {threshold:.14, rootMargin:"0px 0px -6% 0px"}) : null;
  function observeReveals(){ if(ANIM) document.querySelectorAll(".reveal:not(.in)").forEach(el=>revObserver.observe(el)); }

  function rollNumber(el, from, to){
    const dur=450, t0=performance.now();
    (function frame(now){
      const p=Math.min(1,(now-t0)/dur);
      const v=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));
      el.textContent="R"+v;
      if(p<1) requestAnimationFrame(frame);
    })(performance.now());
  }
  function pulse(el, cls){ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function cartPop(){ pulse(document.getElementById("openCart"),"pop"); }
  function spawnFly(fromEl, imgUrl){
    if(!ANIM || !fromEl) return;
    const cart = document.getElementById("openCart").getBoundingClientRect();
    const r = fromEl.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className="fly";
    fly.style.backgroundImage=`url("${imgUrl}")`;
    fly.style.left=(r.left+r.width/2-26)+"px";
    fly.style.top=(r.top+r.height/2-26)+"px";
    document.body.appendChild(fly);
    const dx=(cart.left+cart.width/2)-(r.left+r.width/2);
    const dy=(cart.top+cart.height/2)-(r.top+r.height/2);
    const a=fly.animate([
      {transform:"translate(0,0) scale(1)",opacity:1,offset:0},
      {transform:`translate(${dx*.5}px,${dy*.5-70}px) scale(.78)`,opacity:1,offset:.6},
      {transform:`translate(${dx}px,${dy}px) scale(.18)`,opacity:.35,offset:1}
    ],{duration:680,easing:"cubic-bezier(.5,-0.2,.35,1)"});
    a.onfinish=()=>{ fly.remove(); cartPop(); };
  }

  /* ----- render menu ----- */
  function renderGrid(){
    const grid = $("#grid");
    grid.innerHTML = "";
    MENU.filter(m => currentCat==="all" || m.cat===currentCat).forEach((m,idx)=>{
      const q = state[m.id]||0;
      const el = document.createElement("article");
      el.className = "item reveal";
      el.style.setProperty("--d", (idx*70)+"ms");
      el.innerHTML = `
        <div class="ph"><img loading="lazy" src="${m.img}" alt="${m.name}"></div>
        <div class="body">
          <span class="tag">${m.cat}</span>
          <h3>${m.name}</h3>
          <p>${m.desc}</p>
          <div class="foot">
            <div class="price"><small>R</small>${m.price}</div>
            <button class="add" data-add="${m.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
            <div class="stepper ${q>0?'on':''}" data-step="${m.id}">
              <button data-dec="${m.id}" aria-label="Remove one ${m.name}">−</button>
              <span class="q">${q}</span>
              <button data-inc="${m.id}" aria-label="Add one ${m.name}">+</button>
            </div>
          </div>
        </div>`;
      grid.appendChild(el);
    });
    observeReveals();
  }

  /* ----- cart maths ----- */
  const count = () => Object.values(state).reduce((a,b)=>a+b,0);
  const total = () => Object.entries(state).reduce((a,[id,q])=>a+rand[id].price*q,0);

  function syncHeader(){
    const c = count(), t = total();
    $("#hdrCount").textContent = c;
    pulse($("#hdrCount"), "bump");
    if(ANIM) rollNumber($("#hdrTotal"), shownTotal, t);
    else $("#hdrTotal").textContent = "R"+t;
    shownTotal = t;
  }

  function bump(id, d){
    const n = (state[id]||0)+d;
    if(n<=0) delete state[id]; else state[id]=n;
    // update just this card's stepper if present
    const st = document.querySelector(`[data-step="${id}"]`);
    if(st){
      const q = state[id]||0;
      st.classList.toggle("on", q>0);
      const qel = st.querySelector(".q");
      qel.textContent = q;
      if(ANIM) pulse(qel, "tick");
    }
    syncHeader();
    renderCart();
  }

  /* ----- render cart ----- */
  function renderCart(){
    const body = $("#cartBody");
    const foot = $("#cartFoot");
    const ids = Object.keys(state);
    $("#cartTag").textContent = ids.length ? rands[Math.min(ids.length-1,3)] : "";

    if(!ids.length){
      foot.style.display = "none";
      body.innerHTML = `<div class="empty">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <b>Your order is empty</b>
        <span>Add something tasty from the menu to get started.</span>
      </div>`;
      return;
    }

    let html = "";
    ids.forEach(id=>{
      const m = rand[id], q = state[id];
      html += `<div class="line" data-id="${id}">
        <img src="${m.img}" alt="">
        <div class="info">
          <b>${m.name}</b>
          <span class="u">R${m.price} each</span>
        </div>
        <div class="r">
          <span class="lt">R${m.price*q}</span>
          <div class="ministep">
            <button data-dec="${id}" aria-label="Remove one">−</button>
            <span class="q">${q}</span>
            <button data-inc="${id}" aria-label="Add one">+</button>
          </div>
        </div>
      </div>`;
    });

    const esc = s => (s||"").replace(/"/g,"&quot;");
    const delShow = orderType==='Delivery';

    html += `<div class="order-form">
      <div class="seg" id="seg">
        <button class="${orderType==='Collection'?'active':''}" data-type="Collection">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h12"/></svg>
          Collection
        </button>
        <button class="${orderType==='Delivery'?'active':''}" data-type="Delivery">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>
          Delivery
        </button>
      </div>
      <label class="fl" id="fName"><span>Your name</span><input id="iName" type="text" value="${esc(form.name)}" placeholder="e.g. Thabo M." autocomplete="name"><span class="msg">Please add your name.</span></label>
      <label class="fl" id="fPhone"><span>Phone number</span><input id="iPhone" type="tel" value="${esc(form.phone)}" placeholder="e.g. 082 123 4567" autocomplete="tel"><span class="msg">Please add a contact number.</span></label>
      <label class="fl" id="fAddr" style="${delShow?'':'display:none'}"><span>Delivery address</span><input id="iAddr" type="text" value="${esc(form.addr)}" placeholder="Street, suburb, unit no." autocomplete="street-address"><span class="msg">Please add a delivery address.</span></label>
      <label class="fl"><span>Notes <span style="text-transform:none;font-weight:400">(optional)</span></span><textarea id="iNotes" placeholder="No onions, extra sauce, etc.">${esc(form.notes)}</textarea></label>
    </div>`;

    body.innerHTML = html;
    foot.style.display = "block";
    updateTotals();
    if(ANIM && flashId){
      const ln = body.querySelector(`.line[data-id="${flashId}"]`);
      if(ln) pulse(ln, "flash");
    }
    flashId = null;
  }

  /* ----- totals + delivery note (no form rebuild) ----- */
  function updateTotals(){
    const bdEl = $("#breakdown"); if(!bdEl) return;
    bdEl.innerHTML = (orderType==="Delivery")
      ? `<div class="brow note"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg><span>A delivery fee may apply — we'll confirm on WhatsApp.</span></div>`
      : "";
    $("#grandTotal").textContent = "R"+total();
    if(ANIM) pulse($("#grandTotal"), "gpop");
  }

  /* ----- build WhatsApp message ----- */
  function checkout(){
    const name = ($("#iName")?.value||"").trim();
    const phone = ($("#iPhone")?.value||"").trim();
    const addr = ($("#iAddr")?.value||"").trim();
    const notes = ($("#iNotes")?.value||"").trim();

    let ok = true;
    const flag = (sel,cond)=>{ const el=$(sel); if(!el) return; el.classList.toggle("err",cond); if(cond) ok=false; };
    flag("#fName", !name);
    flag("#fPhone", !phone);
    if(orderType==="Delivery"){ flag("#fAddr", !addr); }
    if(!ok){
      const firstErr = $(".fl.err input, .fl.err select");
      if(firstErr) firstErr.focus();
      return;
    }

    let msg = `Hi Uncle N Mdulu! I'd like to place an order:\n\n`;
    Object.entries(state).forEach(([id,q])=>{
      const m = rand[id];
      msg += `• ${q} x ${m.name} — R${m.price*q}\n`;
    });
    msg += `\nOrder type: ${orderType}`;
    msg += `\nTotal: R${total()}`;
    if(orderType==="Delivery") msg += ` (a delivery fee may apply)`;
    msg += `\nName: ${name}`;
    msg += `\nPhone: ${phone}`;
    if(orderType==="Delivery") msg += `\nAddress: ${addr}`;
    if(notes) msg += `\nNotes: ${notes}`;
    msg += `\n\nThank you!`;

    window.open(`https://wa.me/${PHONE_WA}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  /* ----- cart open/close ----- */
  function openCart(){ $("#cart").classList.add("open"); $("#scrim").classList.add("open"); $("#cart").setAttribute("aria-hidden","false"); }
  function closeCart(){ $("#cart").classList.remove("open"); $("#scrim").classList.remove("open"); $("#cart").setAttribute("aria-hidden","true"); }

  /* ----- toast ----- */
  let tT;
  function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("show"); clearTimeout(tT); tT=setTimeout(()=>el.classList.remove("show"),1400); }

  /* ----- events (delegated) ----- */
  document.addEventListener("click", e=>{
    const add = e.target.closest("[data-add]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const type = e.target.closest("[data-type]");
    if(add){
      const id = add.dataset.add;
      const img = add.closest(".item")?.querySelector(".ph img");
      flashId = id;
      bump(id,1);
      if(ANIM){ pulse(add,"added"); spawnFly(img, rand[id].img); }
      toast("Added — "+rand[id].name);
      return;
    }
    if(inc){ bump(inc.dataset.inc,1); return; }
    if(dec){ bump(dec.dataset.dec,-1); return; }
    if(type){ orderType = type.dataset.type; renderCart(); return; }
  });

  // keep typed values across re-renders
  document.addEventListener("input", e=>{
    const t = e.target;
    if(t.id==="iName") form.name = t.value;
    else if(t.id==="iPhone") form.phone = t.value;
    else if(t.id==="iAddr") form.addr = t.value;
    else if(t.id==="iNotes") form.notes = t.value;
    else return;
    t.closest(".fl")?.classList.remove("err");
  });

  $("#filters").addEventListener("click", e=>{
    const c = e.target.closest(".chip"); if(!c || c.classList.contains("active")) return;
    document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    c.classList.add("active");
    currentCat = c.dataset.cat;
    const grid = $("#grid");
    if(!ANIM){ renderGrid(); return; }
    grid.classList.add("swapping");
    setTimeout(()=>{ renderGrid(); grid.classList.remove("swapping"); }, 190);
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#scrim").addEventListener("click", closeCart);
  $("#sendBtn").addEventListener("click", checkout);
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeCart(); });

  /* ----- page-level motion init ----- */
  // hero entrance
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.querySelector(".hero")?.classList.add("loaded");
  }));

  // condensing sticky header
  const hdr = document.querySelector("header");
  addEventListener("scroll", ()=>{ hdr.classList.toggle("shrink", window.scrollY > 40); }, {passive:true});

  // ambient embers in the hero
  if(ANIM){
    const box = document.getElementById("embers");
    if(box){
      for(let i=0;i<14;i++){
        const e = document.createElement("span");
        e.className = "ember";
        e.style.left = (Math.random()*100)+"%";
        const dur = 6 + Math.random()*7;
        e.style.animationDuration = dur+"s";
        e.style.animationDelay = (-Math.random()*dur)+"s";
        const sz = 3 + Math.random()*5;
        e.style.width = e.style.height = sz+"px";
        e.style.setProperty("--drift", (Math.random()*80-40)+"px");
        box.appendChild(e);
      }
    }
  }

  renderGrid();
  renderCart();
  syncHeader();
  observeReveals();
