/* لیمر — small helpers + menu rendering (no dependencies) */

const MENU = {
  burger: [
    { n: "برگر مخصوص لیمر", d: "گوشت دست‌ساز ۱۵۰ گرمی، پنیر چدار، سس مخصوص", p: 285000, e: "🍔" },
    { n: "چیزبرگر دوبل", d: "دو لایه گوشت، پنیر دوبل، خیارشور", p: 380000, e: "🧀" },
    { n: "برگر قارچ", d: "گوشت، قارچ سرخ‌شده، سس مایونز", p: 310000, e: "🍄" },
    { n: "برگر مرغ کریسپی", d: "فیله مرغ سوخاری، کاهو، سس تارتار", p: 265000, e: "🐔" },
  ],
  pizza: [
    { n: "پیتزا پنیر", d: "خمیر تازه، پنیر موزارلا، سس گوجه", p: 320000, e: "🍕" },
    { n: "پیتزا مخصوص", d: "ژامبون، قارچ، فلفل دلمه، زیتون", p: 420000, e: "🍕" },
    { n: "پیتزا مرغ و قارچ", d: "مرغ گریل، قارچ، پنیر پیتزا", p: 395000, e: "🍗" },
    { n: "پیتزا سبزیجات", d: "فلفل، قارچ، ذرت، گوجه، زیتون", p: 300000, e: "🥬" },
  ],
  sandwich: [
    { n: "ساندویچ هات‌داگ ویژه", d: "سوسیس کوکتل، سیب‌زمینی، سس مخصوص", p: 195000, e: "🌭" },
    { n: "ساندویچ شنیسل مرغ", d: "فیله مرغ، کاهو، گوجه، سس", p: 245000, e: "🥪" },
    { n: "ساندویچ فلافل", d: "فلافل تازه، سیب‌زمینی، خیارشور", p: 130000, e: "🧆" },
    { n: "کلاب ساندویچ", d: "مرغ، ژامبون، پنیر، تخم‌مرغ", p: 290000, e: "🥙" },
  ],
  fried: [
    { n: "مرغ سوخاری (۲ تکه)", d: "با سیب‌زمینی و سس", p: 295000, e: "🍗" },
    { n: "ناگت مرغ", d: "۸ عدد، با سیب‌زمینی", p: 220000, e: "🍢" },
    { n: "سیب‌زمینی سرخ‌کرده", d: "با پنیر یا ساده", p: 95000, e: "🍟" },
    { n: "سیب‌زمینی با پنیر و قارچ", d: "پرس ویژه", p: 155000, e: "🧆" },
  ],
  drink: [
    { n: "نوشابه قوطی", d: "۳۳۰ میلی‌لیتر", p: 35000, e: "🥤" },
    { n: "دوغ سنتی", d: "لیوانی", p: 30000, e: "🥛" },
    { n: "آب‌پرتقال طبیعی", d: "تازه‌فشرده", p: 85000, e: "🍊" },
    { n: "میلک‌شیک شکلات", d: "با بستنی", p: 120000, e: "🥤" },
  ],
};

const fmt = (n) => n.toLocaleString("fa-IR") + " تومان";

function renderMenu(cat) {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  const items = MENU[cat] || [];
  grid.innerHTML = items
    .map(
      (it, i) => `
      <article class="card" style="animation-delay:${i * 60}ms">
        <div class="card-emoji">${it.e}</div>
        <div class="card-body">
          <h3>${it.n}</h3>
          <p>${it.d}</p>
          <span class="price">${fmt(it.p)}</span>
        </div>
      </article>`
    )
    .join("");
}

/* tabs */
document.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  renderMenu(tab.dataset.cat);
});

/* mobile nav */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
if (burger && nav) {
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });
}

/* header shadow on scroll */
const header = document.getElementById("header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* footer year */
const y = document.getElementById("year");
if (y) y.textContent = new Date().toLocaleDateString("fa-IR", { year: "numeric" });

/* boot */
renderMenu("burger");