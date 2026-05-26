const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname);
const siteOrigin = "https://tiretop.store";
const fallbackImage = "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=80";
const focusBrands = ["triangle", "uniroyal", "matador", "habilead"];
const popularSizes = ["205-55-r16", "195-65-r15", "225-45-r17", "215-65-r16", "235-55-r18", "255-45-r19"];
const localSeoPages = [
  {
    slug: "shyny-kovel",
    title: "Шини у Ковелі купити | TireTop",
    h1: "Шини у Ковелі",
    eyebrow: "Локальний підбір",
    description: "TireTop допомагає купити шини у Ковелі з актуальною наявністю, фото, DOT, країною виробництва та роздрібною ціною. Підбір під авто, консультація, самовивіз у Ковелі або доставка по Україні.",
    copy: "Якщо ви шукаєте шини у Ковелі, TireTop допоможе швидко підібрати варіант під ваш автомобіль, сезон і бюджет. У каталозі показані позиції зі складу: фото, розмір, бренд, модель, рік, країна виробництва та ціна. Можна залишити заявку на конкретну шину або попросити менеджера підібрати кілька варіантів під авто.",
    filters: {}
  },
  {
    slug: "litni-shyny-kovel",
    title: "Літні шини Ковель купити | TireTop",
    h1: "Літні шини у Ковелі",
    eyebrow: "Літній сезон",
    description: "Літні шини у Ковелі в наявності. Підбір за розміром, брендом і бюджетом. TireTop допоможе вибрати шини для міста, траси, дощу або SUV.",
    copy: "Літні шини варто підбирати не тільки за розміром, а й за умовами їзди. Для міста важливі комфорт і ресурс, для траси - стабільність, для дощу - мокре зчеплення. У TireTop можна порівняти доступні літні моделі, уточнити залишок і отримати консультацію перед покупкою.",
    filters: { season: "літо" }
  },
  {
    slug: "zymovi-shyny-kovel",
    title: "Зимові шини Ковель купити | TireTop",
    h1: "Зимові шини у Ковелі",
    eyebrow: "Зимовий сезон",
    description: "Зимові шини у Ковелі з актуальною наявністю та цінами. Допоможемо підібрати модель для снігу, льоду, міста, траси або щоденної їзди.",
    copy: "Зимові шини мають давати запас впевненості на холодній дорозі, снігу, каші та льоду. Ми допоможемо порівняти моделі за розміром, роком, країною виробництва і ціною, а також підкажемо, який варіант краще підійде для вашого авто та маршруту.",
    filters: { season: "зима" }
  },
  {
    slug: "triangle-kovel",
    title: "Шини Triangle у Ковелі купити | TireTop",
    h1: "Шини Triangle у Ковелі",
    eyebrow: "Бренд Triangle",
    description: "Шини Triangle у Ковелі. Практичний вибір у сегменті ціна/якість для міста, траси та SUV. Актуальна наявність і консультація TireTop.",
    copy: "Triangle часто обирають, коли потрібен розумний баланс ціни та характеристик. У TireTop можна переглянути доступні розміри Triangle, порівняти моделі та залишити заявку на підбір під авто.",
    filters: { brand: "triangle" }
  },
  {
    slug: "uniroyal-kovel",
    title: "Шини Uniroyal у Ковелі купити | TireTop",
    h1: "Шини Uniroyal у Ковелі",
    eyebrow: "Бренд Uniroyal",
    description: "Шини Uniroyal у Ковелі. Бренд з акцентом на мокру дорогу та впевненість у дощ. Підбір, наявність і роздрібні ціни TireTop.",
    copy: "Uniroyal добре підходить водіям, які часто їздять у дощ або хочуть більше контролю на мокрій дорозі. У каталозі TireTop можна переглянути доступні позиції Uniroyal та швидко залишити заявку.",
    filters: { brand: "uniroyal" }
  },
  {
    slug: "matador-kovel",
    title: "Шини Matador у Ковелі купити | TireTop",
    h1: "Шини Matador у Ковелі",
    eyebrow: "Бренд Matador",
    description: "Шини Matador у Ковелі. Європейський практичний вибір від групи Continental. Доступні розміри, ціни, DOT і консультація.",
    copy: "Matador - практичний європейський бренд для щоденної їзди. Ми допоможемо підібрати потрібний розмір, перевірити рік і країну виробництва та порівняти Matador з іншими моделями у вашому бюджеті.",
    filters: { brand: "matador" }
  },
  {
    slug: "habilead-kovel",
    title: "Шини Habilead у Ковелі купити | TireTop",
    h1: "Шини Habilead у Ковелі",
    eyebrow: "Бренд Habilead",
    description: "Шини Habilead у Ковелі. Бюджетний сегмент без зайвої переплати за бренд. Актуальна наявність, фото і консультація TireTop.",
    copy: "Habilead може бути доречним вибором, коли потрібна доступна ціна і зрозумілий варіант для щоденної експлуатації. У TireTop можна уточнити залишок, рік виробництва і підібрати розмір під авто.",
    filters: { brand: "habilead" }
  }
];
const localSizeSeoPages = popularSizes.map((slug) => {
  const label = sizeLabelFromSlug(slug);
  return {
    slug: `shyny-${slug}-kovel`,
    title: `Шини ${label} у Ковелі купити | TireTop`,
    h1: `Шини ${label} у Ковелі`,
    eyebrow: "Популярний розмір",
    description: `Шини ${label} у Ковелі. Перевіряйте актуальну наявність, фото, DOT, країну виробництва та роздрібну ціну в TireTop.`,
    copy: `Розмір ${label} часто зустрічається на популярних легкових авто. На цій сторінці зібрані доступні позиції цього розміру з каталогу TireTop. Якщо не впевнені, чи підходить ${label} саме для вашого авто, залиште заявку на підбір.`,
    filters: { size: slug }
  };
});
const infoPages = [
  {
    slug: "about",
    title: "Про TireTop | Шини у Ковелі",
    h1: "Про TireTop",
    eyebrow: "Локальний шинний магазин",
    description: "TireTop - шинний магазин у Ковелі з підбором шин, актуальною наявністю, консультацією, самовивозом і доставкою по Україні.",
    copy: "TireTop працює з шинами для роздрібних клієнтів і допомагає підібрати зрозумілий варіант під авто, сезон і бюджет. Ми робимо акцент на реальній наявності, чесній консультації, фото товару, DOT, країні виробництва та швидкому зв'язку з менеджером."
  },
  {
    slug: "contacts",
    title: "Контакти TireTop | Шини Ковель",
    h1: "Контакти TireTop",
    eyebrow: "Заявки та консультації",
    description: "Контакти TireTop у Ковелі. Залиште заявку на підбір шин або замовте консультацію менеджера.",
    copy: "Залиште заявку на сайті, якщо хочете уточнити наявність, підібрати шини під авто або отримати кілька варіантів у своєму бюджеті. Менеджер зв'яжеться з вами для підтвердження деталей."
  },
  {
    slug: "reviews",
    title: "Відгуки клієнтів TireTop | Шини у Ковелі",
    h1: "Відгуки клієнтів TireTop",
    eyebrow: "Довіра клієнтів",
    description: "Відгуки клієнтів TireTop про підбір шин, консультацію, самовивіз у Ковелі та доставку по Україні.",
    copy: "На цій сторінці можна зібрати реальні відгуки клієнтів про підбір шин, швидкість відповіді, якість консультації та досвід покупки. Перед запуском сюди можна додати 3-6 живих відгуків з Google або повідомлень клієнтів."
  }
];

const source = fs.readFileSync(path.join(root, "products.js"), "utf8");
const sandbox = {};
const { PRODUCTS, CONTACTS } = vm.runInNewContext(`${source}\n;({ PRODUCTS, CONTACTS });`, sandbox);

const money = new Intl.NumberFormat("uk-UA");

function clean(value) {
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toNumber(value) {
  const number = Number.parseFloat(String(value ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function parseSize(name) {
  const match = clean(name).match(/(\d{3})\s*\/?\s*(\d{2})\s*R\s*(\d{2})(?:\s+([0-9]{2,3}[A-Z]))?/i);
  return match ? { width: match[1], profile: match[2], diameter: match[3], index: (match[4] || "").toUpperCase() } : { width: "", profile: "", diameter: "", index: "" };
}

function imageUrls(value) {
  return clean(value)
    .split(/\r?\n|\s*,\s*(?=https?:\/\/)/)
    .map((url) => url.trim())
    .filter((url) => url.startsWith("https://"));
}

function productName(product) {
  return clean(product.name || product.product_name || `${product.brand || ""} ${product.model || ""}`);
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function productSlug(product) {
  return slugify(product.name.replace(/\s*\/\s*/g, "-"));
}

function sizeSlug(product) {
  return product.width && product.profile && product.diameter ? `${product.width}-${product.profile}-r${product.diameter}`.toLowerCase() : "";
}

function sizeLabelFromSlug(slug) {
  const match = slug.match(/^(\d{3})-(\d{2})-r(\d{2})$/i);
  return match ? `${match[1]}/${match[2]} R${match[3]}` : slug.toUpperCase();
}

function sizeLabel(product) {
  return product.width && product.profile && product.diameter ? `${product.width}/${product.profile} R${product.diameter}` : "";
}

function retailPrice(product) {
  return toNumber(product.retail_price) || Math.round(toNumber(product.price) * 1.05);
}

function truthy(value) {
  return ["true", "так", "yes", "1", "y", "+"].includes(clean(value).toLowerCase());
}

function eprelIdFromUrl(value) {
  const match = clean(value).match(/(?:tyres|qr|QR)\/(\d+)/);
  return match ? match[1] : "";
}

function eprelLabelCandidates(product) {
  const id = product.eprelId || eprelIdFromUrl(product.eprelUrl);
  if (!id) return [];

  return [
    product.labelImageUrl,
    `https://eprel.ec.europa.eu/label/Label_${id}.png`,
    `https://eprel.ec.europa.eu/label/Label_${id}_EN.png`,
    `https://eprel.ec.europa.eu/labels/tyres/Label_${id}.png`,
    `https://eprel.ec.europa.eu/labels/tyres/Label_${id}_EN.png`
  ].filter(Boolean);
}

function tyreLabelAdditionalProperties(product) {
  const properties = [];

  if (product.fuelClass) {
    properties.push({ "@type": "PropertyValue", name: "fuel efficiency class", value: product.fuelClass });
  }

  if (product.wetGripClass) {
    properties.push({ "@type": "PropertyValue", name: "wet grip class", value: product.wetGripClass });
  }

  if (product.noiseDb) {
    properties.push({ "@type": "PropertyValue", name: "external rolling noise", value: `${product.noiseDb} dB${product.noiseClass ? `, class ${product.noiseClass}` : ""}` });
  }

  return properties;
}

function euClassRows(activeClass) {
  return ["A", "B", "C", "D", "E"].map((item) => `
    <span class="eu-class-row ${item === activeClass ? "active" : ""}">
      <b>${item}</b>
    </span>
  `).join("");
}

function tyreLabelBlock(product) {
  const hasLabelData = product.fuelClass || product.wetGripClass || product.noiseDb || product.noiseClass || product.snowGrip || product.iceGrip || product.labelImageUrl || product.eprelUrl;
  const detailsUrl = product.eprelUrl || "/eu-tyre-label/";
  const target = product.eprelUrl ? ` target="_blank" rel="noreferrer"` : "";
  const imageAlt = `Маркування ЄС ${product.name}`;

  if (!hasLabelData) {
    return `<section class="eu-label-block eu-label-empty">
      <div>
        <p class="eyebrow">Маркування шин ЄС</p>
        <h2>Дані маркування уточнюються</h2>
        <p>Для цієї позиції ще не додано клас економії пального, зчеплення на мокрому та шум. Дані можна внести в Google Sheets або імпортувати від постачальника.</p>
      </div>
      <a class="eu-label-link" href="/eu-tyre-label/">Детальніше про маркування шин ЄС</a>
    </section>`;
  }

  const labelCandidates = eprelLabelCandidates(product);
  const visual = labelCandidates.length
    ? `<img class="eu-label-image" src="${escapeHtml(labelCandidates[0])}" alt="${escapeHtml(imageAlt)}" loading="lazy" data-label-candidates="${escapeHtml(JSON.stringify(labelCandidates))}" onerror="window.tryNextEprelLabelImage && window.tryNextEprelLabelImage(this)">`
    : `<div class="eu-label-card" role="img" aria-label="${escapeHtml(imageAlt)}">
        <div>
          <span>Економія пального</span>
          <div class="eu-class-scale">${euClassRows(product.fuelClass || "")}</div>
        </div>
        <div>
          <span>Зчеплення на мокрому</span>
          <div class="eu-class-scale wet">${euClassRows(product.wetGripClass || "")}</div>
        </div>
        <div class="eu-noise">
          <span>Зовнішній шум</span>
          <strong>${product.noiseDb ? `${escapeHtml(product.noiseDb)} dB` : "н/д"}</strong>
          ${product.noiseClass ? `<small>Клас ${escapeHtml(product.noiseClass)}</small>` : ""}
        </div>
      </div>`;

  return `<section class="eu-label-block">
    <div class="eu-label-copy">
      <p class="eyebrow">Маркування шин ЄС</p>
      <h2>Характеристики</h2>
      <div class="eu-label-metrics">
        <span><b>${escapeHtml(product.fuelClass || "н/д")}</b> економія пального</span>
        <span><b>${escapeHtml(product.wetGripClass || "н/д")}</b> мокре зчеплення</span>
        <span><b>${product.noiseDb ? `${escapeHtml(product.noiseDb)} dB` : "н/д"}</b> шум${product.noiseClass ? `, клас ${escapeHtml(product.noiseClass)}` : ""}</span>
      </div>
      <div class="eu-label-icons">
        ${product.snowGrip ? `<span>3PMSF</span>` : ""}
        ${product.iceGrip ? `<span>Ice Grip</span>` : ""}
        ${product.eprelId ? `<span>EPREL ${escapeHtml(product.eprelId)}</span>` : ""}
      </div>
      <a class="eu-label-link" href="${escapeHtml(detailsUrl)}"${target}>Детальніше про маркування шин ЄС</a>
    </div>
    <div class="eu-label-visual">${visual}</div>
  </section>`;
}

function normalizeProduct(raw, index) {
  const name = productName(raw);
  const size = parseSize(name);

  return {
    id: raw.id || index + 1,
    brand: clean(raw.brand),
    name,
    width: clean(raw.width || size.width),
    profile: clean(raw.profile || size.profile),
    diameter: clean(raw.diameter || size.diameter),
    load_speed_index: clean(raw.load_speed_index || size.index),
    season: clean(raw.season),
    year: toNumber(raw.year),
    country: clean(raw.country),
    stock: toNumber(raw.stock),
    price: toNumber(raw.price),
    retail_price: toNumber(raw.retail_price),
    images: imageUrls(raw.image_url || raw.image),
    recommended: Boolean(raw.recommended),
    recommendation_order: toNumber(raw.recommendation_order),
    fuelClass: clean(raw.fuelClass || raw.fuel_class).toUpperCase(),
    wetGripClass: clean(raw.wetGripClass || raw.wet_grip_class).toUpperCase(),
    noiseDb: toNumber(raw.noiseDb || raw.noise_db),
    noiseClass: clean(raw.noiseClass || raw.noise_class).toUpperCase(),
    snowGrip: truthy(raw.snowGrip || raw.snow_grip),
    iceGrip: truthy(raw.iceGrip || raw.ice_grip),
    eprelId: clean(raw.eprelId || raw.eprel_id || eprelIdFromUrl(raw.eprelUrl || raw.eprel_url)),
    eprelUrl: clean(raw.eprelUrl || raw.eprel_url),
    labelImageUrl: clean(raw.labelImageUrl || raw.label_image_url)
  };
}

const products = PRODUCTS.map(normalizeProduct).filter((product) => product.name);
const productsBySlug = new Map();

for (const product of products) {
  const baseSlug = productSlug(product);
  let slug = baseSlug;
  let count = 2;
  while (productsBySlug.has(slug)) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }
  product.slug = slug;
  productsBySlug.set(slug, product);
}

const uniqueSizes = [...new Set([...popularSizes, ...products.map(sizeSlug).filter(Boolean)])].sort();

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function breadcrumb(items) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteOrigin}${item.path}`
    }))
  });
}

function staticOrderFormMarkup() {
  return `<form class="netlify-detect-form" name="public-order" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/success.html">
      <input type="hidden" name="form-name" value="public-order" />
      <input name="bot-field" />
      <input name="email" />
      <input name="subject" />
      <input name="client_name" />
      <input name="client_phone" />
      <input name="car_or_size" />
      <input name="selected_product" />
      <input name="retail_price" />
      <textarea name="comment"></textarea>
      <input name="source" />
    </form>

    <div class="order-modal" id="productOrderModal" hidden aria-modal="true" role="dialog" aria-label="Замовити шини">
      <form class="order-card" id="productOrderForm">
        <button class="order-close" id="productOrderClose" type="button" aria-label="Закрити">&times;</button>
        <div>
          <p class="eyebrow">Заявка на шини</p>
          <h2>Оформити заявку</h2>
          <p class="order-product" id="productOrderProduct">Залиште контакт, і менеджер підтвердить наявність та допоможе з оформленням.</p>
        </div>
        <input id="productOrderSelectedProduct" name="selected_product" type="hidden" />
        <input id="productOrderRetailPrice" name="retail_price" type="hidden" />
        <label><span>Ім'я</span><input id="productOrderName" name="client_name" type="text" autocomplete="name" required /></label>
        <label><span>Телефон</span><input id="productOrderPhone" name="client_phone" type="tel" autocomplete="tel" required /></label>
        <label><span>Авто або розмір шин</span><input id="productOrderSize" name="car_or_size" type="text" placeholder="Наприклад: 205/55 R16 або Audi A6" required /></label>
        <label><span>Коментар</span><textarea id="productOrderComment" name="comment" rows="3" placeholder="Кількість, доставка, побажання"></textarea></label>
        <button class="order-submit" type="submit">Відправити заявку</button>
        <p class="order-status" id="productOrderStatus" hidden></p>
      </form>
    </div>`;
}

function pageShell({ title, description, canonical, body, structuredData = "" }) {
  return `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${siteOrigin}${canonical}" />
    <link rel="stylesheet" href="/styles.css" />
    ${structuredData}
  </head>
  <body class="public-site retail-page seo-static-page">
    <header class="public-header">
      <a class="brand" href="/" aria-label="TireTop">
        <span class="brand-mark">T</span>
        <span>
          <strong>TireTop</strong>
          <small>шини у Ковелі</small>
        </span>
      </a>
      <nav class="public-nav" aria-label="Навігація">
        <a href="/catalog/">Каталог</a>
        <a href="/#brands">Бренди</a>
        <a href="/#selection">Підбір</a>
        <a href="/#contacts">Контакти</a>
      </nav>
    </header>
    <main class="seo-static-main">
      ${body}
    </main>
    ${staticOrderFormMarkup()}
    <script src="/product-live.js"></script>
    <script src="/product-order.js"></script>
  </body>
</html>
`;
}

function productCard(product) {
  const image = product.images[0] || fallbackImage;
  const price = retailPrice(product);
  return `<article class="seo-product-card" data-width="${escapeHtml(product.width)}" data-profile="${escapeHtml(product.profile)}" data-diameter="${escapeHtml(product.diameter)}" data-season="${escapeHtml(product.season)}">
    <a class="seo-product-image" href="/tyres/${product.slug}/">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
    </a>
    <div class="seo-product-body">
      <p>${escapeHtml(product.brand || "TireTop")}</p>
      <h2><a href="/tyres/${product.slug}/">${escapeHtml(product.name)}</a></h2>
      <strong>${price ? `${escapeHtml(money.format(price))} грн` : "Ціну уточнюйте"}</strong>
      <div class="retail-meta">
        ${product.season ? `<span>${escapeHtml(product.season)}</span>` : ""}
        ${product.year ? `<span>${product.year}</span>` : ""}
        ${product.country ? `<span>${escapeHtml(product.country)}</span>` : ""}
      </div>
    </div>
  </article>`;
}

function selectOptions(values, fallbackLabel = "Всі") {
  return [`<option value="">${escapeHtml(fallbackLabel)}</option>`, ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)].join("");
}

function brandFilterBlock(brandProducts) {
  const listed = brandProducts.filter((product) => product.stock > 0);
  const widths = [...new Set(listed.map((product) => product.width).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const profiles = [...new Set(listed.map((product) => product.profile).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const diameters = [...new Set(listed.map((product) => product.diameter).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const seasons = [...new Set(listed.map((product) => product.season).filter(Boolean))].sort();

  return `<section class="brand-filter-panel" aria-label="Фільтр шин бренду">
    <div class="brand-filter-head">
      <p class="eyebrow">Підбір у бренді</p>
      <h2>Знайдіть потрібний розмір</h2>
    </div>
    <form class="brand-filter-form" data-brand-filter>
      <label><span>Ширина</span><select name="width">${selectOptions(widths)}</select></label>
      <label><span>Профіль</span><select name="profile">${selectOptions(profiles)}</select></label>
      <label><span>Діаметр</span><select name="diameter">${selectOptions(diameters.map((value) => `R${value}`))}</select></label>
      <label><span>Сезон</span><select name="season">${selectOptions(seasons, "Всі сезони")}</select></label>
      <button type="submit">Шукати</button>
      <button class="brand-filter-reset" type="reset">Скинути</button>
    </form>
    <p class="brand-filter-count" data-brand-filter-count></p>
  </section>
  <script>
    (() => {
      const form = document.querySelector("[data-brand-filter]");
      const cards = [...document.querySelectorAll(".seo-product-card")];
      const count = document.querySelector("[data-brand-filter-count]");
      if (!form || !cards.length) return;

      const normalize = (value) => String(value || "").trim().toLowerCase();
      const apply = () => {
        const data = new FormData(form);
        const width = normalize(data.get("width"));
        const profile = normalize(data.get("profile"));
        const diameter = normalize(data.get("diameter")).replace(/^r/, "");
        const season = normalize(data.get("season"));
        let visible = 0;

        cards.forEach((card) => {
          const ok =
            (!width || normalize(card.dataset.width) === width) &&
            (!profile || normalize(card.dataset.profile) === profile) &&
            (!diameter || normalize(card.dataset.diameter) === diameter) &&
            (!season || normalize(card.dataset.season) === season);
          card.hidden = !ok;
          if (ok) visible += 1;
        });

        if (count) count.textContent = visible ? \`Знайдено: \${visible}\` : "За цими параметрами позицій не знайдено.";
      };

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        apply();
      });
      form.addEventListener("reset", () => window.setTimeout(apply, 0));
      apply();
    })();
  </script>`;
}

function localPageProducts(page) {
  let list = products.filter((product) => product.stock > 0);
  if (page.filters.brand) list = list.filter((product) => slugify(product.brand) === page.filters.brand);
  if (page.filters.size) list = list.filter((product) => sizeSlug(product) === page.filters.size);
  if (page.filters.season) list = list.filter((product) => clean(product.season).toLowerCase().includes(page.filters.season));
  return list.slice(0, 12);
}

function localSeoBody(page) {
  const listedProducts = localPageProducts(page);
  const links = [
    ...focusBrands.map((brand) => `<a href="/brand/${brand}/">Шини ${brand.charAt(0).toUpperCase() + brand.slice(1)}</a>`),
    ...popularSizes.map((slug) => `<a href="/size/${slug}/">${sizeLabelFromSlug(slug)}</a>`)
  ].join("");

  return `<section class="seo-list-hero local-seo-hero">
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.copy)}</p>
    <div class="local-seo-actions">
      <a class="public-primary" href="/catalog/">Перейти до каталогу</a>
      <button class="public-primary light static-order-button" type="button" data-product="${escapeHtml(page.h1)}" data-price="" data-size="${escapeHtml(page.h1)}">Замовити підбір</button>
    </div>
  </section>
  <section class="local-seo-section">
    <div>
      <p class="eyebrow">TireTop Ковель</p>
      <h2>Що можна уточнити перед покупкою</h2>
    </div>
    <div class="local-seo-points">
      <article><strong>Підбір під авто</strong><span>Допоможемо звірити розмір, індекси навантаження та сезон під ваш автомобіль.</span></article>
      <article><strong>Актуальна наявність</strong><span>Позиції підтверджуються менеджером перед оформленням замовлення.</span></article>
      <article><strong>Самовивіз у Ковелі</strong><span>Можна забрати локально після підтвердження або погодити доставку по Україні.</span></article>
    </div>
  </section>
  ${listedProducts.length ? `<section class="seo-similar-section">
    <div class="seo-section-title-row">
      <div>
        <p class="eyebrow">В наявності</p>
        <h2>Позиції, які варто переглянути</h2>
      </div>
      <a href="/catalog/">Весь каталог</a>
    </div>
    <div class="seo-product-grid">${listedProducts.map(productCard).join("")}</div>
  </section>` : ""}
  <section class="local-seo-section">
    <div>
      <p class="eyebrow">Швидкі переходи</p>
      <h2>Популярні бренди та розміри</h2>
    </div>
    <div class="local-link-grid">${links}</div>
  </section>`;
}

function infoPageBody(page) {
  return `<section class="seo-list-hero local-seo-hero">
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.copy)}</p>
    <div class="local-seo-actions">
      <a class="public-primary" href="/catalog/">Перейти до каталогу</a>
      <button class="public-primary light static-order-button" type="button" data-product="${escapeHtml(page.h1)}" data-price="" data-size="${escapeHtml(page.h1)}">Замовити підбір</button>
    </div>
  </section>
  <section class="local-seo-section">
    <div>
      <p class="eyebrow">Чому TireTop</p>
      <h2>Що важливо для клієнта</h2>
    </div>
    <div class="local-seo-points">
      <article><strong>Живий підбір</strong><span>Пояснюємо різницю між моделями, брендами та сезонами простими словами.</span></article>
      <article><strong>Актуальні дані</strong><span>Каталог оновлюється з Google Sheets: ціни, залишки, фото і характеристики.</span></article>
      <article><strong>Швидка заявка</strong><span>Клієнт залишає телефон, а менеджер отримує всю інформацію на пошту.</span></article>
    </div>
  </section>
  <section class="local-seo-section">
    <div>
      <p class="eyebrow">Корисні сторінки</p>
      <h2>Перейти до підбору шин</h2>
    </div>
    <div class="local-link-grid">
      <a href="/shyny-kovel/">Шини у Ковелі</a>
      <a href="/litni-shyny-kovel/">Літні шини Ковель</a>
      <a href="/zymovi-shyny-kovel/">Зимові шини Ковель</a>
      <a href="/catalog/">Каталог шин</a>
      <a href="/about/">Про TireTop</a>
      <a href="/contacts/">Контакти</a>
    </div>
  </section>`;
}

function productDescription(product) {
  return `${product.name} в наявності у Ковелі. Консультація, підбір шин, самовивіз або доставка.`;
}

function seasonPurpose(product) {
  const season = clean(product.season).toLowerCase();
  if (season.includes("зим") || season.includes("winter")) return "для холодного сезону, снігу, мокрої дороги та щоденної їзди взимку";
  if (season.includes("літ") || season.includes("summer")) return "для теплого сезону, міста, траси та стабільної поведінки на мокрій дорозі";
  return "для щоденної їзди, підбору під ваш автомобіль і реальні умови експлуатації";
}

function modelSeoCopy(product) {
  const name = product.name;
  const lowerName = name.toLowerCase();
  const brand = product.brand || "TireTop";
  const size = sizeLabel(product);
  const sizeText = size ? ` у розмірі ${size}` : "";

  const templates = [
    {
      match: ["rainexpert 5"],
      intro: `${name} - літня шина Uniroyal з акцентом на впевнену їзду під час дощу. Модель добре підходить для водіїв, які часто їздять містом і трасою та хочуть прогнозоване гальмування на мокрому асфальті.`,
      support: `RainExpert 5 варто розглядати, якщо для вас важливі комфорт, відведення води з плями контакту і спокійна поведінка автомобіля в дощову погоду. У TireTop можна уточнити наявність цієї моделі${sizeText}, рік виробництва та країну.`
    },
    {
      match: ["rainsport 5"],
      intro: `${name} - літня модель Uniroyal для активнішої їзди, швидкісних авто та водіїв, яким важлива керованість на мокрій дорозі. Вона більше орієнтована на динаміку, ніж класичні комфортні туристичні шини.`,
      support: `RainSport 5 доречно розглядати для легкових авто і SUV, коли потрібна впевненість у дощ, стабільність на швидкості та хороше відчуття керма. Менеджер TireTop допоможе порівняти її з іншими варіантами${sizeText}.`
    },
    {
      match: ["hectorra 5"],
      intro: `${name} - літня шина Matador для щоденної експлуатації, міста і траси. Це практичний європейський варіант для водіїв, яким потрібен баланс ціни, комфорту і стабільної поведінки на дорозі.`,
      support: `Hectorra 5 підходить для спокійної та помірно активної їзди, коли важлива передбачуваність, нормальний ресурс і зрозуміла ціна. У TireTop можна перевірити залишок, DOT, країну виробництва і підібрати альтернативи${sizeText}.`
    },
    {
      match: ["hectorra van"],
      intro: `${name} - літня комерційна шина Matador для легких вантажних авто, бусів і робочого транспорту. Вона розрахована на щоденні навантаження та практичну експлуатацію.`,
      support: `Hectorra Van варто розглядати, коли потрібна міцніша шина для роботи, доставок або регулярних поїздок з вантажем. Ми допоможемо перевірити індекс навантаження і підібрати правильний варіант${sizeText}.`
    },
    {
      match: ["te307", "reliaxtouring"],
      intro: `${name} - літня touring-шина Triangle для щоденної їзди з хорошим співвідношенням ціни та можливостей. Вона орієнтована на комфорт, рівномірну поведінку і спокійну експлуатацію в місті та на трасі.`,
      support: `TE307 ReliaXTouring підійде тим, хто шукає не спортивну, а практичну шину для кожного дня. У TireTop можна порівняти її з Matador, Uniroyal або іншими моделями Triangle${sizeText}.`
    },
    {
      match: ["th202", "effexsport"],
      intro: `${name} - літня модель Triangle для більш потужних авто, SUV або водіїв, які хочуть жорсткішу та зібранішу поведінку на швидкості. Це варіант з акцентом на керованість і стабільність.`,
      support: `TH202 EffeXSport доречно дивитись для ширших розмірів, низького профілю та авто, де важлива впевненість на трасі. Ми підкажемо, чи підійде ця модель під ваш стиль їзди і бюджет${sizeText}.`
    },
    {
      match: ["practicalmax rs21"],
      intro: `${name} - практична шина Habilead для водіїв, які шукають бюджетний варіант без переплати за бренд. Модель підходить для щоденної їзди, міського режиму і спокійної траси.`,
      support: `PracticalMax RS21 варто розглядати, коли головні критерії - ціна, наявність і зрозумілий варіант для повсякденного авто. TireTop допоможе перевірити розмір, рік і альтернативи в цьому бюджеті.`
    },
    {
      match: ["winterexpert"],
      intro: `${name} - зимова шина Uniroyal для холодного сезону, мокрого асфальту, снігу та мінливої погоди. Вона підійде водіям, яким важлива впевненість не тільки на снігу, а й у зимовий дощ.`,
      support: `WinterExpert варто розглядати для щоденної зимової експлуатації, коли потрібна стабільність і прогнозована поведінка. У TireTop можна уточнити DOT, залишок і підібрати комплект${sizeText}.`
    },
    {
      match: ["snowlink"],
      intro: `${name} - зимова шина Triangle для щоденної експлуатації в холодну пору року. Вона орієнтована на доступну ціну, нормальну поведінку на зимовій дорозі і практичний вибір під бюджет.`,
      support: `SnowLink підійде тим, хто шукає зимовий комплект без зайвої переплати. Ми допоможемо перевірити індекс, розмір, залишок і порівняти цю модель з іншими зимовими шинами${sizeText}.`
    },
    {
      match: ["icelink"],
      intro: `${name} - зимова модель Triangle для складніших умов, коли водій хоче більше впевненості на снігу, льоду та холодному покритті. Це варіант для тих, хто часто їздить взимку за містом або по неідеальних дорогах.`,
      support: `IceLink варто розглядати, якщо вам потрібна зимова шина з акцентом на зчеплення і запас впевненості. TireTop підкаже, чи ця модель доречна для вашого авто та маршруту${sizeText}.`
    }
  ];

  const template = templates.find((item) => item.match.some((term) => lowerName.includes(term)));

  if (template) return template;

  return {
    intro: `${name} - це шина ${seasonPurpose(product)}. Вона підійде водіям, які хочуть зрозумілий варіант без зайвої переплати і перед покупкою хочуть бачити розмір, рік, країну виробництва та роздрібну ціну.`,
    support: `У TireTop можна швидко уточнити наявність у Ковелі, отримати консультацію по сумісності з авто і порівняти цю модель з іншими шинами ${brand}${sizeText}.`
  };
}

function productSeoText(product) {
  const copy = modelSeoCopy(product);
  return `<section class="seo-product-content">
    <div>
      <p class="eyebrow">Опис моделі</p>
      <h2>Для кого підійде ${escapeHtml(product.name)}</h2>
      <p>${escapeHtml(copy.intro)}</p>
      <p>${escapeHtml(copy.support)}</p>
    </div>
    <div class="seo-product-points">
      <article><strong>Підбір під авто</strong><span>Підкажемо, чи підходить розмір і індекс під ваш автомобіль.</span></article>
      <article><strong>Живий склад</strong><span>Перевіряємо залишок, рік і країну перед підтвердженням.</span></article>
      <article><strong>Локально в Ковелі</strong><span>Можливий самовивіз або відправка по Україні після узгодження.</span></article>
    </div>
  </section>`;
}

function similarProducts(product) {
  const sameSize = products
    .filter((item) => item.slug !== product.slug && sizeSlug(item) && sizeSlug(item) === sizeSlug(product))
    .slice(0, 4);
  const sameBrand = products
    .filter((item) => item.slug !== product.slug && !sameSize.includes(item) && slugify(item.brand) === slugify(product.brand))
    .slice(0, 4 - sameSize.length);
  return [...sameSize, ...sameBrand];
}

function similarProductsBlock(product) {
  const similar = similarProducts(product);
  if (!similar.length) return "";

  return `<section class="seo-similar-section">
    <div class="seo-section-title-row">
      <div>
        <p class="eyebrow">Схожі варіанти</p>
        <h2>Схожі шини для порівняння</h2>
      </div>
      <a href="/catalog/">Весь каталог</a>
    </div>
    <div class="seo-product-grid seo-similar-grid">${similar.map(productCard).join("")}</div>
  </section>`;
}

function trustBlock() {
  return `<section class="seo-trust-section">
    <article><strong>Реальна консультація</strong><span>Пояснюємо різницю між моделями простими словами.</span></article>
    <article><strong>Самовивіз у Ковелі</strong><span>Зручно забрати після підтвердження менеджером.</span></article>
    <article><strong>Доставка по Україні</strong><span>Відправляємо після узгодження товару і деталей.</span></article>
    <article><strong>Живі фото</strong><span>Можна додати фото в Google Sheets і показувати товар клієнтам.</span></article>
  </section>`;
}

function productGallery(product) {
  const images = product.images.length ? product.images : [fallbackImage];
  const mainImage = images[0];
  const thumbs = images.length > 1
    ? `<div class="seo-product-thumbs" aria-label="Фото товару">${images.map((url, index) => `
        <button class="${index === 0 ? "active" : ""}" type="button" data-gallery-image="${escapeHtml(url)}" aria-label="Фото ${index + 1}: ${escapeHtml(product.name)}">
          <img src="${escapeHtml(url)}" alt="${escapeHtml(product.name)} фото ${index + 1}" loading="lazy" />
        </button>
      `).join("")}</div>`
    : "";

  return `<div class="seo-product-photo">
    <div class="seo-main-photo-frame">
      <img class="seo-main-product-image" src="${escapeHtml(mainImage)}" alt="${escapeHtml(product.name)}" loading="eager" />
    </div>
    ${thumbs}
  </div>`;
}

function writeFile(relativePath, content) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function removeGeneratedDirectory(name) {
  const target = path.resolve(root, name);
  if (!target.startsWith(root + path.sep)) throw new Error(`Unsafe path: ${target}`);
  fs.rmSync(target, { recursive: true, force: true });
}

removeGeneratedDirectory("tyres");
removeGeneratedDirectory("brand");
removeGeneratedDirectory("size");
removeGeneratedDirectory("catalog");
for (const page of [...localSeoPages, ...localSizeSeoPages]) {
  removeGeneratedDirectory(page.slug);
}
for (const page of infoPages) {
  removeGeneratedDirectory(page.slug);
}

for (const product of products) {
  const price = retailPrice(product);
  const image = product.images[0] || fallbackImage;
  const size = sizeLabel(product);
  const message = encodeURIComponent(`Добрий день. Цікавить ${product.name}. Є в наявності?`);
  const orderSubject = encodeURIComponent(`Замовлення: ${product.name}`);
  const orderBody = encodeURIComponent(`Добрий день.\nЦікавить ${product.name}.\nЦіна на сайті: ${price ? `${money.format(price)} грн` : "уточнюється"}.\nПрошу зв'язатися зі мною для підтвердження наявності.`);
  const canonical = `/tyres/${product.slug}/`;
  const title = `${product.name} купити в Ковелі | TireTop`;
  const description = productDescription(product);
  const structuredData = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      brand: { "@type": "Brand", name: product.brand || "TireTop" },
      image: product.images.length ? product.images : [fallbackImage],
      description,
      offers: {
        "@type": "Offer",
        priceCurrency: "UAH",
        price: price || undefined,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        url: `${siteOrigin}${canonical}`
      },
      additionalProperty: tyreLabelAdditionalProperties(product)
    }),
    breadcrumb([
      { name: "Головна", path: "/" },
      { name: "Каталог", path: "/catalog/" },
      { name: product.name, path: canonical }
    ])
  ].join("\n");
  const body = `<section class="seo-product-hero">
    ${productGallery(product)}
    <div class="seo-product-info">
      <p class="eyebrow">${escapeHtml(product.brand || "TireTop")}</p>
      <h1>${escapeHtml(product.name)}</h1>
      <strong class="seo-price">${price ? `${escapeHtml(money.format(price))} грн` : "Ціну уточнюйте"}</strong>
      <p>${escapeHtml(description)}</p>
      <div class="seo-spec-grid">
        ${size ? `<span><small>Розмір</small><b>${escapeHtml(size)}</b></span>` : ""}
        ${product.season ? `<span><small>Сезон</small><b>${escapeHtml(product.season)}</b></span>` : ""}
        ${product.load_speed_index ? `<span><small>Індекс</small><b>${escapeHtml(product.load_speed_index)}</b></span>` : ""}
        ${product.year ? `<span><small>Рік</small><b>${product.year}</b></span>` : ""}
        ${product.country ? `<span><small>Країна</small><b>${escapeHtml(product.country)}</b></span>` : ""}
        ${product.stock > 0 ? `<span><small>Наявність</small><b>${product.stock} шт.</b></span>` : `<span><small>Наявність</small><b>Уточнити</b></span>`}
      </div>
      <div class="seo-actions">
        <button class="public-primary seo-order-main static-order-button" type="button" data-product="${escapeHtml(product.name)}" data-price="${escapeHtml(price || "")}" data-size="${escapeHtml(size || product.name)}">Замовити</button>
        <a class="public-primary" href="viber://forward?text=${message}" target="_blank" rel="noreferrer">Viber</a>
        <a class="public-primary" href="${escapeHtml(CONTACTS.telegram)}?text=${message}" target="_blank" rel="noreferrer">Telegram</a>
        <a class="public-primary light" href="/catalog/">До каталогу</a>
      </div>
    </div>
  </section>
  ${tyreLabelBlock(product)}
  ${productSeoText(product)}
  ${similarProductsBlock(product)}
  ${trustBlock()}`;

  writeFile(`tyres/${product.slug}/index.html`, pageShell({ title, description, canonical, body, structuredData }));
}

for (const brandSlug of focusBrands) {
  const brandProducts = products.filter((product) => slugify(product.brand) === brandSlug);
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  const canonical = `/brand/${brandSlug}/`;
  const title = `Шини ${brandName} купити в Ковелі | TireTop`;
  const description = `Шини ${brandName} у Ковелі. Актуальні ціни, підбір, консультація, самовивіз або доставка по Україні.`;
  const body = `<section class="seo-list-hero">
    <p class="eyebrow">Бренд шин</p>
    <h1>Шини ${escapeHtml(brandName)} у Ковелі</h1>
    <p>${escapeHtml(description)}</p>
  </section>
  ${brandFilterBlock(brandProducts)}
  <section class="seo-product-grid">${brandProducts.map(productCard).join("")}</section>`;
  const structuredData = breadcrumb([{ name: "Головна", path: "/" }, { name: `Шини ${brandName}`, path: canonical }]);
  writeFile(`brand/${brandSlug}/index.html`, pageShell({ title, description, canonical, body, structuredData }));
}

for (const slug of uniqueSizes) {
  const label = sizeLabelFromSlug(slug);
  const sizeProducts = products.filter((product) => sizeSlug(product) === slug);
  const canonical = `/size/${slug}/`;
  const title = `Шини ${label} купити в Ковелі | TireTop`;
  const description = `Шини ${label} у Ковелі. Перевіряйте ціну, рік, країну виробництва та залишайте заявку онлайн.`;
  const body = `<section class="seo-list-hero">
    <p class="eyebrow">Розмір шин</p>
    <h1>Шини ${escapeHtml(label)} у Ковелі</h1>
    <p>${escapeHtml(description)}</p>
  </section>
  <section class="seo-product-grid">${sizeProducts.length ? sizeProducts.map(productCard).join("") : `<p class="retail-note">Позиції цього розміру можна додати у Google Sheets, і сторінка буде готова до оновлення.</p>`}</section>`;
  const structuredData = breadcrumb([{ name: "Головна", path: "/" }, { name: `Шини ${label}`, path: canonical }]);
  writeFile(`size/${slug}/index.html`, pageShell({ title, description, canonical, body, structuredData }));
}

for (const page of [...localSeoPages, ...localSizeSeoPages]) {
  const canonical = `/${page.slug}/`;
  const structuredData = breadcrumb([{ name: "Головна", path: "/" }, { name: page.h1, path: canonical }]);
  writeFile(`${page.slug}/index.html`, pageShell({
    title: page.title,
    description: page.description,
    canonical,
    body: localSeoBody(page),
    structuredData
  }));
}

for (const page of infoPages) {
  const canonical = `/${page.slug}/`;
  const structuredData = breadcrumb([{ name: "Головна", path: "/" }, { name: page.h1, path: canonical }]);
  writeFile(`${page.slug}/index.html`, pageShell({
    title: page.title,
    description: page.description,
    canonical,
    body: infoPageBody(page),
    structuredData
  }));
}

const catalogSource = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace(/<title>[\s\S]*?<\/title>/, "<title>Каталог шин у Ковелі | TireTop</title>")
  .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${siteOrigin}/catalog/" />`)
  .replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="Каталог шин TireTop у Ковелі: фільтри за брендом, сезоном, розміром, ціною та наявністю." />');
writeFile("catalog/index.html", catalogSource);

const sitemapUrls = [
  "/",
  "/catalog/",
  "/eu-tyre-label/",
  ...localSeoPages.map((page) => `/${page.slug}/`),
  ...localSizeSeoPages.map((page) => `/${page.slug}/`),
  ...infoPages.map((page) => `/${page.slug}/`),
  ...focusBrands.map((brand) => `/brand/${brand}/`),
  ...uniqueSizes.map((size) => `/size/${size}/`),
  ...products.map((product) => `/tyres/${product.slug}/`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${siteOrigin}${url}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

fs.writeFileSync(path.join(root, "_redirects"), [
  ""
].join("\n") + "\n", "utf8");

console.log(`Generated ${products.length} product pages, ${focusBrands.length} brand pages, ${uniqueSizes.length} size pages.`);
