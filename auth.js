const sheetConfig = {
  id: "1iRwP1c107v_MvdKUGUssmNEyvJpC42mXdqPVoZ0G_9s",
  sheetName: "Каталог шин - готовий прайс літо зима 15.05.2026",
  clientsSheetName: "clients"
};
const authStorageKey = "tyreCatalogClient";
const emergencyClients = [
  { phone: "+380671234567", pin: "1234", name: "Адмін", active: true },
  { phone: "+380689159643", pin: "1111", name: "Адмін", active: true }
];
const loginLogEndpoint = "https://script.google.com/macros/s/AKfycbwnMTdbet4YOzfNkNKK4ZDpOjxdXAnDwaA1KIj4WwaAUTPRae5FyV-39slT6VhyXBOj/exec";

function sheetJsonpUrl(callbackName, sheetName = sheetConfig.sheetName) {
  const params = new URLSearchParams({
    tqx: `responseHandler:${callbackName}`,
    sheet: sheetName,
    headers: "1",
    cache: Date.now().toString()
  });

  return `https://docs.google.com/spreadsheets/d/${sheetConfig.id}/gviz/tq?${params.toString()}`;
}

function loadSheetWithJsonp(sheetName, callbackPrefix = "googleSheetLoaded") {
  return new Promise((resolve, reject) => {
    const callbackName = `${callbackPrefix}_${Date.now()}`;
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

    script.src = sheetJsonpUrl(callbackName, sheetName);
    document.head.append(script);
  });
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("380")) return `+${digits}`;
  if (digits.startsWith("0")) return `+38${digits}`;
  if (digits.length) return `+${digits}`;

  return "";
}

function clientsFromGoogleTable(table) {
  const headers = table.cols.map((column) => String(column.label || column.id).trim().toLowerCase());

  return table.rows.map((row) => {
    const data = {};

    headers.forEach((header, cellIndex) => {
      const cell = row.c[cellIndex];
      data[header] = cell?.f ?? cell?.v ?? "";
    });

    return {
      phone: normalizePhone(data.phone),
      pin: String(data.pin || "").trim(),
      name: String(data.name || "").trim(),
      active: String(data.active || "").trim().toLowerCase() !== "false"
    };
  }).filter((client) => client.phone && client.pin);
}

async function authenticateClient(phone, pin) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedPin = String(pin || "").trim();
  const emergencyClient = emergencyClients.find((client) => client.active && client.phone === normalizedPhone && client.pin === normalizedPin);

  if (emergencyClient) {
    return emergencyClient;
  }

  const table = await loadSheetWithJsonp(sheetConfig.clientsSheetName, "clientsSheetLoaded");
  const clients = clientsFromGoogleTable(table);

  return clients.find((client) => client.active && client.phone === normalizedPhone && client.pin === normalizedPin);
}

function currentClient() {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey) || "null");
  } catch {
    return null;
  }
}

function saveClientSession(client) {
  localStorage.setItem(authStorageKey, JSON.stringify({
    phone: client.phone,
    name: client.name,
    loggedAt: Date.now()
  }));
}

function clearClientSession() {
  localStorage.removeItem(authStorageKey);
}

function deviceLabel() {
  const ua = navigator.userAgent;
  const device = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iPhone/iPad" : /Windows/i.test(ua) ? "Windows" : "Other";
  const browser = /Edg/i.test(ua) ? "Edge" : /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : /Firefox/i.test(ua) ? "Firefox" : "Browser";
  return `${device} ${browser}`;
}

function logClientLogin(client) {
  if (!loginLogEndpoint) return;

  const payload = {
    phone: client.phone || "",
    name: client.name || "",
    device: deviceLabel(),
    page: window.location.href,
    source: "catalog-login"
  };

  fetch(loginLogEndpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch((error) => {
    console.warn("Login log failed:", error);
  });
}
