/* لیمر — منو + سبد خرید + ارسال سفارش به واتساپ (بدون وابستگی) */

const SITE = {
  /* شماره واتساپ لیمر — بدون + و بدون صفر اول */
  waNumber: "989000000000",
};

const MENU = {
  burger: [],
  pizza: [],
  sandwich: [],
  fried: [],
  drink: [],
};


const CART_KEY = "laymer_cart_v3";
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const fmt = (n) => Number(n).toLocaleString("fa-IR") + " تومان";
const faNum = (n) => Number(n).toLocaleString("fa-IR");
const keyOf = (cat, i) => cat + ":" + i;

function toEnDigits(s) {
  let out = "";
  for (const ch of String(s)) {
    let a = FA_DIGITS.indexOf(ch);
    if (a > -1) { out += a; continue; }
    a = AR_DIGITS.indexOf(ch);
    if (a > -1) { out += a; continue; }
    out += ch;
  }
  return out;
}

function findItem(key) {
  const parts = String(key).split(":");
  const list = MENU[parts[0]] || [];
  return list[Number(parts[1])] || null;
}

/* ---------- cart state ---------- */
let cart = {};
try {
  const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
  if (raw && typeof raw === "object") cart = raw;
} catch (e) { cart = {}; }

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
}

function cartLines() {
  return Object.keys(cart)
    .filter((k) => cart[k] > 0 && findItem(k))
    .map((k) => ({ k: k, q: cart[k], it: findItem(k) }));
}
const cartCount = () => cartLines().reduce((s, l) => s + l.q, 0);
const cartTotal = () => cartLines().reduce((s, l) => s + l.q * l.it.p, 0);

function addToCart(key, delta) {
  const next = (cart[key] || 0) + (delta === undefined ? 1 : delta);
  if (next <= 0) delete cart[key];
  else cart[key] = Math.min(next, 99);
  saveCart();
  updateCartUI();
  renderMenu(currentCat);
}

/* ---------- menu ---------- */
let currentCat = "burger";

function renderMenu(cat) {
  if (cat) currentCat = cat;
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  const items = MENU[currentCat] || [];
  if (!items.length) {
    grid.innerHTML = `<p class="menu-empty">این دسته هنوز خالیه — منو داره آماده میشه 🍔</p>`;
    return;
  }
  grid.innerHTML = items
    .map((it, i) => {
      const k = keyOf(currentCat, i);
      const q = cart[k] || 0;
      return `
      <article class="card" style="animation-delay:${i * 60}ms">
        <div class="card-emoji">${it.e}</div>
        <div class="card-body">
          <h3>${it.n}</h3>
          <p>${it.d}</p>
          <div class="card-foot">
            <span class="price">${fmt(it.p)}</span>
            <button class="add-btn${q ? " has" : ""}" type="button" data-add="${k}"
              aria-label="افزودن ${it.n} به سبد">${q ? "در سبد : " + faNum(q) : "افزودن +"}</button>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

/* ---------- cart UI ---------- */
function updateCartUI() {
  const lines = cartLines();
  const count = cartCount();
  const total = cartTotal();

  const badge = document.getElementById("cartCount");
  if (badge) { badge.textContent = faNum(count); badge.hidden = count === 0; }

  const bar = document.getElementById("cartBar");
  if (bar) bar.hidden = count === 0;
  document.body.classList.toggle("has-cart", count > 0);
  const barTotal = document.getElementById("barTotal");
  const barCount = document.getElementById("barCount");
  if (barTotal) barTotal.textContent = fmt(total);
  if (barCount) barCount.textContent = faNum(count) + " آیتم";

  const list = document.getElementById("cartList");
  const empty = document.getElementById("cartEmpty");
  const sum = document.getElementById("cartTotal");
  if (sum) sum.textContent = fmt(total);

  if (list) {
    list.innerHTML = lines.map((l) => `
      <li class="ci">
        <span class="ci-emoji">${l.it.e}</span>
        <div class="ci-body"><b>${l.it.n}</b><span>${fmt(l.it.p * l.q)}</span></div>
        <div class="stepper">
          <button type="button" data-dec="${l.k}" aria-label="کم کردن">−</button>
          <span>${faNum(l.q)}</span>
          <button type="button" data-inc="${l.k}" aria-label="افزودن">+</button>
        </div>
        <button class="ci-del" type="button" data-del="${l.k}" aria-label="حذف">✕</button>
      </li>`).join("");
  }
  if (empty) empty.hidden = lines.length > 0;

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.disabled = lines.length === 0;
  if (lines.length === 0) closeDrawer();
}

/* ---------- drawer ---------- */
const drawer = document.getElementById("drawer");
function openDrawer() {
  if (!drawer) return;
  drawer.hidden = false;
  document.body.classList.add("no-scroll");
}
function closeDrawer() {
  if (!drawer) return;
  drawer.hidden = true;
  document.body.classList.remove("no-scroll");
}

/* ---------- click routing ---------- */
document.addEventListener("click", (e) => {
  const t = e.target;

  const tab = t.closest(".tab");
  if (tab) {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    tab.classList.add("active");
    renderMenu(tab.dataset.cat);
    return;
  }

  const add = t.closest("[data-add]");
  if (add) { addToCart(add.dataset.add, 1); return; }
  const inc = t.closest("[data-inc]");
  if (inc) { addToCart(inc.dataset.inc, 1); return; }
  const dec = t.closest("[data-dec]");
  if (dec) { addToCart(dec.dataset.dec, -1); return; }
  const del = t.closest("[data-del]");
  if (del) { delete cart[del.dataset.del]; saveCart(); updateCartUI(); renderMenu(); return; }
  if (t.closest("[data-close]")) { closeDrawer(); return; }
});

const cartBtn = document.getElementById("cartBtn");
if (cartBtn) cartBtn.addEventListener("click", openDrawer);
const barOpen = document.getElementById("barOpen");
if (barOpen) barOpen.addEventListener("click", openDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

/* ---------- build + send order ---------- */
function buildOrderMessage(lines, data) {
  const out = [];
  out.push("سلام لیمر 👋");
  out.push("");
  out.push("سفارش من:");
  lines.forEach((l) => {
    out.push("• " + faNum(l.q) + " × " + l.it.n + " — " + fmt(l.it.p * l.q));
  });
  out.push("");
  out.push("جمع کل: " + fmt(cartTotal()));
  out.push("");
  out.push("نام: " + data.name);
  out.push("موبایل: " + data.phone);
  out.push("آدرس: " + data.addr);
  if (data.note) out.push("توضیح: " + data.note);
  out.push("");
  out.push("(ارسال از سایت لیمر)");
  return out.join("\n");
}

const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("formErr");
    const lines = cartLines();
    if (!lines.length) return;

    const name = document.getElementById("fName").value.trim();
    const phone = toEnDigits(document.getElementById("fPhone").value.trim()).replace(/[\s\-()]/g, "");
    const addr = document.getElementById("fAddr").value.trim();
    const note = document.getElementById("fNote").value.trim();

    let msg = "";
    if (name.length < 3) msg = "اسمت رو کامل بنویس.";
    else if (!/^09\d{9}$/.test(phone)) msg = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع بشه.";
    else if (addr.length < 8) msg = "آدرس رو کامل‌تر بنویس تا پیک گم نشه.";

    if (msg) {
      if (err) { err.textContent = msg; err.hidden = false; }
      return;
    }
    if (err) err.hidden = true;

    const text = buildOrderMessage(lines, { name: name, phone: phone, addr: addr, note: note });
    window.open("https://wa.me/" + SITE.waNumber + "?text=" + encodeURIComponent(text), "_blank");
  });
}

/* ---------- mobile nav ---------- */
const burgerBtn = document.getElementById("burger");
const nav = document.getElementById("nav");
if (burgerBtn && nav) {
  burgerBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });
}

/* ---------- header shadow ---------- */
const header = document.getElementById("header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* footer year */
const y = document.getElementById("year");
if (y) y.textContent = new Date().toLocaleDateString("fa-IR", { year: "numeric" });

/* boot */
renderMenu("burger");
updateCartUI();

/* sync between tabs */
window.addEventListener("storage", (e) => {
  if (e.key !== CART_KEY) return;
  try { cart = JSON.parse(e.newValue || "{}") || {}; } catch (err) { cart = {}; }
  updateCartUI();
  renderMenu();
});
