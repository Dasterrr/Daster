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
    title: "Про TireTop: шини в Ковелі з підбором авто | TireTop",
    h1: "Про TireTop",
    eyebrow: "Локальний шинний магазин",
    description: "TireTop - шинний магазин у Ковелі з підбором шин, актуальною наявністю, консультацією, самовивозом і доставкою по Україні.",
    copy: "TireTop працює з шинами для роздрібних клієнтів і допомагає підібрати зрозумілий варіант під авто, сезон і бюджет. Ми робимо акцент на реальній наявності, чесній консультації, фото товару, DOT, країні виробництва та швидкому зв'язку з менеджером."
  },
  {
    slug: "contacts",
    title: "Контакти TireTop у Ковелі для підбору шин | TireTop",
    h1: "Контакти TireTop",
    eyebrow: "Заявки та консультації",
    description: "Контакти TireTop у Ковелі. Залиште заявку на підбір шин або замовте консультацію менеджера.",
    copy: "Залиште заявку на сайті, якщо хочете уточнити наявність, підібрати шини під авто або отримати кілька варіантів у своєму бюджеті. Менеджер зв'яжеться з вами для підтвердження деталей."
  },
  {
    slug: "delivery-payment",
    title: "Доставка і оплата шин | TireTop",
    h1: "Доставка і оплата",
    eyebrow: "Умови покупки",
    description: "Доставка шин по Україні Новою Поштою та Delivery. Самовивіз у Ковелі. Зручна оплата, перевірка шин перед відправкою та допомога з підбором.",
    copy: "Швидко відправляємо шини по Україні та допомагаємо з підбором перед покупкою."
  },
  {
    slug: "warranty-return",
    title: "Гарантія і повернення шин | TireTop",
    h1: "Гарантія і повернення",
    eyebrow: "Умови повернення",
    description: "Гарантія і повернення шин TireTop. Повернення протягом 14 днів за умови збереження товарного вигляду та відсутності слідів монтажу.",
    copy: "Повернення або обмін можливі протягом 14 днів згідно з правилами дистанційної покупки, якщо шини не були у використанні, не монтувались на диск, мають товарний вигляд і збережені маркування. Перед поверненням потрібно зв'язатися з менеджером TireTop для погодження деталей."
  },
  {
    slug: "reviews",
    title: "Відгуки клієнтів TireTop про шини в Ковелі | TireTop",
    h1: "Відгуки клієнтів TireTop",
    eyebrow: "Довіра клієнтів",
    description: "Відгуки клієнтів TireTop про підбір шин, консультацію, самовивіз у Ковелі та доставку по Україні.",
    copy: "На цій сторінці зібрані відгуки та приклади консультацій TireTop по різних моделях шин. Вони допомагають зрозуміти, для кого підходить конкретна модель, як вона позиціонується за комфортом, дощем, ресурсом, ціною та щоденною експлуатацією."
  },
  {
    slug: "privacy",
    title: "Політика конфіденційності | TireTop",
    h1: "Політика конфіденційності",
    eyebrow: "Дані клієнтів",
    description: "Політика конфіденційності TireTop: як використовуються контактні дані клієнтів при оформленні заявки на шини.",
    copy: "TireTop використовує контактні дані клієнта тільки для обробки заявки, уточнення наявності, підбору шин, доставки та зв'язку з менеджером. Ми не продаємо персональні дані третім особам і не використовуємо їх для сторонньої реклами."
  }
];

const source = fs.readFileSync(path.join(root, "products.js"), "utf8");
const sandbox = {};
const { PRODUCTS, CONTACTS } = vm.runInNewContext(`${source}\n;({ PRODUCTS, CONTACTS });`, sandbox);
const carFitmentsPath = path.join(root, "car-fitments.json");
const carFitments = fs.existsSync(carFitmentsPath) ? JSON.parse(fs.readFileSync(carFitmentsPath, "utf8")) : [];

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

function plainText(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1");
}

function trimToLength(value, max = 160) {
  const text = plainText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max - 3)}...`;
}

function metaDescription(value, context = "") {
  const suffix = " Консультація, самовивіз у Ковелі та доставка по Україні.";
  let text = plainText(value);
  if (context && !text.toLowerCase().includes(clean(context).toLowerCase())) {
    text = `${text} ${context}.`;
  }
  while (text.length < 120) {
    text = `${text}${suffix}`;
  }
  return trimToLength(text, 160);
}

function metaTitle(value) {
  let title = plainText(value);
  if (title.length < 50 && title.includes("| TireTop")) {
    title = title.replace(" | TireTop", " купити з підбором | TireTop");
  }
  if (title.length < 50 && title.includes("| TireTop")) {
    title = title.replace(" | TireTop", " ціна та наявність | TireTop");
  }
  return trimToLength(title, 65);
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

function sizeSlugFromLabel(size) {
  const match = clean(size).match(/(\d{3})\D*(\d{2})\D*R?\D*(\d{2})/i);
  return match ? `${match[1]}-${match[2]}-r${match[3]}`.toLowerCase() : slugify(size);
}

function retailPrice(product) {
  return toNumber(product.retail_price) || Math.round(toNumber(product.price) * 1.05);
}

function productSeoName(product) {
  return plainText(product.name)
    .replace(/&amp;/gi, " ")
    .replace(/&[a-z0-9#]+;?/gi, " ")
    .replace(/[\\^*_]+/g, " ")
    .replace(/\bp\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productSeoTitle(product) {
  const seoName = productSeoName(product);
  const full = `Купити ${seoName} | TireTop`;
  if (full.length <= 65) return full;

  const brand = clean(product.brand || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const size = sizeLabel(product);
  const model = seoName
    .replace(new RegExp(`^${brand}\\s+`, "i"), "")
    .replace(size.replace("/", "/"), "")
    .replace(/\b\d{3}\s*\/?\s*\d{2}\s*R\s*\d{2}\b/i, "")
    .replace(/\b\d{2,3}[A-Z]\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
  const compact = `Купити ${[brand, model, size].filter(Boolean).join(" ")} | TireTop`;
  return metaTitle(compact);
}

function productSeoDescription(product) {
  const size = sizeLabel(product);
  const price = retailPrice(product);
  return metaDescription(`${productSeoName(product)}${size ? ` ${size}` : ""} в наявності у TireTop. Роздрібна ціна${price ? ` ${money.format(price)} грн` : " уточнюється"}, підбір під авто, самовивіз у Ковелі або доставка.`, product.brand);
}

function categorySeoTitle(category) {
  return metaTitle(`${category} в Ковелі | TireTop`);
}

function brandSeoTitle(brand) {
  return metaTitle(`${brand} шини в Ковелі | TireTop`);
}

function brandSeoDescription(brand) {
  return metaDescription(`${brand} шини у Ковелі з актуальними цінами, фото та підбором під авто. TireTop допоможе звірити розмір, сезон, рік і країну виробництва.`);
}

function categorySeoDescription(category) {
  return metaDescription(`${category} у Ковелі в каталозі TireTop. Перевіряйте фото, ціну, рік, країну виробництва та залишайте заявку онлайн.`);
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

function productReviewStructuredData(product, description) {
  return {
    "@type": "Review",
    name: `Огляд ${product.name}`,
    reviewBody: `${product.name}. ${description} Менеджер TireTop допоможе звірити розмір, сезон та сумісність з авто перед замовленням.`,
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1"
    },
    author: {
      "@type": "Organization",
      name: "TireTop"
    },
    publisher: {
      "@type": "Organization",
      name: "TireTop"
    }
  };
}

function aggregateRatingStructuredData() {
  return {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "1",
    bestRating: "5",
    worstRating: "1"
  };
}

function shippingDetailsStructuredData() {
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "UA"
    },
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: "UAH"
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY"
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY"
      }
    }
  };
}

function merchantReturnPolicyStructuredData() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "UA",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees"
  };
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
    ? `<img class="eu-label-image" src="${escapeHtml(labelCandidates[0])}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" data-label-candidates="${escapeHtml(JSON.stringify(labelCandidates))}" onerror="window.tryNextEprelLabelImage && window.tryNextEprelLabelImage(this)">`
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
      <input name="first_name" />
      <input name="last_name" />
      <input name="middle_name" />
      <input name="client_phone" />
      <input name="client_email" />
      <input name="car_or_size" />
      <input name="selected_product" />
      <input name="retail_price" />
      <input name="quantity" />
      <input name="delivery_method" />
      <input name="delivery_city" />
      <input name="delivery_branch" />
      <input name="payment_method" />
      <textarea name="comment"></textarea>
      <input name="source" />
    </form>

    <div class="order-modal" id="productOrderModal" hidden aria-modal="true" role="dialog" aria-label="Замовити шини">
      <form class="order-card" id="productOrderForm">
        <button class="order-close" id="productOrderClose" type="button" aria-label="Закрити">&times;</button>
        <div>
          <p class="eyebrow">Заявка на шини</p>
          <h2>Оформити заявку</h2>
          <div class="order-summary" id="productOrderSummary">
            <div>
              <span>Ви замовляєте</span>
              <strong id="productOrderProduct">Підбір шин менеджером</strong>
              <small id="productOrderPrice"></small>
            </div>
          </div>
        </div>
        <input id="productOrderSelectedProduct" name="selected_product" type="hidden" />
        <input id="productOrderRetailPrice" name="retail_price" type="hidden" />
        <div class="order-grid three">
          <label><span>Ім'я</span><input id="productOrderFirstName" name="first_name" type="text" autocomplete="given-name" required /></label>
          <label><span>Прізвище</span><input id="productOrderLastName" name="last_name" type="text" autocomplete="family-name" required /></label>
          <label><span>По батькові</span><input id="productOrderMiddleName" name="middle_name" type="text" /></label>
        </div>
        <div class="order-grid two">
          <label><span>Телефон</span><input id="productOrderPhone" name="client_phone" type="tel" autocomplete="tel" required /></label>
          <label><span>Email <small>необов'язково</small></span><input id="productOrderEmail" name="client_email" type="email" autocomplete="email" /></label>
        </div>
        <div class="order-grid two">
          <label><span>Авто або розмір шин</span><input id="productOrderSize" name="car_or_size" type="text" placeholder="Наприклад: 205/55 R16 або Audi A6" required /></label>
          <label><span>Кількість</span><select id="productOrderQuantity" name="quantity"><option value="4">4 шт.</option><option value="2">2 шт.</option><option value="1">1 шт.</option><option value="5+">5+ шт.</option></select></label>
        </div>
        <div class="order-grid two">
          <label><span>Доставка</span><select id="productOrderDelivery" name="delivery_method"><option value="Самовивіз">Самовивіз</option><option value="Нова Пошта">Нова Пошта</option><option value="Delivery">Delivery</option></select></label>
          <label><span>Оплата</span><select id="productOrderPayment" name="payment_method"><option value="При отриманні">При отриманні</option><option value="Передплата">Передплата</option><option value="Безготівка">Безготівка</option></select></label>
        </div>
        <div class="order-grid two">
          <label><span>Місто доставки</span><input id="productOrderCity" name="delivery_city" type="text" placeholder="Наприклад: Ковель" /></label>
          <label><span>Відділення / адреса</span><input id="productOrderBranch" name="delivery_branch" type="text" placeholder="Відділення Нової Пошти або адреса" /></label>
        </div>
        <label><span>Коментар</span><textarea id="productOrderComment" name="comment" rows="3" placeholder="Побажання, авто, час дзвінка"></textarea></label>
        <button class="order-submit" type="submit">Відправити заявку</button>
        <p class="order-status" id="productOrderStatus" hidden></p>
      </form>
    </div>`;
}

function siteFooterMarkup() {
  return `<footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="TireTop">
            <span class="brand-logo-frame">
              <img class="brand-logo" src="/tiretop-logo-light.svg" alt="TireTop" width="160" height="40" />
            </span>
            <span class="brand-copy">
              <small>Шини • Диски • Підбір</small>
            </span>
          </a>
          <p>TireTop — магазин шин для легкових авто та SUV. Підбір шин по авто, розміру та бюджету.</p>
        </div>
        <div>
          <h3>Каталог</h3>
          <a href="/catalog?season=Літо">Літні шини</a>
          <a href="/catalog?season=Зима">Зимові шини</a>
          <a href="/catalog?season=Всесезон">Всесезонні шини</a>
          <a href="/catalog?type=suv">SUV шини</a>
          <a href="/catalog?type=ev">Шини для електромобілів</a>
        </div>
        <div>
          <h3>Бренди</h3>
          <a href="/catalog?brand=Continental">Continental</a>
          <a href="/catalog?brand=Triangle">Triangle</a>
          <a href="/catalog?brand=Uniroyal">Uniroyal</a>
          <a href="/catalog?brand=Matador">Matador</a>
          <a href="/catalog?brand=Habilead">Habilead</a>
          <a href="/catalog?brand=Tercelo">Tercelo</a>
        </div>
        <div>
          <h3>Інформація</h3>
          <a href="/about/">Про нас</a>
          <a href="/delivery-payment/">Доставка і оплата</a>
          <a href="/warranty-return/">Гарантія і повернення</a>
          <a href="/reviews/">Відгуки</a>
          <a href="/contacts/">Контакти</a>
          <a href="/#selection">Підбір шин</a>
          <a href="/privacy/">Політика конфіденційності</a>
        </div>
        <div>
          <h3>Контакти</h3>
          <a href="tel:+380977879921">+38 (097) 787-99-21</a>
          <a href="${escapeHtml(CONTACTS.viber)}">Viber</a>
          <a href="${escapeHtml(CONTACTS.telegram)}" target="_blank" rel="noreferrer">Telegram</a>
          <span>Ковель</span>
          <span>Пн-Сб: 09:00-18:00</span>
          <div class="footer-socials" aria-label="Соціальні мережі">
            <a href="https://www.tiktok.com/@tire.top" target="_blank" rel="noreferrer" aria-label="TikTok"><span aria-hidden="true">♪</span></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><span aria-hidden="true">◎</span></a>
            <a href="${escapeHtml(CONTACTS.telegram)}" target="_blank" rel="noreferrer" aria-label="Telegram"><span aria-hidden="true">✈</span></a>
            <a href="${escapeHtml(CONTACTS.viber)}" aria-label="Viber"><span aria-hidden="true">☎</span></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 TireTop.store</span>
        <span>Всі права захищені.</span>
      </div>
    </footer>`;
}

function serviceTopbarMarkup() {
  return "";
}

function pageShell({ title, description, canonical, body, structuredData = "" }) {
  const finalTitle = metaTitle(title);
  const finalDescription = metaDescription(description);
  return `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(finalDescription)}" />
    <title>${escapeHtml(finalTitle)}</title>
    <link rel="canonical" href="${siteOrigin}${canonical}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://res.cloudinary.com" />
    <link rel="stylesheet" href="/styles.css" />
    ${structuredData}
  </head>
  <body class="public-site retail-page seo-static-page">
    <header class="public-header">
      <a class="brand" href="/" aria-label="TireTop">
        <span class="brand-logo-frame">
          <img class="brand-logo" src="/tiretop-logo-light.svg" alt="TireTop" width="160" height="40" />
        </span>
        <span class="brand-copy">
          <small>Шини • Диски • Підбір</small>
        </span>
      </a>
      <input class="nav-toggle" id="siteNavToggle" type="checkbox" aria-label="Відкрити меню" />
      <label class="nav-toggle-button" for="siteNavToggle" aria-hidden="true"><span></span><span></span><span></span></label>
      <nav class="public-nav" aria-label="Навігація">
        <a href="/catalog/">Каталог</a>
        <a href="/delivery-payment/">Доставка і оплата</a>
        <a href="/warranty-return/">Гарантія і повернення</a>
        <a href="/reviews/">Відгуки</a>
        <a href="/contacts/">Контакти</a>
      </nav>
      <a class="header-phone" href="tel:+380977879921">+38 (097) 787-99-21</a>
    </header>
    <main class="seo-static-main">
      ${body}
    </main>
    ${siteFooterMarkup()}
    ${staticOrderFormMarkup()}
    <script src="/product-live.js" defer></script>
    <script src="/product-order.js" defer></script>
  </body>
</html>
`;
}

function productCard(product) {
  const image = product.images[0] || fallbackImage;
  const price = retailPrice(product);
  const seasonIcon = seasonBadge(`${product.season} ${product.name}`);
  return `<article class="seo-product-card" data-width="${escapeHtml(product.width)}" data-profile="${escapeHtml(product.profile)}" data-diameter="${escapeHtml(product.diameter)}" data-season="${escapeHtml(product.season)}">
    <a class="seo-product-image" href="/tyres/${product.slug}/">
      ${seasonIcon}
      <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
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

function seasonBadge(season) {
  const value = clean(season).toLowerCase();
  if (!value) return "";
  if (value.includes("зим") || value.includes("winter")) return `<span class="season-corner-badge season-winter" title="Зима" aria-label="Зима">❄</span>`;
  if (value.includes("всес") || value.includes("all") || value.includes("m+s") || value.includes("m+s")) return `<span class="season-corner-badge season-all" title="Всесезон" aria-label="Всесезон">☀❄</span>`;
  if (value.includes("літ") || value.includes("лет") || value.includes("summer")) return `<span class="season-corner-badge season-summer" title="Літо" aria-label="Літо">☀</span>`;
  return "";
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
  if (page.slug === "contacts") {
    return `<div class="contacts-page">
      <section class="contacts-hero">
        <div>
          <span class="contacts-badge">TireTop • Ковель</span>
          <h1>Зв'яжіться з нами</h1>
          <p>Допоможемо підібрати шини під ваш автомобіль, бюджет та стиль їзди. Працюємо офлайн у Ковелі та відправляємо замовлення по всій Україні.</p>
          <div class="contacts-actions">
            <a href="tel:+380977879921" class="btn-primary">Подзвонити</a>
            <a href="https://wa.me/380977879921" target="_blank" rel="noreferrer" class="btn-secondary">Написати в WhatsApp</a>
          </div>
        </div>
        <div class="contacts-card">
          <h2>Наш магазин</h2>
          <p><strong>Місто:</strong> Ковель, Волинська область</p>
          <p><strong>Доставка:</strong> Нова Пошта / Delivery</p>
          <p><strong>Графік:</strong> уточнюйте у менеджера</p>
          <a href="https://maps.app.goo.gl/JjZGWG9iymMe9KmF7" target="_blank" rel="noreferrer">Відкрити в Google Maps</a>
        </div>
      </section>
      <section class="ukraine-delivery">
        <div class="section-title">
          <h2>Відправляємо шини по всій Україні</h2>
          <p>Наш магазин знаходиться у місті Ковель, але ваші шини можуть поїхати у будь-який регіон України.</p>
        </div>
        <div class="ukraine-map-card">
          <div class="ukraine-map">
            <div class="kovel-point"><span></span><strong>Ковель</strong></div>
            <div class="arrow arrow-kyiv">Київ</div>
            <div class="arrow arrow-lviv">Львів</div>
            <div class="arrow arrow-odesa">Одеса</div>
            <div class="arrow arrow-dnipro">Дніпро</div>
            <div class="arrow arrow-kharkiv">Харків</div>
            <div class="map-text">Доставка Новою Поштою та Delivery</div>
          </div>
        </div>
      </section>
      <section class="contact-options">
        <div class="contact-option"><h3>Швидка консультація</h3><p>Напишіть нам розмір шин або модель авто — ми підберемо оптимальний варіант.</p></div>
        <div class="contact-option"><h3>Фото та наявність</h3><p>Можемо надіслати фото шин, DOT, країну виробництва та актуальну ціну.</p></div>
        <div class="contact-option"><h3>Відправка по Україні</h3><p>Пакуємо та відправляємо замовлення перевіреними службами доставки.</p></div>
      </section>
      <section class="google-map-section">
        <div class="section-title">
          <h2>Наш офлайн магазин на карті</h2>
          <p>Приїжджайте до нас у Ковель або замовляйте доставку.</p>
        </div>
        <div class="google-map">
          <iframe title="TireTop Google Map" src="https://www.google.com/maps?q=TireTop%20%D0%9A%D0%BE%D0%B2%D0%B5%D0%BB%D1%8C&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>
    </div>`;
  }

  if (page.slug === "delivery-payment") {
    return `<section class="seo-list-hero local-seo-hero">
      <p class="eyebrow">TireTop Ковель</p>
      <h1>Доставка і оплата</h1>
      <p>Швидко відправляємо шини по Україні та допомагаємо з підбором перед покупкою.</p>
    </section>
    <section class="delivery-page-grid">
      <article class="delivery-page-card">
        <h2>Доставка по Україні</h2>
        <p>Ми відправляємо шини по всій Україні службами Нова Пошта та Delivery. Більшість замовлень відправляються в день оформлення або наступного робочого дня. Середній термін доставки — 1–3 дні залежно від регіону.</p>
      </article>
      <article class="delivery-page-card">
        <h2>Самовивіз</h2>
        <p>Доступний самовивіз із магазину TireTop у місті Ковель. Перед приїздом рекомендуємо уточнити наявність шин у менеджера.</p>
      </article>
      <article class="delivery-page-card">
        <h2>Оплата</h2>
        <p>Доступні зручні способи оплати: оплата при отриманні, оплата на банківську картку, безготівковий розрахунок для ФОП та компаній.</p>
      </article>
      <article class="delivery-page-card">
        <h2>Гарантія та повернення</h2>
        <p>Якщо товар не підійшов або виникла проблема — зв'яжіться з нами, і ми допоможемо швидко вирішити питання. Обмін та повернення можливі відповідно до законодавства України.</p>
      </article>
    </section>
    <section class="delivery-check-card">
      <h2>Перед відправкою перевіряємо</h2>
      <ul class="delivery-check-list">
        <li>розмір шин</li>
        <li>рік виробництва DOT</li>
        <li>країну виробництва</li>
        <li>стан шин</li>
        <li>комплектацію замовлення</li>
      </ul>
    </section>
    <section class="delivery-cta-card">
      <div>
        <h2>Потрібна допомога з підбором?</h2>
        <p>Наші менеджери допоможуть підібрати шини під ваш автомобіль, стиль їзди та бюджет.</p>
      </div>
      <a class="public-primary" href="/contacts/">Зв'язатися з нами</a>
    </section>`;
  }

  if (page.slug === "warranty-return") {
    return `<div class="warranty-page">
      <section class="warranty-hero">
        <h1>Гарантія і повернення</h1>
        <p>Ми перевіряємо кожне замовлення перед відправкою та допомагаємо швидко вирішувати будь-які питання.</p>
      </section>
      <section class="warranty-grid">
        <div class="warranty-card">
          <h2>Гарантія якості</h2>
          <p>Перед відправкою кожне замовлення проходить перевірку:</p>
          <ul>
            <li>відповідність розміру та моделі</li>
            <li>рік виробництва DOT</li>
            <li>країна виробництва</li>
            <li>відсутність пошкоджень</li>
            <li>комплектація замовлення</li>
          </ul>
          <p>Ми продаємо тільки нові шини від офіційних виробників та постачальників.</p>
        </div>
        <div class="warranty-card">
          <h2>Обмін та повернення</h2>
          <p>Ви можете повернути або обміняти товар відповідно до законодавства України.</p>
          <ul>
            <li>товар не був у використанні</li>
            <li>збережений товарний вигляд</li>
            <li>збережені всі етикетки та маркування</li>
            <li>товар не монтувався на диск</li>
          </ul>
        </div>
        <div class="warranty-card warning">
          <h2>Важливо знати</h2>
          <p>Перед встановленням шин рекомендуємо:</p>
          <ul>
            <li>перевірити відповідність розміру вашому автомобілю</li>
            <li>оглянути товар при отриманні</li>
            <li>переконатися, що DOT та характеристики вас влаштовують</li>
          </ul>
          <strong>Після монтажу або використання шин повернення неможливе.</strong>
        </div>
        <div class="warranty-card">
          <h2>Якщо виникла проблема</h2>
          <p>Якщо ви отримали пошкоджений товар або виникли будь-які питання — зв'яжіться з нами, і ми допоможемо швидко вирішити ситуацію.</p>
          <p>TireTop завжди на стороні клієнта та зацікавлений у довгостроковій співпраці.</p>
        </div>
      </section>
      <section class="warranty-cta">
        <h2>Потрібна допомога?</h2>
        <p>Наші менеджери допоможуть вирішити питання щодо замовлення, доставки або повернення товару.</p>
        <a href="/contacts/">Зв'язатися з нами</a>
      </section>
    </div>`;
  }

  const contactAction = page.slug === "contacts" ? `<a class="contact-phone-link" href="tel:+380977879921"><span>Телефон</span><strong>+38 (097) 787-99-21</strong></a>` : "";
  return `<section class="seo-list-hero local-seo-hero">
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.copy)}</p>
    <div class="local-seo-actions">
      ${contactAction}
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

function productVisibleReviewBlock(product) {
  const copy = modelSeoCopy(product);
  const size = sizeLabel(product);
  const name = product.name;
  return `<section class="seo-product-review">
    <div class="seo-review-main">
      <p class="eyebrow">Відгук про модель</p>
      <h2>Оцінка TireTop для ${escapeHtml(name)}</h2>
      <div class="seo-rating-line" aria-label="Оцінка 5 з 5">
        <span aria-hidden="true">★★★★★</span>
        <strong>5.0</strong>
        <small>експертна оцінка</small>
      </div>
      <p>${escapeHtml(copy.intro)}</p>
      <p>${escapeHtml(copy.support)}</p>
      <a href="/reviews/">Переглянути сторінку відгуків</a>
    </div>
    <article class="seo-review-card">
      <strong>Відгук менеджера TireTop</strong>
      <p>${escapeHtml(name)} ${size ? `у розмірі ${size} ` : ""}варто розглядати, якщо потрібна зрозуміла шина з актуальною наявністю, нормальною ціною та консультацією перед покупкою. Перед оформленням заявки ми звіряємо розмір, рік, країну і кількість.</p>
    </article>
  </section>`;
}

function productShippingReturnBlock(product) {
  const name = product.name;
  return `<section class="seo-commercial-grid">
    <article id="shipping-details">
      <p class="eyebrow">Shipping details</p>
      <h2>Доставка і оплата</h2>
      <p>${escapeHtml(name)} можна забрати самовивозом у Ковелі або оформити доставку по Україні через Нову Пошту чи Delivery. Перед відправкою менеджер підтверджує товар, кількість, ціну та спосіб оплати.</p>
      <ul>
        <li>Самовивіз у Ковелі після підтвердження заявки.</li>
        <li>Доставка Новою Поштою або Delivery за тарифами перевізника.</li>
        <li>Оплата при отриманні, передплата або безготівковий розрахунок.</li>
      </ul>
      <a class="seo-policy-link" href="/delivery-payment/">Детальніше про доставку і оплату</a>
    </article>
    <article id="return-policy">
      <p class="eyebrow">Return policy</p>
      <h2>Гарантія і повернення</h2>
      <p>Повернення або обмін шин можливі протягом 14 днів, якщо товар не був у використанні, не монтувався на диск, має товарний вигляд і збережені маркування.</p>
      <ul>
        <li>Перед поверненням потрібно зв'язатися з менеджером TireTop.</li>
        <li>Шини зі слідами монтажу або експлуатації не приймаються до повернення.</li>
        <li>Гарантійні питання розглядаються індивідуально після огляду товару.</li>
      </ul>
      <a class="seo-policy-link" href="/warranty-return/">Умови гарантії та повернення</a>
    </article>
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

function carFitmentSlug(car) {
  const year = Math.min(Number(car.yearTo) || 2025, Math.max(Number(car.yearFrom) || 2005, Math.round(((Number(car.yearFrom) || 2005) + (Number(car.yearTo) || 2025)) / 2)));
  return `${slugify(car.brand)}/${slugify(`${car.model}-${car.generation}-${year}-${car.modification}`)}`;
}

function carSizeLinks(sizes) {
  return [...new Set(sizes || [])].map((size) => `<a href="/size/${sizeSlugFromLabel(size)}/">${escapeHtml(size)}</a>`).join("");
}

function carRecommendedProducts(car) {
  const wanted = new Set([...(car.recommendedSizes || []), ...(car.optionalSizes || [])].map(sizeSlugFromLabel));
  return products
    .filter((product) => wanted.has(sizeSlug(product)) && product.stock > 0)
    .slice(0, 8);
}

function carFitmentBody(car) {
  const recommendedProducts = carRecommendedProducts(car);
  const yearText = `${car.yearFrom}-${car.yearTo}`;
  const verifiedText = car.verified
    ? "OEM-розміри перевірені для цієї модифікації."
    : "Це стартова база популярних розмірів. Перед покупкою менеджер TireTop звірить розмір з вашим авто, дисками та індексами.";

  return `<section class="car-seo-hero">
    <p class="eyebrow">Пошук шин по авто</p>
    <h1>Шини для ${escapeHtml(car.brand)} ${escapeHtml(car.model)} ${escapeHtml(car.generation)}</h1>
    <p>${escapeHtml(car.brand)} ${escapeHtml(car.model)} ${escapeHtml(car.generation)} ${escapeHtml(yearText)}, ${escapeHtml(car.modification)}. ${escapeHtml(verifiedText)}</p>
  </section>
  <section class="car-fitment-layout">
    <article class="car-fitment-card">
      <h2>Розміри шин для цього авто</h2>
      <div class="car-fitment-sizes">
        <div>
          <strong>Рекомендовані</strong>
          ${carSizeLinks(car.recommendedSizes)}
        </div>
        <div>
          <strong>Допустимі альтернативи</strong>
          ${carSizeLinks(car.optionalSizes)}
        </div>
      </div>
    </article>
    <article class="car-help-card">
      <h2>Потрібна допомога?</h2>
      <p>Якщо не впевнені у розмірі, залиште заявку. Ми звіримо розмір, сезон, індекси навантаження та швидкості.</p>
      <button class="public-primary static-order-button" type="button" data-product="Підбір шин для ${escapeHtml(car.brand)} ${escapeHtml(car.model)} ${escapeHtml(car.generation)}" data-price="" data-size="${escapeHtml(car.brand)} ${escapeHtml(car.model)} ${escapeHtml(car.generation)}">Замовити підбір</button>
    </article>
  </section>
  ${recommendedProducts.length ? `<section class="seo-similar-section">
    <div class="seo-section-title-row">
      <div>
        <p class="eyebrow">В наявності</p>
        <h2>Шини, які можуть підійти</h2>
      </div>
      <a href="/catalog/">Весь каталог</a>
    </div>
    <div class="seo-product-grid seo-similar-grid">${recommendedProducts.map(productCard).join("")}</div>
  </section>` : `<section class="car-fitment-card"><h2>Рекомендовані шини</h2><p>Після оновлення каталогу тут автоматично з'являться позиції з потрібними розмірами.</p></section>`}
  ${trustBlock()}`;
}

function productGallery(product) {
  const images = product.images.length ? product.images : [fallbackImage];
  const mainImage = images[0];
  const thumbs = images.length > 1
    ? `<div class="seo-product-thumbs" aria-label="Фото товару">${images.map((url, index) => `
        <button class="${index === 0 ? "active" : ""}" type="button" data-gallery-image="${escapeHtml(url)}" aria-label="Фото ${index + 1}: ${escapeHtml(product.name)}">
          <img src="${escapeHtml(url)}" alt="${escapeHtml(product.name)} фото ${index + 1}" loading="lazy" decoding="async" />
        </button>
      `).join("")}</div>`
    : "";

  return `<div class="seo-product-photo">
    <div class="seo-main-photo-frame">
      <img class="seo-main-product-image" src="${escapeHtml(mainImage)}" alt="${escapeHtml(product.name)}" loading="eager" fetchpriority="high" decoding="async" />
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
removeGeneratedDirectory("cars");
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
  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  const structuredData = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      brand: { "@type": "Brand", name: product.brand || "TireTop" },
      image: product.images.length ? product.images : [fallbackImage],
      description,
      aggregateRating: aggregateRatingStructuredData(),
      review: productReviewStructuredData(product, description),
      offers: {
        "@type": "Offer",
        priceCurrency: "UAH",
        price: price || undefined,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        url: `${siteOrigin}${canonical}`,
        shippingDetails: shippingDetailsStructuredData(),
        hasMerchantReturnPolicy: merchantReturnPolicyStructuredData()
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
  ${productVisibleReviewBlock(product)}
  ${productShippingReturnBlock(product)}
  ${similarProductsBlock(product)}
  ${trustBlock()}`;

  writeFile(`tyres/${product.slug}/index.html`, pageShell({ title, description, canonical, body, structuredData }));
}

for (const brandSlug of focusBrands) {
  const brandProducts = products.filter((product) => slugify(product.brand) === brandSlug && product.stock > 0);
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  const canonical = `/brand/${brandSlug}/`;
  const title = brandSeoTitle(brandName);
  const description = brandSeoDescription(brandName);
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
  const sizeProducts = products.filter((product) => sizeSlug(product) === slug && product.stock > 0);
  const canonical = `/size/${slug}/`;
  const title = categorySeoTitle(`Шини ${label}`);
  const description = categorySeoDescription(`Шини ${label}`);
  const body = `<section class="seo-list-hero">
    <p class="eyebrow">Розмір шин</p>
    <h1>Шини ${escapeHtml(label)} у Ковелі</h1>
    <p>${escapeHtml(description)}</p>
  </section>
  <section class="seo-product-grid">${sizeProducts.length ? sizeProducts.map(productCard).join("") : `<p class="retail-note">Позиції цього розміру можна додати у Google Sheets, і сторінка буде готова до оновлення.</p>`}</section>`;
  const structuredData = breadcrumb([{ name: "Головна", path: "/" }, { name: `Шини ${label}`, path: canonical }]);
  writeFile(`size/${slug}/index.html`, pageShell({ title, description, canonical, body, structuredData }));
}

for (const car of carFitments) {
  const relative = carFitmentSlug(car);
  const canonical = `/cars/${relative}/`;
  const title = categorySeoTitle(`Шини для ${car.brand} ${car.model}`);
  const description = metaDescription(`Підбір шин для ${car.brand} ${car.model} ${car.generation} ${car.yearFrom}-${car.yearTo}. Рекомендовані розміри, каталог шин у Ковелі та консультація TireTop.`);
  const structuredData = breadcrumb([
    { name: "Головна", path: "/" },
    { name: "Пошук шин по авто", path: "/#selection" },
    { name: `${car.brand} ${car.model} ${car.generation}`, path: canonical }
  ]);
  writeFile(`cars/${relative}/index.html`, pageShell({
    title,
    description,
    canonical,
    body: carFitmentBody(car),
    structuredData
  }));
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
  .replace(/<title>[\s\S]*?<\/title>/, `<title>Каталог шин — купити шини в Ковелі | TireTop</title>`)
  .replace(/<body class="public-site retail-page">/, `<body class="public-site retail-page catalog-page">`)
  .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${siteOrigin}/catalog" />`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="Каталог шин TireTop: літні, зимові та всесезонні шини для легкових авто і SUV. Підбір по розміру, бренду та бюджету." />`);
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
  ...carFitments.map((car) => `/cars/${carFitmentSlug(car)}/`),
  ...products.map((product) => `/tyres/${product.slug}/`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${siteOrigin}${url}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

fs.writeFileSync(path.join(root, "_redirects"), [
  "/catalog /catalog/index.html 200",
  "/catalog/ /catalog/index.html 200",
  "/delivery-payment /delivery-payment/index.html 200",
  "/delivery-payment/ /delivery-payment/index.html 200",
  "/warranty-return /warranty-return/index.html 200",
  "/warranty-return/ /warranty-return/index.html 200",
  "/contacts /contacts/index.html 200",
  "/contacts/ /contacts/index.html 200",
  "/reviews /reviews/index.html 200",
  "/reviews/ /reviews/index.html 200",
  "/about /about/index.html 200",
  "/about/ /about/index.html 200",
  "/privacy /privacy/index.html 200",
  "/privacy/ /privacy/index.html 200"
].join("\n") + "\n", "utf8");

console.log(`Generated ${products.length} product pages, ${focusBrands.length} brand pages, ${uniqueSizes.length} size pages, ${carFitments.length} car pages.`);
