const fs = require("fs");
const path = require("path");

const root = __dirname;

const brandModels = {
  Audi: [["A3", "compact"], ["A4", "midsize"], ["A5", "midsize"], ["A6", "executive"], ["Q3", "suv"], ["Q5", "suv"], ["Q7", "largeSuv"]],
  BMW: [["1 Series", "compact"], ["3 Series", "midsize"], ["4 Series", "midsize"], ["5 Series", "executive"], ["X1", "suv"], ["X3", "suv"], ["X5", "largeSuv"]],
  Mercedes: [["A-Class", "compact"], ["C-Class", "midsize"], ["E-Class", "executive"], ["S-Class", "luxury"], ["GLA", "suv"], ["GLC", "suv"], ["GLE", "largeSuv"]],
  Volkswagen: [["Golf", "compact"], ["Passat", "midsize"], ["Jetta", "midsize"], ["Tiguan", "suv"], ["Touareg", "largeSuv"], ["Polo", "small"], ["Touran", "mpv"]],
  Toyota: [["Yaris", "small"], ["Corolla", "compact"], ["Camry", "midsize"], ["RAV4", "suv"], ["Land Cruiser Prado", "largeSuv"], ["C-HR", "suv"], ["Highlander", "largeSuv"]],
  Hyundai: [["i20", "small"], ["i30", "compact"], ["Elantra", "compact"], ["Sonata", "midsize"], ["Tucson", "suv"], ["Santa Fe", "largeSuv"], ["Kona", "suv"]],
  Kia: [["Rio", "small"], ["Ceed", "compact"], ["Cerato", "compact"], ["Optima", "midsize"], ["Sportage", "suv"], ["Sorento", "largeSuv"], ["Stonic", "suv"]],
  Renault: [["Clio", "small"], ["Megane", "compact"], ["Scenic", "mpv"], ["Laguna", "midsize"], ["Captur", "suv"], ["Kadjar", "suv"], ["Koleos", "largeSuv"]],
  Nissan: [["Micra", "small"], ["Note", "small"], ["Juke", "suv"], ["Qashqai", "suv"], ["X-Trail", "largeSuv"], ["Leaf", "ev"], ["Murano", "largeSuv"]],
  Ford: [["Fiesta", "small"], ["Focus", "compact"], ["Mondeo", "midsize"], ["Kuga", "suv"], ["S-Max", "mpv"], ["Puma", "suv"], ["Edge", "largeSuv"]],
  Skoda: [["Fabia", "small"], ["Octavia", "compact"], ["Superb", "executive"], ["Rapid", "compact"], ["Kamiq", "suv"], ["Karoq", "suv"], ["Kodiaq", "largeSuv"]],
  Peugeot: [["208", "small"], ["308", "compact"], ["508", "midsize"], ["2008", "suv"], ["3008", "suv"], ["5008", "largeSuv"], ["Partner", "van"]],
  Volvo: [["S40", "compact"], ["S60", "midsize"], ["S90", "executive"], ["V60", "midsize"], ["XC40", "suv"], ["XC60", "suv"], ["XC90", "largeSuv"]],
  Tesla: [["Model 3", "ev"], ["Model S", "luxury"], ["Model X", "largeSuv"], ["Model Y", "suv"], ["Roadster", "sport"], ["Cybertruck", "largeSuv"], ["Model 2", "compact"]],
  Mazda: [["2", "small"], ["3", "compact"], ["6", "midsize"], ["CX-3", "suv"], ["CX-5", "suv"], ["CX-7", "largeSuv"], ["CX-9", "largeSuv"]],
  Honda: [["Jazz", "small"], ["Civic", "compact"], ["Accord", "midsize"], ["HR-V", "suv"], ["CR-V", "suv"], ["Pilot", "largeSuv"], ["Insight", "compact"]],
  Lexus: [["CT", "compact"], ["IS", "midsize"], ["ES", "executive"], ["GS", "executive"], ["NX", "suv"], ["RX", "largeSuv"], ["LX", "largeSuv"]],
  Porsche: [["Boxster", "sport"], ["Cayman", "sport"], ["911", "sport"], ["Panamera", "luxury"], ["Macan", "suv"], ["Cayenne", "largeSuv"], ["Taycan", "ev"]],
  Opel: [["Corsa", "small"], ["Astra", "compact"], ["Insignia", "midsize"], ["Meriva", "mpv"], ["Mokka", "suv"], ["Zafira", "mpv"], ["Grandland", "suv"]],
  Seat: [["Ibiza", "small"], ["Leon", "compact"], ["Toledo", "compact"], ["Altea", "mpv"], ["Arona", "suv"], ["Ateca", "suv"], ["Tarraco", "largeSuv"]],
  Subaru: [["Impreza", "compact"], ["Legacy", "midsize"], ["Outback", "suv"], ["Forester", "suv"], ["XV", "suv"], ["Tribeca", "largeSuv"], ["WRX", "sport"]],
  Mitsubishi: [["Colt", "small"], ["Lancer", "compact"], ["ASX", "suv"], ["Eclipse Cross", "suv"], ["Outlander", "largeSuv"], ["Pajero", "largeSuv"], ["Space Star", "small"]]
};

const generationNames = {
  0: ["I", 2005, 2011],
  1: ["II", 2012, 2018],
  2: ["III", 2019, 2025]
};

const segmentSizes = {
  small: [["185/65 R15", "195/55 R16"], ["205/45 R17"]],
  compact: [["195/65 R15", "205/55 R16"], ["225/45 R17", "225/40 R18"]],
  midsize: [["205/60 R16", "215/55 R17"], ["225/45 R18", "235/40 R19"]],
  executive: [["225/55 R17", "245/45 R18"], ["255/40 R19", "255/35 R20"]],
  luxury: [["245/45 R19", "255/40 R20"], ["275/35 R21"]],
  suv: [["215/65 R16", "225/60 R17"], ["235/55 R18", "235/50 R19"]],
  largeSuv: [["235/65 R17", "255/55 R18"], ["265/50 R19", "275/45 R20"]],
  mpv: [["205/55 R16", "215/55 R17"], ["225/45 R18"]],
  van: [["195/65 R15C", "205/65 R16C"], ["215/60 R17C"]],
  sport: [["235/40 R18", "245/35 R19"], ["265/35 R20"]],
  ev: [["215/55 R18", "235/45 R19"], ["255/40 R20"]]
};

const segmentBodies = {
  small: "hatchback",
  compact: "hatchback/sedan",
  midsize: "sedan/wagon",
  executive: "sedan/wagon",
  luxury: "sedan",
  suv: "SUV",
  largeSuv: "SUV",
  mpv: "MPV",
  van: "van",
  sport: "coupe",
  ev: "EV"
};

const segmentMods = {
  small: ["1.2", "1.4", "1.6"],
  compact: ["1.4 TSI", "1.6", "2.0"],
  midsize: ["1.6 TDI", "2.0 TDI", "2.0 Petrol"],
  executive: ["2.0 TDI", "2.0 TFSI", "3.0 TDI"],
  luxury: ["3.0", "Hybrid", "Performance"],
  suv: ["1.6", "2.0", "Hybrid"],
  largeSuv: ["2.0", "3.0", "Hybrid"],
  mpv: ["1.6", "2.0", "Diesel"],
  van: ["1.6 HDI", "2.0 Diesel", "Cargo"],
  sport: ["2.0 Turbo", "3.0", "Performance"],
  ev: ["Standard Range", "Long Range", "Performance"]
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const records = [];

for (const [brand, models] of Object.entries(brandModels)) {
  for (const [model, segment] of models) {
    for (const [generation, yearFrom, yearTo] of Object.values(generationNames)) {
      const sizes = segmentSizes[segment] || segmentSizes.compact;
      const mods = segmentMods[segment] || segmentMods.compact;
      const modIndex = generation === "I" ? 0 : generation === "II" ? 1 : 2;
      const modification = mods[modIndex] || mods[0];
      const yearMid = Math.min(yearTo, Math.max(yearFrom, Math.round((yearFrom + yearTo) / 2)));
      records.push({
        id: slugify(`${brand}-${model}-${generation}-${yearMid}-${modification}`),
        brand,
        model,
        generation,
        yearFrom,
        yearTo,
        body: segmentBodies[segment] || "passenger car",
        modification,
        recommendedSizes: sizes[0],
        optionalSizes: sizes[1],
        verified: false,
        sourceNote: "Starter fitment database. Verify OEM sizes before marking as verified."
      });
    }
  }
}

fs.writeFileSync(
  path.join(root, "car-fitments.json"),
  JSON.stringify(records, null, 2) + "\n",
  "utf8"
);

console.log(`Generated ${records.length} car fitment records.`);
