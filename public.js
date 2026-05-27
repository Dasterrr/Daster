const publicOrderModal = document.querySelector("#publicOrderModal");
const publicOrderForm = document.querySelector("#publicOrderForm");
const publicOrderClose = document.querySelector("#publicOrderClose");
const publicOrderStatus = document.querySelector("#publicOrderStatus");
const publicOrderFirstName = document.querySelector("#publicOrderFirstName");
const publicOrderLastName = document.querySelector("#publicOrderLastName");
const publicOrderMiddleName = document.querySelector("#publicOrderMiddleName");
const publicOrderPhone = document.querySelector("#publicOrderPhone");
const publicOrderEmail = document.querySelector("#publicOrderEmail");
const publicOrderSize = document.querySelector("#publicOrderSize");
const publicOrderQuantity = document.querySelector("#publicOrderQuantity");
const publicOrderDelivery = document.querySelector("#publicOrderDelivery");
const publicOrderPayment = document.querySelector("#publicOrderPayment");
const publicOrderCity = document.querySelector("#publicOrderCity");
const publicOrderBranch = document.querySelector("#publicOrderBranch");
const publicOrderComment = document.querySelector("#publicOrderComment");
const publicOrderProduct = document.querySelector("#publicOrderProduct");
const publicOrderPrice = document.querySelector("#publicOrderPrice");
const publicOrderSelectedProduct = document.querySelector("#publicOrderSelectedProduct");
const publicOrderRetailPrice = document.querySelector("#publicOrderRetailPrice");
const retailGrid = document.querySelector("#retailGrid");
const retailNote = document.querySelector("#retailNote");
const retailMore = document.querySelector("#retailMore");
const retailRecommendations = document.querySelector("#recommendations");
const retailRecommendationRail = document.querySelector("#retailRecommendationRail");
const retailSearch = document.querySelector("#retailSearch");
const retailWidth = document.querySelector("#retailWidth");
const retailProfile = document.querySelector("#retailProfile");
const retailDiameter = document.querySelector("#retailDiameter");
const retailSeason = document.querySelector("#retailSeason");
const retailBrand = document.querySelector("#retailBrand");
const retailPriceMin = document.querySelector("#retailPriceMin");
const retailPriceMax = document.querySelector("#retailPriceMax");
const retailCountry = document.querySelector("#retailCountry");
const retailYear = document.querySelector("#retailYear");
const retailSort = document.querySelector("#retailSort");
const retailReset = document.querySelector("#retailReset");
const retailSearchButton = document.querySelector(".retail-search-button");
const productPage = document.querySelector("#productPage");
const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroSliderPrev = document.querySelector("#heroSliderPrev");
const heroSliderNext = document.querySelector("#heroSliderNext");
const heroSliderDots = document.querySelector("#heroSliderDots");

const publicFallbackImage = "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=80";
const siteOrigin = "https://tiretop.store";
const publicContacts = {
  viber: "viber://chat?number=%2B380689159643",
  telegram: "https://t.me/Nazarii_Polivoda"
};
const publicMoney = new Intl.NumberFormat("uk-UA");
const initialVisibleRows = 7;
let publicProducts = [];
let catalogExpanded = false;
let pageMode = { type: "home" };
let heroSlideIndex = 0;

function encodePublicFormData(data) {
  return new URLSearchParams(data).toString();
}

function publicToNumber(value) {
  const normalized = String(value || "").replace(/\s/g, "").replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : 0;
}

function publicParseSize(name) {
  const match = String(name || "").match(/(\d{3})\s*\/?\s*(\d{2})\s*R\s*(\d{2})(?:\s+([0-9]{2,3}[A-Z]))?/i);
  return match ? { width: match[1], profile: match[2], diameter: match[3], index: (match[4] || "").toUpperCase() } : { width: "", profile: "", diameter: "", index: "" };
}

function publicTruthy(value) {
  return ["true", "так", "yes", "1", "y", "+"].includes(String(value || "").trim().toLowerCase());
}

function publicEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicImageUrls(value) {
  const urls = String(value || "")
    .split(/\r?\n|\s*,\s*(?=https?:\/\/)/)
    .map((url) => String(url || "").trim())
    .filter((url) => url.startsWith("https://"));

  return [...new Set(urls)];
}

function publicProductName(product) {
  return product.name || `${product.brand} ${product.model || ""}`.trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function productSlug(product) {
  return slugify(publicProductName(product).replace(/\s*\/\s*/g, "-"));
}

function sizeSlug(product) {
  return product.width && product.profile && product.diameter ? `${product.width}-${product.profile}-r${product.diameter}`.toLowerCase() : "";
}

function sizeLabel(product) {
  return product.width && product.profile && product.diameter ? `${product.width}/${product.profile} R${product.diameter}` : "";
}

function normalizedSizeSearch(value) {
  const match = String(value || "").toLowerCase().match(/(\d{3})\D*(\d{2})\D*(?:r)?\D*(\d{2})/);
  return match ? `${match[1]}-${match[2]}-r${match[3]}` : "";
}

function normalizeCatalogSeason(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text || text === "all") return "all";
  if (["summer", "літо", "lito"].includes(text)) return "Літо";
  if (["winter", "зима", "zyma"].includes(text)) return "Зима";
  if (["allseason", "all-season", "всесезон", "всесезонні"].includes(text)) return "Всесезон";
  return value;
}

function setSelectValue(select, value) {
  if (!select || value === undefined || value === null || value === "") return;
  const normalized = String(value).trim().toLowerCase();
  const option = [...select.options].find((item) => item.value.toLowerCase() === normalized || item.textContent.toLowerCase() === normalized);
  if (option) select.value = option.value;
}

function publicTrimMeta(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max - 3)}...`;
}

function publicMetaTitle(value) {
  const title = String(value || "").replace(/\s+/g, " ").trim();
  return publicTrimMeta(title, 65);
}

function publicMetaDescription(value) {
  let text = String(value || "").replace(/\s+/g, " ").trim();
  while (text.length < 120) {
    text += " Консультація, самовивіз у Ковелі та доставка по Україні.";
  }
  return publicTrimMeta(text, 160);
}

function productDescription(product) {
  const name = publicProductName(product);
  const size = sizeLabel(product);
  return `${name}${size ? ` (${size})` : ""} - ${product.season || "шини"} для щоденної їзди. Рік ${product.year || "уточнюється"}, країна виробництва: ${product.country || "уточнюється"}.`;
}

function retailPrice(product) {
  const retail = publicToNumber(product.retail_price);
  const base = publicToNumber(product.price);
  return retail || (base ? Math.round(base * 1.05) : 0);
}

function tyreLabelDetailsUrl(product) {
  return product.eprelUrl || "/eu-tyre-label/";
}

function publicSeasonBadge(season) {
  const value = String(season || "").trim().toLowerCase();
  if (!value) return "";
  if (value.includes("зим") || value.includes("winter")) return `<span class="season-corner-badge season-winter" title="Зима" aria-label="Зима">❄</span>`;
  if (value.includes("всес") || value.includes("all") || value.includes("m+s")) return `<span class="season-corner-badge season-all" title="Всесезон" aria-label="Всесезон">☀❄</span>`;
  if (value.includes("літ") || value.includes("лет") || value.includes("summer")) return `<span class="season-corner-badge season-summer" title="Літо" aria-label="Літо">☀</span>`;
  return "";
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

function productReviewStructuredData(product) {
  const name = publicProductName(product);
  return {
    "@type": "Review",
    name: `Огляд ${name}`,
    reviewBody: `${name}. ${productDescription(product)} Менеджер TireTop допоможе звірити розмір, сезон та сумісність з авто перед замовленням.`,
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

function euClassRows(label, activeClass) {
  return ["A", "B", "C", "D", "E"].map((item) => `
    <span class="eu-class-row ${item === activeClass ? "active" : ""}">
      <b>${item}</b>
    </span>
  `).join("");
}

function tyreLabelBlock(product) {
  const name = publicProductName(product);
  const hasLabelData = product.fuelClass || product.wetGripClass || product.noiseDb || product.noiseClass || product.snowGrip || product.iceGrip || product.labelImageUrl || product.eprelUrl;
  const detailsUrl = tyreLabelDetailsUrl(product);
  const target = product.eprelUrl ? ` target="_blank" rel="noreferrer"` : "";
  const imageAlt = `Маркування ЄС ${name}`;

  if (!hasLabelData) {
    return `
      <section class="eu-label-block eu-label-empty">
        <div>
          <p class="eyebrow">Маркування шин ЄС</p>
          <h2>Дані маркування уточнюються</h2>
          <p>Для цієї позиції ще не додано клас економії пального, зчеплення на мокрому та шум. Дані можна внести в Google Sheets або імпортувати від постачальника.</p>
        </div>
        <a class="eu-label-link" href="/eu-tyre-label/">Детальніше про маркування шин ЄС</a>
      </section>
    `;
  }

  const visual = product.labelImageUrl
    ? `<img class="eu-label-image" src="${publicEscape(product.labelImageUrl)}" alt="${publicEscape(imageAlt)}" loading="lazy" decoding="async">`
    : `<div class="eu-label-card" role="img" aria-label="${publicEscape(imageAlt)}">
        <div>
          <span>Економія пального</span>
          <div class="eu-class-scale">${euClassRows("fuel", product.fuelClass || "")}</div>
        </div>
        <div>
          <span>Зчеплення на мокрому</span>
          <div class="eu-class-scale wet">${euClassRows("wet", product.wetGripClass || "")}</div>
        </div>
        <div class="eu-noise">
          <span>Зовнішній шум</span>
          <strong>${product.noiseDb ? `${publicEscape(product.noiseDb)} dB` : "н/д"}</strong>
          ${product.noiseClass ? `<small>Клас ${publicEscape(product.noiseClass)}</small>` : ""}
        </div>
      </div>`;

  return `
    <section class="eu-label-block">
      <div class="eu-label-copy">
        <p class="eyebrow">Маркування шин ЄС</p>
        <h2>Економія, мокре зчеплення та шум</h2>
        <div class="eu-label-metrics">
          <span><b>${publicEscape(product.fuelClass || "н/д")}</b> економія пального</span>
          <span><b>${publicEscape(product.wetGripClass || "н/д")}</b> мокре зчеплення</span>
          <span><b>${product.noiseDb ? `${publicEscape(product.noiseDb)} dB` : "н/д"}</b> шум${product.noiseClass ? `, клас ${publicEscape(product.noiseClass)}` : ""}</span>
        </div>
        <div class="eu-label-icons">
          ${product.snowGrip ? `<span>3PMSF</span>` : ""}
          ${product.iceGrip ? `<span>Ice Grip</span>` : ""}
          ${product.eprelId ? `<span>EPREL ${publicEscape(product.eprelId)}</span>` : ""}
        </div>
        <a class="eu-label-link" href="${publicEscape(detailsUrl)}"${target}>Детальніше про маркування шин ЄС</a>
      </div>
      <div class="eu-label-visual">${visual}</div>
    </section>
  `;
}

function publicAvailability(stock) {
  if (stock <= 0) return { text: "Під замовлення", className: "order" };
  if (stock <= 4) return { text: `Залишок ${stock} шт.`, className: "low" };
  return { text: `В наявності ${stock} шт.`, className: "ready" };
}

function publicProductsFromGoogleTable(table) {
  const headers = table.cols.map((column) => column.label || column.id);

  return table.rows.map((row, index) => {
    const data = {};

    headers.forEach((header, cellIndex) => {
      const cell = row.c[cellIndex];
      data[header] = cell?.f ?? cell?.v ?? "";
    });

    const name = data.product_name || data.name || "";
    const size = publicParseSize(name);

    return {
      id: index + 1,
      brand: data.brand || "",
      name,
      width: size.width,
      profile: size.profile,
      diameter: size.diameter,
      load_speed_index: size.index,
      season: data.season || "",
      year: publicToNumber(data.year),
      country: data.country || "",
      stock: publicToNumber(data.stock),
      price: publicToNumber(data.price),
      retail_price: publicToNumber(data.retail_price),
      images: publicImageUrls(data.image_url),
      recommended: publicTruthy(data.recommended),
      recommendation_order: publicToNumber(data.recommendation_order),
      recommendation_label: data.recommendation_label || "",
      fuelClass: (data.fuelClass || data.fuel_class || "").toString().trim().toUpperCase(),
      wetGripClass: (data.wetGripClass || data.wet_grip_class || "").toString().trim().toUpperCase(),
      noiseDb: publicToNumber(data.noiseDb || data.noise_db),
      noiseClass: (data.noiseClass || data.noise_class || "").toString().trim().toUpperCase(),
      snowGrip: publicTruthy(data.snowGrip || data.snow_grip),
      iceGrip: publicTruthy(data.iceGrip || data.ice_grip),
      eprelId: data.eprelId || data.eprel_id || "",
      eprelUrl: data.eprelUrl || data.eprel_url || "",
      labelImageUrl: data.labelImageUrl || data.label_image_url || ""
    };
  }).filter((product) => publicProductName(product));
}

function publicProductsFromFallback() {
  const fallbackProducts = Array.isArray(window.TIRETOP_PRODUCT_CACHE)
    ? window.TIRETOP_PRODUCT_CACHE
    : (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS) ? PRODUCTS : []);

  if (!fallbackProducts.length) return [];

  return fallbackProducts.map((product, index) => {
    const name = product.name || product.product_name || "";
    const size = publicParseSize(name);

    return {
      id: product.id || index + 1,
      brand: product.brand || "",
      name,
      width: product.width || size.width,
      profile: product.profile || size.profile,
      diameter: product.diameter || size.diameter,
      load_speed_index: product.load_speed_index || size.index,
      season: product.season || "",
      year: publicToNumber(product.year),
      country: product.country || "",
      stock: publicToNumber(product.stock),
      price: publicToNumber(product.price),
      retail_price: publicToNumber(product.retail_price) || Math.round(publicToNumber(product.price) * 1.05),
      images: publicImageUrls(product.image_url || product.image),
      recommended: Boolean(product.recommended),
      recommendation_order: publicToNumber(product.recommendation_order),
      recommendation_label: product.recommendation_label || "",
      fuelClass: (product.fuelClass || product.fuel_class || "").toString().trim().toUpperCase(),
      wetGripClass: (product.wetGripClass || product.wet_grip_class || "").toString().trim().toUpperCase(),
      noiseDb: publicToNumber(product.noiseDb || product.noise_db),
      noiseClass: (product.noiseClass || product.noise_class || "").toString().trim().toUpperCase(),
      snowGrip: Boolean(product.snowGrip || product.snow_grip),
      iceGrip: Boolean(product.iceGrip || product.ice_grip),
      eprelId: product.eprelId || product.eprel_id || "",
      eprelUrl: product.eprelUrl || product.eprel_url || "",
      labelImageUrl: product.labelImageUrl || product.label_image_url || ""
    };
  }).filter((product) => publicProductName(product));
}

async function loadPublicProducts() {
  const fallbackProducts = publicProductsFromFallback();
  if (fallbackProducts.length) {
    publicProducts = fallbackProducts;
  }

  try {
    if (typeof loadSheetWithJsonp !== "function" || typeof sheetConfig === "undefined") {
      throw new Error("Google Sheets loader is not available");
    }

    const sheetProducts = publicProductsFromGoogleTable(await loadSheetWithJsonp(sheetConfig.sheetName, "publicProductsLoaded"));
    if (sheetProducts.length) {
      publicProducts = sheetProducts;
    }
  } catch (error) {
    console.warn("Using public product fallback:", error);
    if (!publicProducts.length) {
      publicProducts = fallbackProducts;
    }
  }
}

function fillPublicSelect(select, values, suffix = "") {
  if (!select) return;
  select.querySelectorAll("option:not([value='all'])").forEach((option) => option.remove());

  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${value}${suffix}`;
    select.append(option);
  }
}

function initRetailFilters() {
  const inStockProducts = publicProducts.filter((product) => product.stock > 0);
  const source = inStockProducts.length ? inStockProducts : publicProducts;
  const widths = [...new Set(source.map((product) => product.width).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const profiles = [...new Set(source.map((product) => product.profile).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const diameters = [...new Set(source.map((product) => product.diameter).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const seasons = [...new Set(source.map((product) => product.season).filter(Boolean))].sort();
  const brands = [...new Set(source.map((product) => product.brand).filter(Boolean))].sort();
  const countries = [...new Set(source.map((product) => product.country).filter(Boolean))].sort();
  const years = [...new Set(source.map((product) => product.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

  fillPublicSelect(retailWidth, widths);
  fillPublicSelect(retailProfile, profiles);
  fillPublicSelect(retailDiameter, diameters, '"');
  fillPublicSelect(retailSeason, seasons);
  fillPublicSelect(retailBrand, brands);
  fillPublicSelect(retailCountry, countries);
  fillPublicSelect(retailYear, years);
}

function filteredPublicProducts() {
  const query = retailSearch.value.trim().toLowerCase();
  const width = retailWidth.value;
  const profile = retailProfile.value;
  const diameter = retailDiameter.value;
  const season = retailSeason.value;
  const brand = retailBrand.value;
  const country = retailCountry?.value || "all";
  const year = retailYear?.value || "all";
  const minPrice = publicToNumber(retailPriceMin?.value);
  const maxPrice = publicToNumber(retailPriceMax?.value);
  const sort = retailSort?.value || "default";
  const sizeQuery = normalizedSizeSearch(query);

  return publicProducts.filter((product) => {
    const name = publicProductName(product);
    const price = retailPrice(product);
    const searchable = `${name} ${product.brand} ${product.model || ""} ${product.season} ${product.country} ${product.year}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query) || (sizeQuery && sizeSlug(product) === sizeQuery);

    return matchesQuery
      && (width === "all" || product.width === width)
      && (profile === "all" || product.profile === profile)
      && (diameter === "all" || product.diameter === diameter)
      && (season === "all" || product.season === season)
      && (brand === "all" || product.brand === brand)
      && (country === "all" || product.country === country)
      && (year === "all" || String(product.year) === String(year))
      && (!minPrice || price >= minPrice)
      && (!maxPrice || price <= maxPrice)
      && product.stock > 0
      && (pageMode.type !== "brand" || slugify(product.brand) === pageMode.value)
      && (pageMode.type !== "size" || sizeSlug(product) === pageMode.value);
  }).sort((a, b) => {
    if (sort === "price-asc") return retailPrice(a) - retailPrice(b);
    if (sort === "price-desc") return retailPrice(b) - retailPrice(a);
    if (sort === "brand") return `${a.brand} ${publicProductName(a)}`.localeCompare(`${b.brand} ${publicProductName(b)}`, "uk");
    if (sort === "year-desc") return Number(b.year || 0) - Number(a.year || 0);
    if (a.stock > 0 && b.stock <= 0) return -1;
    if (a.stock <= 0 && b.stock > 0) return 1;
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    return publicProductName(a).localeCompare(publicProductName(b), "uk");
  });
}

function recommendedPublicProducts() {
  return publicProducts
    .filter((product) => product.recommended)
    .sort((a, b) => (a.recommendation_order || 9999) - (b.recommendation_order || 9999));
}

function visibleColumns() {
  if (window.matchMedia("(max-width: 620px)").matches) return 1;
  if (window.matchMedia("(max-width: 920px)").matches) return 2;
  return 4;
}

function initialVisibleCount() {
  return initialVisibleRows * visibleColumns();
}

function retailCard(product, options = {}) {
  const image = product.images[0] || publicFallbackImage;
  const name = publicProductName(product);
  const price = retailPrice(product);
  const size = [product.width, product.profile, product.diameter ? `R${product.diameter}` : ""].filter(Boolean).join("/");
  const badge = product.recommendation_label || (product.recommended ? "Рекомендація" : product.season || "TireTop");
  const seasonIcon = publicSeasonBadge(`${product.season} ${name}`);
  const detailsUrl = `/tyres/${publicEscape(productSlug(product))}/`;
  const message = `Добрий день. Цікавить ${name}. Є в наявності?`;
  const encodedMessage = encodeURIComponent(message);
  const viberUrl = `viber://forward?text=${encodedMessage}`;
  const telegramUrl = `${publicContacts.telegram}?text=${encodedMessage}`;

  return `
    <article class="retail-card ${options.recommended ? "retail-recommended-card" : ""}">
      <a class="retail-image retail-image-link" href="${detailsUrl}" aria-label="${publicEscape(name)}">
        ${seasonIcon}
        <img src="${publicEscape(image)}" alt="${publicEscape(name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${publicFallbackImage}'">
        <span class="retail-badge">${publicEscape(badge)}</span>
      </a>
      <div class="retail-body">
        <div class="retail-title-row">
          <p class="retail-brand">${publicEscape(product.brand || "TireTop")}</p>
          <strong class="retail-price">${price ? `${publicEscape(publicMoney.format(price))} грн` : "Ціну уточнюйте"}</strong>
        </div>
        <h3><a href="${detailsUrl}">${publicEscape(name)}</a></h3>
        <div class="retail-meta">
          <span>${publicEscape(product.season || "Сезон уточнюйте")}</span>
          <span>${product.year ? publicEscape(product.year) : "Рік уточнюйте"}</span>
          <span>${publicEscape(product.country || "Країна уточнюється")}</span>
          ${product.load_speed_index ? `<span>${publicEscape(product.load_speed_index)}</span>` : ""}
        </div>
        <div class="retail-card-actions">
          <a class="retail-details-link" href="/tyres/${publicEscape(productSlug(product))}/">Детальніше</a>
          <div class="retail-card-links">
            <a href="${publicEscape(viberUrl)}" target="_blank" rel="noreferrer">Viber</a>
            <a href="${publicEscape(telegramUrl)}" target="_blank" rel="noreferrer">Telegram</a>
            </div>
        </div>
        <button class="retail-order public-order-button" type="button" data-product="${publicEscape(name)}" data-price="${publicEscape(price)}" data-size="${publicEscape(size || name)}">Замовити</button>
      </div>
    </article>
  `;
}

function renderRetailRecommendations() {
  if (!retailRecommendations || !retailRecommendationRail) return;

  const recommendations = recommendedPublicProducts();
  retailRecommendations.hidden = recommendations.length === 0;
  retailRecommendationRail.innerHTML = recommendations.map((product) => retailCard(product, { recommended: true })).join("");
  attachPublicOrderButtons();
}

function renderRetailCatalog() {
  if (!retailGrid) return;

  const products = filteredPublicProducts();
  const visibleLimit = pageMode.type === "catalog" ? products.length : initialVisibleCount();
  const visibleProducts = catalogExpanded ? products : products.slice(0, visibleLimit);

  retailGrid.innerHTML = visibleProducts.length
    ? visibleProducts.map((product) => retailCard(product)).join("")
    : `<div class="retail-empty-state">
        <h3>За цими параметрами шин не знайдено.</h3>
        <p>Напишіть нам — підберемо варіанти вручну.</p>
        <a class="public-primary" href="viber://chat?number=%2B380689159643">Написати в Viber</a>
      </div>`;
  retailNote.textContent = products.length
    ? "Фото можна змінювати у Google Sheets через колонку image_url. Роздрібна ціна береться з колонки retail_price."
    : "За такими фільтрами нічого не знайдено. Спробуйте скинути фільтри або залиште заявку на підбір.";
  retailMore.hidden = pageMode.type === "catalog" || catalogExpanded || products.length <= visibleLimit;

  attachPublicOrderButtons();
}

function detectPageMode() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] === "catalog") return { type: "catalog" };
  if (parts[0] === "brand" && parts[1]) return { type: "brand", value: parts[1] };
  if (parts[0] === "size" && parts[1]) return { type: "size", value: parts[1].toLowerCase() };
  if (parts[0] === "tyres" && parts[1]) return { type: "product", value: parts[1] };

  return { type: "home" };
}

function setMeta(title, description, path = window.location.pathname) {
  document.title = publicMetaTitle(title);

  let metaDescription = document.querySelector("meta[name='description']");
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    document.head.append(metaDescription);
  }
  metaDescription.content = publicMetaDescription(description);

  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = `${siteOrigin}${path === "/" ? "/" : path}`;
}

function addJsonLd(id, data) {
  let script = document.querySelector(`#${id}`);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data);
}

function breadcrumbJsonLd(items) {
  addJsonLd("breadcrumb-jsonld", {
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

function setLocalBusinessJsonLd() {
  addJsonLd("localbusiness-jsonld", {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "TireTop",
    url: siteOrigin,
    areaServed: "Ковель",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ковель",
      addressCountry: "UA"
    },
    hasMap: "https://maps.app.goo.gl/aqwxs6KGZnPAjRuq8",
    sameAs: [
      "https://maps.app.goo.gl/aqwxs6KGZnPAjRuq8",
      "https://www.tiktok.com/@tire.top"
    ],
    description: "TireTop - підбір, продаж і консультація по шинах у Ковелі з доставкою по Україні."
  });
}

function applyCatalogUrlFilters() {
  if (pageMode.type !== "catalog") return;

  const params = new URLSearchParams(window.location.search);
  const size = params.get("size");
  const sizeParts = size?.match(/^(\d{3})-(\d{2})-r(\d{2})$/i);

  setSelectValue(retailBrand, params.get("brand"));
  setSelectValue(retailSeason, normalizeCatalogSeason(params.get("season")));
  if (sizeParts) {
    setSelectValue(retailWidth, sizeParts[1]);
    setSelectValue(retailProfile, sizeParts[2]);
    setSelectValue(retailDiameter, sizeParts[3]);
  } else {
    setSelectValue(retailWidth, params.get("width"));
    setSelectValue(retailProfile, params.get("profile"));
    setSelectValue(retailDiameter, params.get("diameter"));
  }
  setSelectValue(retailCountry, params.get("country"));
  setSelectValue(retailYear, params.get("year") || params.get("dot"));
  if (retailPriceMin && params.get("priceMin")) retailPriceMin.value = params.get("priceMin");
  if (retailPriceMax && params.get("priceMax")) retailPriceMax.value = params.get("priceMax");
  if (retailSearch && (params.get("q") || params.get("search"))) retailSearch.value = params.get("q") || params.get("search");
  setSelectValue(retailSort, params.get("sort"));
}

function updateCatalogUrlFilters() {
  if (pageMode.type !== "catalog") return;

  const params = new URLSearchParams();
  if (retailSearch.value.trim()) params.set("q", retailSearch.value.trim());
  if (retailBrand.value !== "all") params.set("brand", retailBrand.value);
  if (retailSeason.value !== "all") params.set("season", retailSeason.value);
  if (retailWidth.value !== "all") params.set("width", retailWidth.value);
  if (retailProfile.value !== "all") params.set("profile", retailProfile.value);
  if (retailDiameter.value !== "all") params.set("diameter", retailDiameter.value);
  if (retailCountry?.value && retailCountry.value !== "all") params.set("country", retailCountry.value);
  if (retailYear?.value && retailYear.value !== "all") params.set("year", retailYear.value);
  if (retailPriceMin?.value) params.set("priceMin", retailPriceMin.value);
  if (retailPriceMax?.value) params.set("priceMax", retailPriceMax.value);
  if (retailSort?.value && retailSort.value !== "default") params.set("sort", retailSort.value);

  const query = params.toString();
  window.history.replaceState({}, "", query ? `/catalog?${query}` : "/catalog");
}

function setProductJsonLd(product) {
  const name = publicProductName(product);
  const price = retailPrice(product);
  addJsonLd("product-jsonld", {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: product.brand || "TireTop" },
    image: product.images.length ? product.images : [publicFallbackImage],
    description: productDescription(product),
    aggregateRating: aggregateRatingStructuredData(),
    review: productReviewStructuredData(product),
    offers: {
      "@type": "Offer",
      priceCurrency: "UAH",
      price: price || undefined,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${siteOrigin}/tyres/${productSlug(product)}/`,
      shippingDetails: shippingDetailsStructuredData(),
      hasMerchantReturnPolicy: merchantReturnPolicyStructuredData()
    },
    additionalProperty: tyreLabelAdditionalProperties(product)
  });
}

function productBySlug(slug) {
  return publicProducts.find((product) => productSlug(product) === slug);
}

function renderProductPage(product) {
  if (!productPage || !product) return;

  const name = publicProductName(product);
  const price = retailPrice(product);
  const image = product.images[0] || publicFallbackImage;
  const message = encodeURIComponent(`Добрий день. Цікавить ${name}. Є в наявності?`);
  productPage.hidden = false;
  productPage.innerHTML = `
    <article class="product-detail">
      <div class="product-detail-image">
        <img src="${publicEscape(image)}" alt="${publicEscape(name)}" loading="lazy" decoding="async">
      </div>
      <div class="product-detail-body">
        <p class="eyebrow">${publicEscape(product.brand || "TireTop")}</p>
        <h1>${publicEscape(name)}</h1>
        <strong class="retail-price">${price ? `${publicEscape(publicMoney.format(price))} грн` : "Ціну уточнюйте"}</strong>
        <p>${publicEscape(productDescription(product))}</p>
        <div class="retail-meta">
          <span>${publicEscape(product.season || "Сезон уточнюйте")}</span>
          <span>${sizeLabel(product) || "Розмір уточнюйте"}</span>
          ${product.load_speed_index ? `<span>${publicEscape(product.load_speed_index)}</span>` : ""}
          <span>рік ${product.year || "уточнюйте"}</span>
          <span>${publicEscape(product.country || "Країна уточнюється")}</span>
          <span>${product.stock > 0 ? `В наявності ${product.stock} шт.` : "Під замовлення"}</span>
        </div>
        <div class="retail-card-links">
          <a href="viber://forward?text=${message}" target="_blank" rel="noreferrer">Viber</a>
          <a href="${publicEscape(publicContacts.telegram)}?text=${message}" target="_blank" rel="noreferrer">Telegram</a>
        </div>
        <button class="public-primary public-order-button" type="button" data-product="${publicEscape(name)}" data-price="${publicEscape(price)}">Замовити</button>
      </div>
    </article>
    ${tyreLabelBlock(product)}
  `;
  setProductJsonLd(product);
  breadcrumbJsonLd([
    { name: "Головна", path: "/" },
    { name: "Каталог", path: "/catalog/" },
    { name, path: `/tyres/${productSlug(product)}/` }
  ]);
}

function applyPageMode() {
  pageMode = detectPageMode();
  const titleBase = "TireTop";
  document.body.classList.toggle("catalog-page", pageMode.type === "catalog");
  document.body.classList.toggle("product-page", pageMode.type === "product");
  document.body.classList.toggle("brand-page", pageMode.type === "brand");
  document.body.classList.toggle("size-page", pageMode.type === "size");

  if (pageMode.type === "brand") {
    const brand = pageMode.value.charAt(0).toUpperCase() + pageMode.value.slice(1);
    setMeta(`${brand} шини в Ковелі | ${titleBase}`, `${brand} шини у Ковелі з актуальними цінами, фото та підбором під авто. TireTop допоможе звірити розмір, сезон і доставку.`, `/brand/${pageMode.value}/`);
    breadcrumbJsonLd([{ name: "Головна", path: "/" }, { name: `Шини ${brand}`, path: `/brand/${pageMode.value}/` }]);
  } else if (pageMode.type === "size") {
    const label = pageMode.value.replace(/-/g, " ").replace("r", "R").toUpperCase();
    const sizeParts = pageMode.value.match(/^(\d{3})-(\d{2})-r(\d{2})$/);
    if (sizeParts) {
      retailWidth.value = sizeParts[1];
      retailProfile.value = sizeParts[2];
      retailDiameter.value = sizeParts[3];
    }
    setMeta(`Шини ${label} в Ковелі | ${titleBase}`, `Шини ${label} у Ковелі в каталозі TireTop. Перевіряйте фото, ціну, рік, країну виробництва та залишайте заявку онлайн.`, `/size/${pageMode.value}/`);
    breadcrumbJsonLd([{ name: "Головна", path: "/" }, { name: `Шини ${label}`, path: `/size/${pageMode.value}/` }]);
  } else if (pageMode.type === "product") {
    const product = productBySlug(pageMode.value);
    if (product) {
      const name = publicProductName(product);
      setMeta(`Купити ${name} | ${titleBase}`, `${name} в наявності у TireTop. Роздрібна ціна, фото, підбір під авто, самовивіз у Ковелі або доставка по Україні.`, `/tyres/${pageMode.value}/`);
      renderProductPage(product);
    }
  } else if (pageMode.type === "catalog") {
    applyCatalogUrlFilters();
    catalogExpanded = true;
    setMeta(`Каталог шин — купити шини в Ковелі | ${titleBase}`, "Каталог шин TireTop: літні, зимові та всесезонні шини для легкових авто і SUV. Підбір по розміру, бренду та бюджету.", "/catalog");
    breadcrumbJsonLd([{ name: "Головна", path: "/" }, { name: "Каталог", path: "/catalog/" }]);
  } else {
    setMeta(`Шини в Ковелі | ${titleBase}`, "Шини у Ковелі з актуальними цінами, фото та підбором під авто. TireTop допоможе звірити розмір, сезон і доставку по Україні.", "/");
    setLocalBusinessJsonLd();
    breadcrumbJsonLd([{ name: "Головна", path: "/" }]);
  }
}

function openPublicOrderModal(productName = "", price = "") {
  publicOrderStatus.hidden = true;
  publicOrderStatus.textContent = "";
  publicOrderSelectedProduct.value = productName;
  publicOrderRetailPrice.value = price;
  publicOrderProduct.textContent = productName || "Підбір шин менеджером";
  publicOrderPrice.textContent = price ? `${publicMoney.format(Number(price))} грн` : "Менеджер уточнить ціну та наявність";
  publicOrderSize.value = productName;
  publicOrderModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closePublicOrderModal() {
  publicOrderModal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function submitPublicOrder(event) {
  event.preventDefault();

  const submitButton = publicOrderForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Відправляю...";
  publicOrderStatus.hidden = true;

  const payload = {
    "form-name": "public-order",
    email: "tiretop94@gmail.com",
    subject: publicOrderSelectedProduct.value ? `Роздрібне замовлення: ${publicOrderSelectedProduct.value}` : "Заявка з роздрібного сайту TireTop",
    client_name: [publicOrderLastName.value, publicOrderFirstName.value, publicOrderMiddleName.value].filter(Boolean).join(" "),
    first_name: publicOrderFirstName.value,
    last_name: publicOrderLastName.value,
    middle_name: publicOrderMiddleName.value,
    client_phone: publicOrderPhone.value,
    client_email: publicOrderEmail.value,
    car_or_size: publicOrderSize.value,
    selected_product: publicOrderSelectedProduct.value,
    retail_price: publicOrderRetailPrice.value,
    quantity: publicOrderQuantity.value,
    delivery_method: publicOrderDelivery.value,
    delivery_city: publicOrderCity.value,
    delivery_branch: publicOrderBranch.value,
    payment_method: publicOrderPayment.value,
    comment: publicOrderComment.value,
    source: "retail-site"
  };

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodePublicFormData(payload)
    });

    publicOrderStatus.textContent = "Заявку відправлено. Менеджер зв'яжеться з вами.";
    publicOrderStatus.className = "order-status success";
    publicOrderStatus.hidden = false;
    publicOrderForm.reset();
    publicOrderSelectedProduct.value = "";
    publicOrderRetailPrice.value = "";
  } catch (error) {
    console.warn("Public order submit failed:", error);
    publicOrderStatus.textContent = "Не вдалося відправити заявку. Спробуйте ще раз.";
    publicOrderStatus.className = "order-status error";
    publicOrderStatus.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Відправити заявку";
  }
}

function attachPublicOrderButtons() {
  document.querySelectorAll(".public-order-button").forEach((button) => {
    if (button.dataset.orderReady === "true") return;

    button.dataset.orderReady = "true";
    button.addEventListener("click", () => {
      openPublicOrderModal(button.dataset.product || "", button.dataset.price || "");
    });
  });
}

function showHeroSlide(index) {
  if (!heroSlides.length) return;

  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === heroSlideIndex);
  });
  heroSliderDots?.querySelectorAll("button").forEach((button, dotIndex) => {
    button.classList.toggle("active", dotIndex === heroSlideIndex);
  });
}

function initHeroSlider() {
  if (!heroSlides.length || !heroSliderDots) return;

  heroSliderDots.innerHTML = heroSlides.map((_, index) => `<button type="button" aria-label="Банер ${index + 1}"></button>`).join("");
  heroSliderDots.querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => showHeroSlide(index));
  });
  heroSliderPrev?.addEventListener("click", () => showHeroSlide(heroSlideIndex - 1));
  heroSliderNext?.addEventListener("click", () => showHeroSlide(heroSlideIndex + 1));
  showHeroSlide(0);
}

function resetRetailFilters() {
  retailSearch.value = "";
  retailWidth.value = "all";
  retailProfile.value = "all";
  retailDiameter.value = "all";
  retailSeason.value = "all";
  retailBrand.value = "all";
  if (retailPriceMin) retailPriceMin.value = "";
  if (retailPriceMax) retailPriceMax.value = "";
  if (retailCountry) retailCountry.value = "all";
  if (retailYear) retailYear.value = "all";
  if (retailSort) retailSort.value = "default";
  catalogExpanded = false;
  updateCatalogUrlFilters();
  renderRetailCatalog();
}

attachPublicOrderButtons();
initHeroSlider();
publicOrderClose.addEventListener("click", closePublicOrderModal);
publicOrderModal.addEventListener("click", (event) => {
  if (event.target === publicOrderModal) closePublicOrderModal();
});
publicOrderForm.addEventListener("submit", submitPublicOrder);
document.addEventListener("keydown", (event) => {
  if (!publicOrderModal.hidden && event.key === "Escape") closePublicOrderModal();
});

[retailSearch, retailWidth, retailProfile, retailDiameter, retailSeason, retailBrand, retailPriceMin, retailPriceMax, retailCountry, retailYear, retailSort].filter(Boolean).forEach((element) => {
  element.addEventListener("input", () => {
    catalogExpanded = false;
    updateCatalogUrlFilters();
    renderRetailCatalog();
  });
  element.addEventListener("change", () => {
    catalogExpanded = false;
    updateCatalogUrlFilters();
    renderRetailCatalog();
  });
});
retailReset.addEventListener("click", resetRetailFilters);
retailSearchButton?.addEventListener("click", () => {
  catalogExpanded = false;
  updateCatalogUrlFilters();
  renderRetailCatalog();
  retailGrid?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
retailMore.addEventListener("click", () => {
  catalogExpanded = true;
  renderRetailCatalog();
});
window.addEventListener("resize", () => {
  if (!catalogExpanded) renderRetailCatalog();
});

const cachedPublicProducts = publicProductsFromFallback();
if (cachedPublicProducts.length) {
  publicProducts = cachedPublicProducts;
  initRetailFilters();
  applyPageMode();
  renderRetailRecommendations();
  renderRetailCatalog();
}

loadPublicProducts().then(() => {
  initRetailFilters();
  applyPageMode();
  renderRetailRecommendations();
  renderRetailCatalog();
});
