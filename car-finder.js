const carFinderState = {
  cars: [],
  brand: "",
  model: "",
  generation: "",
  year: "",
  modification: ""
};

const carFinder = document.querySelector("#carFinder");
const sizeFinder = document.querySelector("#sizeFinder");
const finderTabs = [...document.querySelectorAll(".finder-tab")];
const carBrandSelect = document.querySelector("#carBrandSelect");
const carModelSelect = document.querySelector("#carModelSelect");
const carGenerationSelect = document.querySelector("#carGenerationSelect");
const carYearSelect = document.querySelector("#carYearSelect");
const carModificationSelect = document.querySelector("#carModificationSelect");
const carResult = document.querySelector("#carFinderResult");

function carFinderSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sizeToSlug(size) {
  const match = String(size || "").match(/(\d{3})\D*(\d{2})\D*R?\D*(\d{2})/i);
  return match ? `${match[1]}-${match[2]}-r${match[3]}` : carFinderSlug(size);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "uk"));
}

function fillCarSelect(select, values, placeholder) {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
  select.disabled = values.length === 0;
}

function currentCarMatches() {
  return carFinderState.cars.filter((item) => {
    return (!carFinderState.brand || item.brand === carFinderState.brand)
      && (!carFinderState.model || item.model === carFinderState.model)
      && (!carFinderState.generation || item.generation === carFinderState.generation)
      && (!carFinderState.year || (Number(carFinderState.year) >= Number(item.yearFrom) && Number(carFinderState.year) <= Number(item.yearTo)))
      && (!carFinderState.modification || item.modification === carFinderState.modification);
  });
}

function updateCarFinderSelects(changed) {
  if (changed === "brand") {
    carFinderState.model = "";
    carFinderState.generation = "";
    carFinderState.year = "";
    carFinderState.modification = "";
  }
  if (changed === "model") {
    carFinderState.generation = "";
    carFinderState.year = "";
    carFinderState.modification = "";
  }
  if (changed === "generation") {
    carFinderState.year = "";
    carFinderState.modification = "";
  }
  if (changed === "year") {
    carFinderState.modification = "";
  }

  const byBrand = carFinderState.cars.filter((item) => !carFinderState.brand || item.brand === carFinderState.brand);
  const byModel = byBrand.filter((item) => !carFinderState.model || item.model === carFinderState.model);
  const byGeneration = byModel.filter((item) => !carFinderState.generation || item.generation === carFinderState.generation);
  const byYear = byGeneration.filter((item) => !carFinderState.year || (Number(carFinderState.year) >= Number(item.yearFrom) && Number(carFinderState.year) <= Number(item.yearTo)));

  fillCarSelect(carBrandSelect, uniqueSorted(carFinderState.cars.map((item) => item.brand)), "Марка");
  fillCarSelect(carModelSelect, uniqueSorted(byBrand.map((item) => item.model)), "Модель");
  fillCarSelect(carGenerationSelect, uniqueSorted(byModel.map((item) => item.generation)), "Покоління");

  const years = uniqueSorted(byGeneration.flatMap((item) => {
    const list = [];
    for (let year = Number(item.yearFrom); year <= Number(item.yearTo); year += 1) list.push(String(year));
    return list;
  })).sort((a, b) => Number(b) - Number(a));
  fillCarSelect(carYearSelect, years, "Рік");
  fillCarSelect(carModificationSelect, uniqueSorted(byYear.map((item) => item.modification)), "Модифікація");

  carBrandSelect.value = carFinderState.brand;
  carModelSelect.value = carFinderState.model;
  carGenerationSelect.value = carFinderState.generation;
  carYearSelect.value = carFinderState.year;
  carModificationSelect.value = carFinderState.modification;

  renderCarFinderResult();
}

function sizeButtons(sizes, className = "") {
  return uniqueSorted(sizes).map((size) => `<a class="${className}" href="/size/${sizeToSlug(size)}/">${size}</a>`).join("");
}

function carPageUrl(car) {
  const year = Math.min(Number(car.yearTo) || 2025, Math.max(Number(car.yearFrom) || 2005, Math.round(((Number(car.yearFrom) || 2005) + (Number(car.yearTo) || 2025)) / 2)));
  return `/cars/${carFinderSlug(car.brand)}/${carFinderSlug(`${car.model}-${car.generation}-${year}-${car.modification}`)}/`;
}

function renderCarFinderResult() {
  if (!carResult) return;
  const matches = currentCarMatches();
  const selected = matches[0];

  if (!selected || !carFinderState.brand || !carFinderState.model || !carFinderState.generation) {
    carResult.innerHTML = `<p>Оберіть марку, модель і покоління. Після цього покажемо рекомендовані та допустимі розміри шин.</p>`;
    return;
  }

  const recommended = matches.flatMap((item) => item.recommendedSizes || []);
  const optional = matches.flatMap((item) => item.optionalSizes || []);
  const yearText = carFinderState.year ? `${carFinderState.year} р.` : `${selected.yearFrom}-${selected.yearTo}`;
  const verification = selected.verified
    ? "OEM-розміри перевірені."
    : "Розміри зі стартової бази. Перед купівлею менеджер звірить їх з вашим авто.";

  carResult.innerHTML = `
    <div class="car-result-card">
      <p class="eyebrow">Результат підбору</p>
      <h3>${selected.brand} ${selected.model} ${selected.generation} ${yearText}</h3>
      <p>${verification}</p>
      <div class="car-size-group">
        <span>Рекомендовані розміри</span>
        <div>${sizeButtons(recommended, "primary")}</div>
      </div>
      <div class="car-size-group">
        <span>Допустимі альтернативи</span>
        <div>${sizeButtons(optional)}</div>
      </div>
      <div class="car-result-actions">
        <a class="public-primary" href="${carPageUrl(selected)}">SEO-сторінка авто</a>
        <a class="public-primary light" href="viber://chat?number=%2B380689159643">Потрібна допомога? Viber</a>
      </div>
    </div>
  `;
}

function switchFinderTab(mode) {
  const isCar = mode === "car";
  finderTabs.forEach((tab, index) => tab.classList.toggle("active", isCar ? index === 1 : index === 0));
  if (sizeFinder) sizeFinder.hidden = isCar;
  if (carFinder) carFinder.hidden = !isCar;
}

async function loadCarFitments() {
  if (!carFinder) return;
  try {
    const response = await fetch("/car-fitments.json", { cache: "force-cache" });
    carFinderState.cars = await response.json();
  } catch (error) {
    console.warn("Car fitment database is not available:", error);
    carFinderState.cars = [];
  }
  updateCarFinderSelects();
}

finderTabs[0]?.addEventListener("click", () => switchFinderTab("size"));
finderTabs[1]?.addEventListener("click", () => switchFinderTab("car"));

[
  [carBrandSelect, "brand"],
  [carModelSelect, "model"],
  [carGenerationSelect, "generation"],
  [carYearSelect, "year"],
  [carModificationSelect, "modification"]
].forEach(([select, key]) => {
  select?.addEventListener("change", () => {
    carFinderState[key] = select.value;
    updateCarFinderSelects(key);
  });
});

loadCarFitments();
