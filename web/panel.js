const list = document.querySelector('#business-list');
const count = document.querySelector('#business-count');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function loadApps() {
  try {
    const apps = window.MAZY_APPS;
    if (!Array.isArray(apps)) throw new Error('Catálogo indisponível');
    count.textContent = `${apps.length} ${apps.length === 1 ? 'negócio' : 'negócios'}`;
    list.innerHTML = apps.map(item => `<article class="business-card">
      <div class="card-top"><div class="business-icon"><img src="${escapeHtml(item.image)}" alt=""></div><span class="status"><i></i>${escapeHtml(item.status)}</span></div>
      <span class="category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
      <a class="open-link" href="${escapeHtml(item.href)}" aria-label="Abrir ${escapeHtml(item.name)}">Abrir aplicativo <span aria-hidden="true">↗</span></a>
      ${item.fileHref ? `<a class="file-link" href="${escapeHtml(item.fileHref)}" download aria-label="Baixar HTML offline de ${escapeHtml(item.name)}">Baixar arquivo HTML offline ↓</a>` : ''}
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
});
async function installPwa() {
  const message = document.querySelector('#install-message');
  if (location.protocol === 'file:') {
    message.innerHTML = 'O arquivo HTML continua funcionando aqui. Para instalar o ícone PWA, faça um backup no RC Serviços e abra a <a href="https://tiago48255-cpu.github.io/apks-pai-painel/">versão online em HTTPS</a> no Chrome. Depois, restaure o backup lá.';
  } else if (deferredInstall) {
    const prompt = deferredInstall;
    deferredInstall = null;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') return;
    message.textContent = 'Instalação cancelada. Você pode tentar novamente pelo menu ⋮ do Chrome.';
  } else if (window.matchMedia('(display-mode: standalone)').matches) {
    message.textContent = 'Este painel já está aberto como aplicativo.';
  } else {
    message.textContent = 'No Chrome do Android, abra o menu ⋮ e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.';
  }
  message.hidden = false;
  message.scrollIntoView({behavior:'smooth',block:'nearest'});
}
document.querySelector('#install-button').addEventListener('click', installPwa);
document.querySelectorAll('[data-install]').forEach(button => button.addEventListener('click', installPwa));

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('service-worker.js').catch(console.error);
}
loadApps();
