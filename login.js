const loginForm = document.querySelector("#loginForm");
const loginPhone = document.querySelector("#loginPhone");
const loginPin = document.querySelector("#loginPin");
const loginError = document.querySelector("#loginError");

if (currentClient()) {
  window.location.replace("wholesale.html");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;

  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Перевірка...";

  try {
    const client = await authenticateClient(loginPhone.value, loginPin.value);

    if (!client) {
      loginError.textContent = "Телефон або PIN не знайдено.";
      loginError.hidden = false;
      return;
    }

    saveClientSession(client);
    logClientLogin(client);
    window.location.replace("wholesale.html");
  } catch (error) {
    console.warn("Login failed:", error);
    loginError.textContent = "Не вдалося перевірити доступ. Спробуйте ще раз.";
    loginError.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Увійти";
  }
});
