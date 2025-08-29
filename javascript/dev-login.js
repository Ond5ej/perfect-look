export function initDevLogin ({
  needPass = false,
  user = 'admin',
  pass = 'tajneheslo',
  loginBox,
  secretContent,
  form,
  userInput,
  passInput,
  errorMsg
}) {
  const loginBoxEl = document.querySelector(loginBox);
  const secretEl = document.querySelector(secretContent);
  if (!loginBoxEl || !secretEl) return;

  if (!needPass) {
    loginBoxEl.style.display = 'none';
    secretEl.style.display = 'block';
    return;
  }

  const formEl = document.querySelector(form);
  const userEl = document.querySelector(userInput);
  const passEl = document.querySelector(passInput);
  const errEl = document.querySelector(errorMsg);

  if (!formEl || !userEl || !passEl || !errEl) return;

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (userEl.value === user && passEl.value === pass) {
      loginBoxEl.style.display = 'none';
      secretEl.style.display = 'block';
      errEl.textContent = '';
    } else {
      errEl.textContent = 'Nesprávné jméno nebo heslo.';
    }
  });
}
