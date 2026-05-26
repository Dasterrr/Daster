const liveSheetId = "1iRwP1c107v_MvdKUGUssmNEyvJpC42mXdqPVoZ0G_9s";
const liveSheetGid = "1919536480";
const liveFallbackImage = "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=80";

function liveEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function liveToNumber(value) {
  const number = Number.parseFloat(String(value || "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function liveTruthy(value) {
  return ["true", "так", "yes", "1", "y", "+"].includes(String(value || "").trim().toLowerCase());
}

function liveSlugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function liveProductSlug(product) {
  return liveSlugify(String(product.name || "").replace(/\s*\/\s*/g, "-"));
}

function liveImageUrls(value) {
  return String(value || "")
    .split(/\r?\n|\s*,\s*(?=https?:\/\/)/)
    .map((url) => url.trim())
    .filter((url) => url.startsWith("https://"));
}

function liveEprelIdFromUrl(value) {
  const match = String(value || "").match(/(?:tyres|qr|QR)\/(\d+)/);
  return match ? match[1] : "";
}

function liveEprelLabelCandidates(product) {
  const id = product.eprelId || liveEprelIdFromUrl(product.eprelUrl);
  if (!id) return [];

  return [
    product.labelImageUrl,
    `https://eprel.ec.europa.eu/label/Label_${id}.png`,
    `https://eprel.ec.europa.eu/label/Label_${id}_EN.png`,
    `https://eprel.ec.europa.eu/labels/tyres/Label_${id}.png`,
    `https://eprel.ec.europa.eu/labels/tyres/Label_${id}_EN.png`
  ].filter(Boolean);
}

function liveSheetUrl(callbackName) {
  const params = new URLSearchParams({
    tqx: `responseHandler:${callbackName}`,
    gid: liveSheetGid,
    headers: "1",
    cache: Date.now().toString()
  });

  return `https://docs.google.com/spreadsheets/d/${liveSheetId}/gviz/tq?${params.toString()}`;
}

function loadLiveSheet() {
  return new Promise((resolve, reject) => {
    const callbackName = `productLive_${Date.now()}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheets request timed out"));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = (response) => {
      cleanup();
      if (response.status !== "ok") {
        reject(new Error(response.errors?.[0]?.detailed_message || "Google Sheets returned an error"));
        return;
      }
      resolve(response.table);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Google Sheets script failed to load"));
    };

    script.src = liveSheetUrl(callbackName);
    document.head.append(script);
  });
}

function liveProductsFromTable(table) {
  const headers = table.cols.map((column) => column.label || column.id);

  return table.rows.map((row, index) => {
    const data = {};
    headers.forEach((header, cellIndex) => {
      const cell = row.c[cellIndex];
      data[header] = cell?.f ?? cell?.v ?? "";
    });

    const name = data.product_name || data.name || "";

    return {
      id: index + 1,
      brand: data.brand || "",
      name,
      images: liveImageUrls(data.image_url || data.image),
      fuelClass: String(data.fuelClass || data.fuel_class || "").trim().toUpperCase(),
      wetGripClass: String(data.wetGripClass || data.wet_grip_class || "").trim().toUpperCase(),
      noiseDb: liveToNumber(data.noiseDb || data.noise_db),
      noiseClass: String(data.noiseClass || data.noise_class || "").trim().toUpperCase(),
      snowGrip: liveTruthy(data.snowGrip || data.snow_grip),
      iceGrip: liveTruthy(data.iceGrip || data.ice_grip),
      eprelId: data.eprelId || data.eprel_id || liveEprelIdFromUrl(data.eprelUrl || data.eprel_url),
      eprelUrl: data.eprelUrl || data.eprel_url || "",
      labelImageUrl: data.labelImageUrl || data.label_image_url || ""
    };
  }).filter((product) => product.name);
}

function updateLiveSimilarProducts(products) {
  const cards = document.querySelectorAll(".seo-similar-section .seo-product-card");
  if (!cards.length) return;

  const productsBySlug = new Map(products.map((product) => [liveProductSlug(product), product]));

  cards.forEach((card) => {
    const link = card.querySelector("a[href*='/tyres/']");
    const image = card.querySelector("img");
    if (!link || !image) return;

    const slug = link.getAttribute("href")?.split("/").filter(Boolean).pop();
    const product = productsBySlug.get(slug);
    const imageUrl = product?.images?.[0];
    if (!imageUrl) return;

    image.src = imageUrl;
    image.alt = product.name || image.alt;
    image.loading = "lazy";
    image.decoding = "async";
  });
}

function updateLiveSeoCards(products) {
  const cards = document.querySelectorAll(".seo-product-card");
  if (!cards.length) return;

  const productsBySlug = new Map(products.map((product) => [liveProductSlug(product), product]));

  cards.forEach((card) => {
    const link = card.querySelector("a[href*='/tyres/']");
    const image = card.querySelector("img");
    if (!link || !image) return;

    const slug = link.getAttribute("href")?.split("/").filter(Boolean).pop();
    const product = productsBySlug.get(slug);
    const imageUrl = product?.images?.[0];
    if (!imageUrl) return;

    image.src = imageUrl;
    image.alt = product.name || image.alt;
    image.loading = "lazy";
    image.decoding = "async";
  });
}

function liveClassRows(activeClass) {
  return ["A", "B", "C", "D", "E"].map((item) => `
    <span class="eu-class-row ${item === activeClass ? "active" : ""}">
      <b>${item}</b>
    </span>
  `).join("");
}

function liveTyreLabelBlock(product) {
  const hasLabelData = product.fuelClass || product.wetGripClass || product.noiseDb || product.noiseClass || product.snowGrip || product.iceGrip || product.labelImageUrl || product.eprelUrl;
  const detailsUrl = product.eprelUrl || "/eu-tyre-label/";
  const target = product.eprelUrl ? ` target="_blank" rel="noreferrer"` : "";
  const imageAlt = `Маркування ЄС ${product.name}`;

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

  const labelCandidates = liveEprelLabelCandidates(product);
  const visual = labelCandidates.length
    ? `<img class="eu-label-image" src="${liveEscape(labelCandidates[0])}" alt="${liveEscape(imageAlt)}" loading="lazy" data-label-candidates="${liveEscape(JSON.stringify(labelCandidates))}" onerror="window.tryNextEprelLabelImage && window.tryNextEprelLabelImage(this)">`
    : `<div class="eu-label-card" role="img" aria-label="${liveEscape(imageAlt)}">
        <div>
          <span>Економія пального</span>
          <div class="eu-class-scale">${liveClassRows(product.fuelClass || "")}</div>
        </div>
        <div>
          <span>Зчеплення на мокрому</span>
          <div class="eu-class-scale wet">${liveClassRows(product.wetGripClass || "")}</div>
        </div>
        <div class="eu-noise">
          <span>Зовнішній шум</span>
          <strong>${product.noiseDb ? `${liveEscape(product.noiseDb)} dB` : "н/д"}</strong>
          ${product.noiseClass ? `<small>Клас ${liveEscape(product.noiseClass)}</small>` : ""}
        </div>
      </div>`;

  return `
    <section class="eu-label-block">
      <div class="eu-label-copy">
        <p class="eyebrow">Маркування шин ЄС</p>
        <h2>Характеристики</h2>
        <div class="eu-label-metrics">
          <span><b>${liveEscape(product.fuelClass || "н/д")}</b> економія пального</span>
          <span><b>${liveEscape(product.wetGripClass || "н/д")}</b> мокре зчеплення</span>
          <span><b>${product.noiseDb ? `${liveEscape(product.noiseDb)} dB` : "н/д"}</b> шум${product.noiseClass ? `, клас ${liveEscape(product.noiseClass)}` : ""}</span>
        </div>
        <div class="eu-label-icons">
          ${product.snowGrip ? `<span>3PMSF</span>` : ""}
          ${product.iceGrip ? `<span>Ice Grip</span>` : ""}
          ${product.eprelId ? `<span>EPREL ${liveEscape(product.eprelId)}</span>` : ""}
        </div>
        <a class="eu-label-link" href="${liveEscape(detailsUrl)}"${target}>Детальніше про маркування шин ЄС</a>
      </div>
      <div class="eu-label-visual">${visual}</div>
    </section>
  `;
}

function updateLiveProductPage(product) {
  const images = product.images.length ? product.images : [];
  const gallery = document.querySelector(".seo-product-photo");
  if (images.length && gallery) {
    gallery.innerHTML = `
      <div class="seo-main-photo-frame">
        <img class="seo-main-product-image" src="${liveEscape(images[0])}" alt="${liveEscape(product.name)}" loading="eager" />
      </div>
      ${images.length > 1 ? `<div class="seo-product-thumbs" aria-label="Фото товару">${images.map((url, index) => `
        <button class="${index === 0 ? "active" : ""}" type="button" data-gallery-image="${liveEscape(url)}" aria-label="Фото ${index + 1}: ${liveEscape(product.name)}">
          <img src="${liveEscape(url)}" alt="${liveEscape(product.name)} фото ${index + 1}" loading="lazy" />
        </button>
      `).join("")}</div>` : ""}
    `;
  }

  const currentLabel = document.querySelector(".eu-label-block");
  if (currentLabel) {
    currentLabel.outerHTML = liveTyreLabelBlock(product);
  }
}

document.addEventListener("click", (event) => {
  const thumb = event.target.closest("[data-gallery-image]");
  if (!thumb) return;

  const gallery = thumb.closest(".seo-product-photo");
  const mainImage = gallery?.querySelector(".seo-main-product-image");
  if (!mainImage) return;

  mainImage.src = thumb.dataset.galleryImage;
  gallery.querySelectorAll("[data-gallery-image]").forEach((button) => button.classList.toggle("active", button === thumb));
});

window.tryNextEprelLabelImage = (image) => {
  try {
    const candidates = JSON.parse(image.dataset.labelCandidates || "[]");
    const currentIndex = Number(image.dataset.labelIndex || "0");
    const nextIndex = currentIndex + 1;

    if (nextIndex < candidates.length) {
      image.dataset.labelIndex = String(nextIndex);
      image.src = candidates[nextIndex];
      return;
    }
  } catch {
    // Fall through to the generated HTML label.
  }

  const block = image.closest(".eu-label-block");
  if (!block) return;

  const product = window.currentLiveProductForLabel;
  if (!product) return;

  const clone = { ...product, labelImageUrl: "" };
  block.outerHTML = liveTyreLabelBlock({ ...clone, eprelId: "", eprelUrl: "" });
};

async function initLiveProductPage() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const hasSeoCards = Boolean(document.querySelector(".seo-product-card"));
  const isProductPage = parts[0] === "tyres" && parts[1];
  if (!isProductPage && !hasSeoCards) return;

  try {
    const table = await loadLiveSheet();
    const products = liveProductsFromTable(table);
    updateLiveSeoCards(products);
    updateLiveSimilarProducts(products);
    if (!isProductPage) return;
    const product = products.find((item) => liveProductSlug(item) === parts[1]);
    if (product) {
      window.currentLiveProductForLabel = product;
      updateLiveProductPage(product);
    }
  } catch (error) {
    console.warn("Live product update failed:", error);
  }
}

initLiveProductPage();
