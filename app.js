const grid = document.querySelector("#catalogGrid");
const emptyState = document.querySelector("#emptyState");
const resultCount = document.querySelector("#resultCount");
const stockTotal = document.querySelector("#stockTotal");
const searchInput = document.querySelector("#searchInput");
const widthFilter = document.querySelector("#widthFilter");
const profileFilter = document.querySelector("#profileFilter");
const diameterFilter = document.querySelector("#diameterFilter");
const brandFilter = document.querySelector("#brandFilter");
const seasonFilter = document.querySelector("#seasonFilter");
const availableOnly = document.querySelector("#availableOnly");
const applyFilters = document.querySelector("#applyFilters");
const resetFilters = document.querySelector("#resetFilters");
const listViewButton = document.querySelector("#listViewButton");
const cardViewButton = document.querySelector("#cardViewButton");
const recommendationsSection = document.querySelector("#recommendationsSection");
const recommendationGrid = document.querySelector("#recommendationGrid");
const headerViber = document.querySelector("#headerViber");
const headerTelegram = document.querySelector("#headerTelegram");
const logoutButton = document.querySelector("#logoutButton");
const photoModal = document.querySelector("#photoModal");
const photoModalImage = document.querySelector("#photoModalImage");
const photoModalClose = document.querySelector("#photoModalClose");
const photoModalPrev = document.querySelector("#photoModalPrev");
const photoModalNext = document.querySelector("#photoModalNext");
const orderModal = document.querySelector("#orderModal");
const orderForm = document.querySelector("#orderForm");
const orderClose = document.querySelector("#orderClose");
const orderProduct = document.querySelector("#orderProduct");
const orderName = document.querySelector("#orderName");
const orderPhone = document.querySelector("#orderPhone");
const orderQuantity = document.querySelector("#orderQuantity");
const orderComment = document.querySelector("#orderComment");
const orderStatus = document.querySelector("#orderStatus");

const money = new Intl.NumberFormat("uk-UA");
const fallbackImage = "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=80";

let catalogProducts = Array.isArray(PRODUCTS) ? [...PRODUCTS] : [];
let modalImages = [];
let modalImageIndex = 0;
let catalogView = localStorage.getItem("catalogView") || "cards";
let currentOrderProduct = null;

function initContacts() {
  headerViber.href = CONTACTS.viber;
  headerTelegram.href = CONTACTS.telegram;
}

function resetSelect(select) {
  select.querySelectorAll("option:not([value='all'])").forEach((option) => option.remove());
}

function fillSelect(select, values, suffix = "") {
  resetSelect(select);

  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${value}${suffix}`;
    select.append(option);
  }
}

function initFilters() {
  const brands = [...new Set(catalogProducts.map((product) => product.brand).filter(Boolean))].sort();
  const widths = [...new Set(catalogProducts.map((product) => product.width).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const profiles = [...new Set(catalogProducts.map((product) => product.profile).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const diameters = [...new Set(catalogProducts.map((product) => product.diameter).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  fillSelect(widthFilter, widths);
  fillSelect(profileFilter, profiles);
  fillSelect(diameterFilter, diameters, '"');
  fillSelect(brandFilter, brands);
}

function sheetCsvUrl() {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: sheetConfig.sheetName,
    cache: Date.now().toString()
  });

  return `https://docs.google.com/spreadsheets/d/${sheetConfig.id}/gviz/tq?${params.toString()}`;
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function toNumber(value) {
  const normalized = String(value || "").replace(/\s/g, "").replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : 0;
}

function parseSize(name) {
  const value = String(name || "");
  const match = value.match(/(\d{3})\s*\/?\s*(\d{2})\s*R\s*(\d{2})/i);

  if (!match) {
    return { width: "", profile: "", diameter: "" };
  }

  return {
    width: match[1],
    profile: match[2],
    diameter: match[3]
  };
}

function isTruthy(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "так", "yes", "1", "y", "+"].includes(normalized);
}

function normalizeImageUrl(url) {
  const value = String(url || "").trim();

  if (!value || !value.startsWith("https://")) {
    return "";
  }

  return value;
}

function imageUrlsFromValue(value) {
  const urls = String(value || "")
    .split(/\r?\n|\s*,\s*(?=https?:\/\/)/)
    .map((url) => normalizeImageUrl(url))
    .filter(Boolean);

  return [...new Set(urls)];
}

function productsFromCsv(csv) {
  const rows = parseCsv(csv).filter((row) => row.some((cell) => cell.trim()));
  const headers = rows.shift()?.map((header) => header.trim()) || [];

  return rows.map((row, index) => {
    const data = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] || ""]));
    const name = data.product_name || data.name || "";
    const size = parseSize(name);

    return {
      id: index + 1,
      brand: data.brand || "",
      name,
      model: name,
      size: "",
      width: size.width,
      profile: size.profile,
      diameter: size.diameter,
      season: data.season || "",
      year: toNumber(data.year),
      country: data.country || "",
      stock: toNumber(data.stock),
      price: toNumber(data.price),
      image_url: data.image_url || "",
      images: imageUrlsFromValue(data.image_url),
      recommended: isTruthy(data.recommended),
      recommendation_order: toNumber(data.recommendation_order),
      recommendation_label: data.recommendation_label || "",
      image: fallbackImage
    };
  }).filter((product) => product.name);
}

function productsFromGoogleTable(table) {
  const headers = table.cols.map((column) => column.label || column.id);

  return table.rows.map((row, index) => {
    const data = {};

    headers.forEach((header, cellIndex) => {
      const cell = row.c[cellIndex];
      data[header] = cell?.f ?? cell?.v ?? "";
    });

    const name = data.product_name || data.name || "";
    const size = parseSize(name);

    return {
      id: index + 1,
      brand: data.brand || "",
      name,
      model: name,
      size: "",
      width: size.width,
      profile: size.profile,
      diameter: size.diameter,
      season: data.season || "",
      year: toNumber(data.year),
      country: data.country || "",
      stock: toNumber(data.stock),
      price: toNumber(data.price),
      image_url: data.image_url || "",
      images: imageUrlsFromValue(data.image_url),
      recommended: isTruthy(data.recommended),
      recommendation_order: toNumber(data.recommendation_order),
      recommendation_label: data.recommendation_label || "",
      image: fallbackImage
    };
  }).filter((product) => product.name);
}

function loadProductsWithJsonp() {
  return loadSheetWithJsonp(sheetConfig.sheetName).then(productsFromGoogleTable);
}

async function loadProductsFromSheet() {
  try {
    const products = await loadProductsWithJsonp();

    if (!products.length) {
      throw new Error("Google Sheets returned no products");
    }

    catalogProducts = products;
  } catch (error) {
    console.warn("Using local products fallback:", error);
    catalogProducts = Array.isArray(PRODUCTS) ? [...PRODUCTS] : [];
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stockLabel(stock) {
  if (stock <= 0) return { text: "Немає", className: "out" };
  if (stock <= 10) return { text: `${stock} шт.`, className: "low" };
  return { text: `${stock} шт.`, className: "" };
}

function productName(product) {
  if (product.name) return product.name;
  return `${product.brand} ${product.model} ${product.size}`;
}

function productById(id) {
  return catalogProducts.find((product) => String(product.id) === String(id));
}

function contactUrl(baseUrl, product) {
  const message = encodeURIComponent(`Добрий день. Цікавить ${productName(product)}. Наявність: ${product.stock} шт.`);

  if (baseUrl.includes("t.me")) {
    return `${baseUrl}?text=${message}`;
  }

  return baseUrl;
}

function productCard(product, options = {}) {
  const availability = stockLabel(product.stock);
  const images = product.images?.length ? product.images : imageUrlsFromValue(product.image_url || product.image);
  const galleryImages = images.length ? images : [fallbackImage];
  const image = galleryImages[0];
  const name = productName(product);
  const card = document.createElement("article");
  card.className = options.recommended ? "product-card recommended-card" : "product-card";
  card.dataset.productId = product.id;
  card.dataset.galleryImages = JSON.stringify(galleryImages);
  card.dataset.activeImage = "0";
  const thumbs = galleryImages.length > 1
    ? `<div class="thumb-strip" aria-label="Фото товару">${galleryImages.map((url, index) => `
        <button class="thumb-button ${index === 0 ? "active" : ""}" type="button" data-image="${escapeHtml(url)}" data-index="${index}" aria-label="Фото ${index + 1}: ${escapeHtml(name)}">
          <img src="${escapeHtml(url)}" alt="" loading="lazy" onerror="this.closest('button').remove()">
        </button>
      `).join("")}</div>`
    : "";

  card.innerHTML = `
    <div class="product-image">
      <button class="main-image-button" type="button" aria-label="Відкрити фото на весь екран">
      <img class="main-product-image" src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}'">
      </button>
      <span class="badge ${escapeHtml(availability.className)}">${escapeHtml(availability.text)}</span>
      ${product.recommendation_label ? `<span class="recommendation-badge">${escapeHtml(product.recommendation_label)}</span>` : ""}
      ${galleryImages.length > 1 ? `
        <button class="gallery-arrow gallery-arrow-prev" type="button" data-direction="-1" aria-label="Попереднє фото">&lt;</button>
        <button class="gallery-arrow gallery-arrow-next" type="button" data-direction="1" aria-label="Наступне фото">&gt;</button>
      ` : ""}
      ${thumbs}
    </div>
    <div class="product-body">
      <h3 class="product-title">${escapeHtml(name)}</h3>
      <div class="meta-grid">
        <div class="meta-item"><span>Сезон</span><strong>${escapeHtml(product.season)}</strong></div>
        <div class="meta-item"><span>Рік</span><strong>${escapeHtml(product.year)}</strong></div>
        <div class="meta-item"><span>Країна</span><strong>${escapeHtml(product.country)}</strong></div>
        <div class="meta-item"><span>Бренд</span><strong>${escapeHtml(product.brand)}</strong></div>
      </div>
      <div class="product-footer">
        <div class="price">
          <span>Оптова ціна</span>
          <strong>${escapeHtml(money.format(product.price))} грн</strong>
        </div>
        <div class="card-actions">
          <a class="contact-button viber" href="${escapeHtml(contactUrl(CONTACTS.viber, product))}" target="_blank" rel="noreferrer" aria-label="Написати у Viber щодо ${escapeHtml(name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.02 2.4c-5.08 0-9.2 3.55-9.2 7.94 0 2.45 1.31 4.71 3.46 6.21l-.74 3.37 3.72-1.78c.88.2 1.8.31 2.76.31 5.08 0 9.2-3.56 9.2-7.95 0-4.38-4.12-7.93-9.2-7.93Zm0 14.42c-.86 0-1.69-.11-2.45-.34l-.36-.11-1.83.88.36-1.63-.46-.29c-1.86-1.16-2.93-2.98-2.93-4.99 0-3.48 3.44-6.31 7.67-6.31s7.68 2.83 7.68 6.31c0 3.49-3.45 6.48-7.68 6.48Zm4.25-4.68c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.13.15-.27.17-.5.06-.23-.11-.97-.36-1.85-1.14-.68-.61-1.14-1.36-1.28-1.59-.13-.23-.01-.35.1-.46.1-.1.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.11-.51-1.23-.7-1.69-.18-.44-.37-.38-.51-.39h-.44c-.15 0-.4.06-.61.29-.21.23-.8.78-.8 1.91s.82 2.22.93 2.37c.11.15 1.61 2.46 3.9 3.45.55.24.97.38 1.3.49.55.17 1.05.15 1.45.09.44-.07 1.36-.55 1.55-1.09.19-.53.19-.99.13-1.09-.06-.09-.21-.15-.44-.26Z"/></svg>
          </a>
          <a class="contact-button telegram" href="${escapeHtml(contactUrl(CONTACTS.telegram, product))}" target="_blank" rel="noreferrer" aria-label="Написати у Telegram щодо ${escapeHtml(name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.74 4.88 18.52 20.1c-.24 1.07-.88 1.33-1.78.83l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.98.48l.35-5.01 9.12-8.24c.4-.35-.09-.55-.62-.2L6.05 13.7 1.2 12.18c-1.05-.33-1.07-1.05.22-1.55L20.39 3.3c.88-.32 1.65.21 1.35 1.58Z"/></svg>
          </a>
          <button class="contact-button email order-open-button" type="button" aria-label="Оформити замовлення на пошту">
            <span aria-hidden="true">G</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

function productListRow(product) {
  const availability = stockLabel(product.stock);
  const images = product.images?.length ? product.images : imageUrlsFromValue(product.image_url || product.image);
  const galleryImages = images.length ? images : [fallbackImage];
  const name = productName(product);
  const row = document.createElement("article");
  row.className = "product-row";
  row.dataset.productId = product.id;
  row.dataset.galleryImages = JSON.stringify(galleryImages);
  row.dataset.activeImage = "0";
  row.innerHTML = `
    <div class="row-main">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(product.brand)} · ${escapeHtml(product.season)} · ${escapeHtml(product.year)} · ${escapeHtml(product.country)}</p>
    </div>
    <strong class="row-stock ${escapeHtml(availability.className)}">${escapeHtml(availability.text)}</strong>
    <strong class="row-price">${escapeHtml(money.format(product.price))} грн</strong>
    <div class="row-actions">
      <button class="row-photo-button" type="button">Фото</button>
      <a class="mini-contact viber" href="${escapeHtml(contactUrl(CONTACTS.viber, product))}" target="_blank" rel="noreferrer" aria-label="Viber"></a>
      <a class="mini-contact telegram" href="${escapeHtml(contactUrl(CONTACTS.telegram, product))}" target="_blank" rel="noreferrer" aria-label="Telegram"></a>
      <button class="mini-contact email order-open-button" type="button" aria-label="Email"></button>
    </div>
  `;

  return row;
}

function setProductImage(card, index) {
  const mainImage = card?.querySelector(".main-product-image");
  const images = JSON.parse(card?.dataset.galleryImages || "[]");
  const nextImage = images[index];

  if (!mainImage || !nextImage) return;

  card.dataset.activeImage = String(index);
  mainImage.src = nextImage;
  card.querySelectorAll(".thumb-button").forEach((thumb) => thumb.classList.toggle("active", Number(thumb.dataset.index) === index));
}

function switchProductImage(button) {
  const card = button.closest(".product-card");
  setProductImage(card, Number(button.dataset.index || 0));
}

function stepProductImage(button) {
  const card = button.closest(".product-card");
  const images = JSON.parse(card?.dataset.galleryImages || "[]");

  if (!card || images.length < 2) return;

  const current = Number(card.dataset.activeImage || 0);
  const direction = Number(button.dataset.direction || 1);
  const next = (current + direction + images.length) % images.length;
  setProductImage(card, next);
}

function showModalImage(index) {
  if (!modalImages.length) return;

  modalImageIndex = (index + modalImages.length) % modalImages.length;
  photoModalImage.src = modalImages[modalImageIndex];
  photoModalPrev.hidden = modalImages.length < 2;
  photoModalNext.hidden = modalImages.length < 2;
}

function openPhotoModal(card) {
  modalImages = JSON.parse(card?.dataset.galleryImages || "[]");

  if (!modalImages.length) return;

  showModalImage(Number(card.dataset.activeImage || 0));
  photoModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closePhotoModal() {
  photoModal.hidden = true;
  photoModalImage.src = "";
  document.body.classList.remove("modal-open");
}

function openOrderModal(product) {
  currentOrderProduct = product;
  orderStatus.hidden = true;
  orderStatus.textContent = "";
  orderProduct.textContent = `${productName(product)} · ${money.format(product.price)} грн · залишок ${product.stock} шт.`;
  orderQuantity.max = product.stock > 0 ? String(product.stock) : "";
  orderQuantity.value = "1";
  orderComment.value = "";

  const client = currentClient();
  if (client?.name) orderName.value = client.name;
  if (client?.phone) orderPhone.value = client.phone;

  orderModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeOrderModal() {
  orderModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function encodeFormData(data) {
  return new URLSearchParams(data).toString();
}

async function submitOrder(event) {
  event.preventDefault();

  if (!currentOrderProduct) return;

  const submitButton = orderForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Відправляю...";
  orderStatus.hidden = true;

  const payload = {
    "form-name": "tyre-order",
    email: "tiretop94@gmail.com",
    subject: `Замовлення: ${productName(currentOrderProduct)}`,
    product: productName(currentOrderProduct),
    price: `${currentOrderProduct.price}`,
    year: `${currentOrderProduct.year}`,
    country: currentOrderProduct.country,
    stock: `${currentOrderProduct.stock}`,
    client_name: orderName.value,
    client_phone: orderPhone.value,
    quantity: orderQuantity.value,
    comment: orderComment.value
  };

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData(payload)
    });

    orderStatus.textContent = "Заявку відправлено. Ми зв'яжемось з вами.";
    orderStatus.className = "order-status success";
    orderStatus.hidden = false;
    orderForm.reset();
  } catch (error) {
    console.warn("Order submit failed:", error);
    orderStatus.textContent = "Не вдалося відправити. Спробуйте ще раз або напишіть у месенджер.";
    orderStatus.className = "order-status error";
    orderStatus.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Відправити заявку";
  }
}

function stepModalImage(direction) {
  showModalImage(modalImageIndex + direction);
}

function filteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const width = widthFilter.value;
  const profile = profileFilter.value;
  const diameter = diameterFilter.value;
  const brand = brandFilter.value;
  const season = seasonFilter.value;

  return catalogProducts.filter((product) => {
    const searchable = `${productName(product)} ${product.brand} ${product.country} ${product.year}`.toLowerCase();
    const matchesQuery = searchable.includes(query);
    const matchesWidth = width === "all" || product.width === width;
    const matchesProfile = profile === "all" || product.profile === profile;
    const matchesDiameter = diameter === "all" || product.diameter === diameter;
    const matchesBrand = brand === "all" || product.brand === brand;
    const matchesSeason = season === "all" || product.season === season;
    const matchesStock = !availableOnly.checked || product.stock > 0;

    return matchesQuery && matchesWidth && matchesProfile && matchesDiameter && matchesBrand && matchesSeason && matchesStock;
  });
}

function recommendedProducts() {
  return catalogProducts
    .filter((product) => product.recommended && (!availableOnly.checked || product.stock > 0))
    .sort((a, b) => (a.recommendation_order || 9999) - (b.recommendation_order || 9999))
    .slice(0, 8);
}

function render() {
  const products = filteredProducts();
  const recommendations = recommendedProducts();

  grid.classList.toggle("list-view", catalogView === "list");
  grid.classList.toggle("card-view", catalogView === "cards");
  listViewButton.classList.toggle("active", catalogView === "list");
  cardViewButton.classList.toggle("active", catalogView === "cards");
  grid.replaceChildren(...products.map((product) => catalogView === "list" ? productListRow(product) : productCard(product)));
  recommendationGrid.replaceChildren(...recommendations.map((product) => productCard(product, { recommended: true })));

  resultCount.textContent = `${products.length} ${products.length === 1 ? "товар" : "товарів"}`;
  stockTotal.textContent = catalogProducts.filter((product) => product.stock > 0).length;
  emptyState.hidden = products.length > 0;
  recommendationsSection.hidden = recommendations.length === 0;
}

function setCatalogView(view) {
  catalogView = view;
  localStorage.setItem("catalogView", view);
  render();
}

function reset() {
  searchInput.value = "";
  widthFilter.value = "all";
  profileFilter.value = "all";
  diameterFilter.value = "all";
  brandFilter.value = "all";
  seasonFilter.value = "all";
  availableOnly.checked = true;
  render();
}

async function init() {
  initContacts();
  const client = currentClient();

  if (!client) {
    window.location.replace("login.html");
    return;
  }

  logoutButton.hidden = false;
  logoutButton.textContent = client.name ? `Вийти: ${client.name}` : "Вийти";
  resultCount.textContent = "Завантаження Google Sheets...";
  await loadProductsFromSheet();
  initFilters();
  render();
}

searchInput.addEventListener("input", render);
widthFilter.addEventListener("change", render);
profileFilter.addEventListener("change", render);
diameterFilter.addEventListener("change", render);
brandFilter.addEventListener("change", render);
seasonFilter.addEventListener("change", render);
availableOnly.addEventListener("change", render);
applyFilters.addEventListener("click", render);
resetFilters.addEventListener("click", reset);
listViewButton.addEventListener("click", () => setCatalogView("list"));
cardViewButton.addEventListener("click", () => setCatalogView("cards"));
logoutButton.addEventListener("click", () => {
  clearClientSession();
  window.location.replace("login.html");
});
grid.addEventListener("click", (event) => {
  handleCatalogClick(event);
});
recommendationGrid.addEventListener("click", (event) => {
  handleCatalogClick(event);
});

function handleCatalogClick(event) {
  const button = event.target.closest(".thumb-button");
  if (button) switchProductImage(button);

  const arrow = event.target.closest(".gallery-arrow");
  if (arrow) stepProductImage(arrow);

  const mainImageButton = event.target.closest(".main-image-button");
  if (mainImageButton) openPhotoModal(mainImageButton.closest(".product-card"));

  const rowPhotoButton = event.target.closest(".row-photo-button");
  if (rowPhotoButton) openPhotoModal(rowPhotoButton.closest(".product-row"));

  const orderButton = event.target.closest(".order-open-button");
  if (orderButton) {
    const product = productById(orderButton.closest("[data-product-id]")?.dataset.productId);
    if (product) openOrderModal(product);
  }
}

orderClose.addEventListener("click", closeOrderModal);
orderModal.addEventListener("click", (event) => {
  if (event.target === orderModal) closeOrderModal();
});
orderForm.addEventListener("submit", submitOrder);

photoModalClose.addEventListener("click", closePhotoModal);
photoModalPrev.addEventListener("click", () => stepModalImage(-1));
photoModalNext.addEventListener("click", () => stepModalImage(1));
photoModal.addEventListener("click", (event) => {
  if (event.target === photoModal) closePhotoModal();
});
document.addEventListener("keydown", (event) => {
  if (photoModal.hidden) return;
  if (event.key === "Escape") closePhotoModal();
  if (event.key === "ArrowLeft") stepModalImage(-1);
  if (event.key === "ArrowRight") stepModalImage(1);
});

init();
