(function () {
  const modal = document.getElementById("productOrderModal");
  const form = document.getElementById("productOrderForm");
  const closeButton = document.getElementById("productOrderClose");
  const status = document.getElementById("productOrderStatus");
  const productText = document.getElementById("productOrderProduct");
  const selectedProduct = document.getElementById("productOrderSelectedProduct");
  const retailPrice = document.getElementById("productOrderRetailPrice");
  const sizeInput = document.getElementById("productOrderSize");

  if (!modal || !form) return;

  const formatPrice = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return "";
    return new Intl.NumberFormat("uk-UA").format(number);
  };

  const encodeFormData = (payload) =>
    Object.keys(payload)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key] || "")}`)
      .join("&");

  function openOrderModal(button) {
    const product = button.dataset.product || "";
    const price = button.dataset.price || "";
    const size = button.dataset.size || product;
    const formattedPrice = formatPrice(price);

    selectedProduct.value = product;
    retailPrice.value = price;
    sizeInput.value = size;
    status.hidden = true;
    status.textContent = "";
    status.className = "order-status";

    productText.textContent = product
      ? `Заявка по позиції: ${product}${formattedPrice ? `, ${formattedPrice} грн` : ""}. Залиште контакт, і менеджер підтвердить наявність.`
      : "Залиште контакт, і менеджер підтвердить наявність та допоможе з оформленням.";

    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeOrderModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  async function submitOrder(event) {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Відправляю...";
    status.hidden = true;

    const payload = {
      "form-name": "public-order",
      email: "tiretop94@gmail.com",
      subject: selectedProduct.value
        ? `Роздрібне замовлення: ${selectedProduct.value}`
        : "Заявка з роздрібного сайту TireTop",
      client_name: document.getElementById("productOrderName")?.value || "",
      client_phone: document.getElementById("productOrderPhone")?.value || "",
      car_or_size: sizeInput.value || "",
      selected_product: selectedProduct.value || "",
      retail_price: retailPrice.value || "",
      comment: document.getElementById("productOrderComment")?.value || "",
      source: "product-page"
    };

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(payload)
      });

      if (!response.ok) throw new Error(`Netlify form returned ${response.status}`);

      status.textContent = "Заявку відправлено. Менеджер зв'яжеться з вами.";
      status.className = "order-status success";
      status.hidden = false;
      form.reset();
      selectedProduct.value = "";
      retailPrice.value = "";
    } catch (error) {
      console.warn("Product order submit failed:", error);
      status.textContent = "Не вдалося відправити заявку. Спробуйте ще раз або напишіть у Viber/Telegram.";
      status.className = "order-status error";
      status.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Відправити заявку";
    }
  }

  document.querySelectorAll(".static-order-button").forEach((button) => {
    button.addEventListener("click", () => openOrderModal(button));
  });

  closeButton?.addEventListener("click", closeOrderModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeOrderModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeOrderModal();
  });
  form.addEventListener("submit", submitOrder);
})();
