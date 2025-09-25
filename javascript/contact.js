export function initContactForm ({ form }) {
  const formEl = document.querySelector(form);
  const statusEl = document.getElementById("formStatus");
  let hideTimeout;

  if (!formEl || !statusEl) return;

  // inicializace EmailJS
  emailjs.init("xGakMf7erbmCHBBEa"); // váš public key

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = formEl.querySelector('button[type="submit"]');
    btn.disabled = true;
    clearTimeout(hideTimeout);

    statusEl.textContent = "Odesílám…";
    statusEl.className = "form-status";

    const formData = new FormData(formEl);
    const payload = {
      from_name: formData.get("name"),
      reply_to: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      await emailjs.send(
        "service_kvtyphh",   // váš SERVICE_ID
        "template_3y5ie79",  // váš TEMPLATE_ID
        payload
      );

      formEl.reset();
      statusEl.textContent = "Děkujeme! Zpráva byla úspěšně odeslána.";
      statusEl.classList.add("success");
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Omlouváme se, odeslání selhalo. Zkuste to prosím znovu.";
      statusEl.classList.add("error");
    } finally {
      btn.disabled = false;

      hideTimeout = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.className = "form-status";
      }, 5000);
    }
  });
}

