(function () {
  const modal = document.getElementById("productOrderModal");
  const form = document.getElementById("productOrderForm");
  const closeButton = document.getElementById("productOrderClose");
  const status = document.getElementById("productOrderStatus");
  const productText = document.getElementById("productOrderProduct");
  const productPrice = document.getElementById("productOrderPrice");
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

    productText.textContent = product || "Підбір шин менеджером";
    if (productPrice) {
      productPrice.textContent = formattedPrice ? `${formattedPrice} грн` : "Менеджер уточнить ціну та наявність";
    }

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
      client_name: [
        document.getElementById("productOrderLastName")?.value || "",
        document.getElementById("productOrderFirstName")?.value || "",
        document.getElementById("productOrderMiddleName")?.value || ""
      ].filter(Boolean).join(" "),
      first_name: document.getElementById("productOrderFirstName")?.value || "",
      last_name: document.getElementById("productOrderLastName")?.value || "",
      middle_name: document.getElementById("productOrderMiddleName")?.value || "",
      client_phone: document.getElementById("productOrderPhone")?.value || "",
      client_email: document.getElementById("productOrderEmail")?.value || "",
      car_or_size: sizeInput.value || "",
      selected_product: selectedProduct.value || "",
      retail_price: retailPrice.value || "",
      quantity: document.getElementById("productOrderQuantity")?.value || "",
      delivery_method: document.getElementById("productOrderDelivery")?.value || "",
      delivery_city: document.getElementById("productOrderCity")?.value || "",
      delivery_branch: document.getElementById("productOrderBranch")?.value || "",
      payment_method: document.getElementById("productOrderPayment")?.value || "",
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
