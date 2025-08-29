export function initFBChat ({ pageId, locale = 'cs_CZ', version = 'v19.0' }) {
  const chatbox = document.getElementById('fb-customer-chat');
  if (!chatbox) return;

  chatbox.setAttribute('page_id', pageId);
  chatbox.setAttribute('attribution', 'biz_inbox');

  window.fbAsyncInit = function () {
    FB.init({ xfbml: true, version });
  };

  (function (d, s, id) {
    const fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    const js = d.createElement(s); js.id = id;
    js.src = `https://connect.facebook.net/${locale}/sdk/xfbml.customerchat.js`;
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}
