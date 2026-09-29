const list = document.querySelector('#business-list');
const count = document.querySelector('#business-count');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

async function loadApps() {
  try {
    const response = await fetch('web/apps.json');
    if (!response.ok) throw new Error('Catálogo indisponível');
    const apps = await response.json();
    count.textContent = `${apps.length} ${apps.length === 1 ? 'negócio' : 'negócios'}`;
    list.innerHTML = apps.map(item => `<article class="business-card">
      <div class="card-top"><div class="business-icon"><img src="${escapeHtml(item.image)}" alt=""></div><span class="status"><i></i>${escapeHtml(item.status)}</span></div>
      <span class="category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
      <a class="open-link" href="${escapeHtml(item.href)}" aria-label="Abrir ${escapeHtml(item.name)}">Abrir aplicativo <span aria-hidden="true">↗</span></a>
      ${item.apkHref ? `<a class="apk-link" href="${escapeHtml(item.apkHref)}" aria-label="Baixar APK de ${escapeHtml(item.name)}">Baixar APK para Android ↓</a>` : ''}
    </article>`).join('');
  } catch (error) {
    list.innerHTML = '<p class="error">Não foi possível carregar os aplicativos. Recarregue a página.</p>';
    console.error(error);
  }
}

let deferredInstall;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
  document.querySelector('#install-button').hidden = false;
});
document.querySelector('#install-button').addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  document.querySelector('#install-button').hidden = true;
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('service-worker.js').catch(console.error);
}
loadApps();
