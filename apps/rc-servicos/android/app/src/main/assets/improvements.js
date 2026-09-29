// Ajustes de dados e navegação mantidos separados do aplicativo original.
const RC_BACKUP_STORES = ['clientes', 'equip', 'os', 'fotos', 'orc', 'agenda', 'financeiro', 'estoque', 'contratos'];

function renderNav() {
  const options = tabs.map(([id, title]) => `<option value="${id}">${title}</option>`).join('');
  const buttons = tabs.map(([id, title]) => `<button type="button" onclick="show('${id}')" id="tab-${id}">${title}</button>`).join('');
  nav.innerHTML = `<div class="nav-list">${buttons}</div><div class="nav-mobile"><label for="section-select">Ir para seção</label><select id="section-select" onchange="show(this.value)">${options}</select></div>`;
}

function active(id) {
  document.querySelectorAll('#nav .nav-list button').forEach(button => button.classList.toggle('active', button.id === 'tab-' + id));
  const select = document.querySelector('#section-select');
  if (select) select.value = id;
}

let rcInstallPrompt;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  rcInstallPrompt = event;
});
document.querySelector('#rc-install').addEventListener('click', async () => {
  const message = document.querySelector('#rc-install-message');
  if (location.protocol === 'file:') {
    message.innerHTML = 'Você pode continuar usando este arquivo no Chrome. Para instalar o ícone PWA, faça um backup aqui e abra a <a href="https://tiago48255-cpu.github.io/apks-pai-painel/apps/rc-servicos/web/index.html">versão online do RC Serviços</a>. Os dados do arquivo não passam automaticamente para a versão online; restaure o backup nela.';
  } else if (rcInstallPrompt) {
    const prompt = rcInstallPrompt;
    rcInstallPrompt = null;
    await prompt.prompt();
    if ((await prompt.userChoice).outcome === 'accepted') return;
    message.textContent = 'Instalação cancelada. Para tentar de novo, use o menu ⋮ do Chrome.';
  } else if (window.matchMedia('(display-mode: standalone)').matches || window.RCAndroid) {
    message.textContent = 'O RC Serviços já está aberto como aplicativo.';
  } else {
    message.textContent = 'No Chrome do Android, abra o menu ⋮ e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.';
  }
  message.hidden = false;
  message.scrollIntoView({behavior:'smooth',block:'nearest'});
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('../../../service-worker.js').catch(console.error);
}

async function backup() {
  app.innerHTML = `<div class="card"><h2>Backup e restauração</h2>
    <p>Guarde uma cópia completa dos dados deste aparelho. O backup inclui clientes, equipamentos, OS, fotos, orçamentos, agenda, financeiro, estoque, contratos, empresa e diagnósticos.</p>
    <div class="actions"><button class="primary" onclick="exportData()">Baixar backup completo</button>
    <label class="secondary" style="display:inline-block;cursor:pointer">Restaurar backup
    <input type="file" accept=".json,application/json" onchange="importData(event)" style="display:none"></label></div>
    <p class="muted">A restauração substitui os dados atuais deste aparelho. Salve um backup antes de restaurar. O arquivo HTML, a versão online e o APK podem usar espaços de dados separados.</p></div>
    <div class="card danger-zone"><h3>Apagar dados</h3><p class="muted">Escolha exatamente o que deseja apagar. Esta ação exige confirmação.</p><button type="button" class="danger" onclick="zerarSistema()">Escolher dados para apagar</button></div>`;
}

async function exportData() {
  if (!db) throw new Error('Banco de dados ainda não está disponível.');
  const data = { format: 'rc-servicos-backup', version: 5, exportedAt: new Date().toISOString(), empresa: getEmpresa(), diagnosticos: rcDiagHistorico() };
  for (const name of RC_BACKUP_STORES) data[name] = await all(name);
  const filename = 'rc-servicos-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  if (window.RCAndroid?.saveBackup) {
    window.RCAndroid.saveBackup(JSON.stringify(data), filename);
    return;
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || !Array.isArray(data.clientes) || !Array.isArray(data.equip) || !Array.isArray(data.os)) {
      throw new Error('O arquivo não contém um backup RC Serviços válido.');
    }
    for (const name of RC_BACKUP_STORES) {
      if (data[name] !== undefined && (!Array.isArray(data[name]) || data[name].some(item => !item || typeof item !== 'object' || !Number.isInteger(item.id) || item.id < 1))) {
        throw new Error('Dados inválidos em ' + name + '.');
      }
    }
    const includedStores = RC_BACKUP_STORES.filter(name => Array.isArray(data[name]));
    const legacy = includedStores.length < RC_BACKUP_STORES.length;
    const warning = legacy
      ? 'Este backup antigo contém apenas parte das seções. As seções ausentes não serão alteradas. Guarde o arquivo antigo se houver dados de agenda, financeiro, estoque, contratos ou fotos.\n\n'
      : '';
    if (!confirm(warning + 'Substituir os dados das seções incluídas neste backup? Esta ação não pode ser desfeita.')) return;
    if (!db) throw new Error('Banco de dados ainda não está disponível.');
    await new Promise((resolve, reject) => {
      const tx = db.transaction(includedStores, 'readwrite');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Falha ao restaurar.'));
      tx.onabort = () => reject(tx.error || new Error('Restauração cancelada.'));
      for (const name of includedStores) {
        const objectStore = tx.objectStore(name);
        objectStore.clear();
        for (const item of data[name]) objectStore.put(item);
      }
    });
    if (data.empresa && typeof data.empresa === 'object') localStorage.setItem('rc_empresa', JSON.stringify(data.empresa));
    if (Array.isArray(data.diagnosticos)) rcSalvarHistorico(data.diagnosticos);
    alert(legacy ? 'Backup antigo restaurado parcialmente. Confira as seções e mantenha o arquivo original.' : 'Backup restaurado com os vínculos originais preservados.');
    show('home');
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    alert('Não foi possível restaurar: ' + error.message);
  } finally {
    event.target.value = '';
  }
}
