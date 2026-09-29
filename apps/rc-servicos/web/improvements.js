// Ajustes de dados e navegação mantidos separados do aplicativo original.
const RC_BACKUP_STORES = ['clientes', 'equip', 'os', 'fotos', 'orc', 'agenda', 'financeiro', 'estoque', 'contratos'];

async function backup() {
  app.innerHTML = `<div class="card"><h2>Backup e restauração</h2>
    <p>Guarde uma cópia completa dos dados deste aparelho. O backup inclui clientes, equipamentos, OS, fotos, orçamentos, agenda, financeiro, estoque, contratos, empresa e diagnósticos.</p>
    <div class="actions"><button class="primary" onclick="exportData()">Baixar backup completo</button>
    <label class="secondary" style="display:inline-block;cursor:pointer">Restaurar backup
    <input type="file" accept=".json,application/json" onchange="importData(event)" style="display:none"></label></div>
    <p class="muted">A restauração substitui os dados atuais deste aparelho. Salve um backup antes de restaurar. Dados do navegador e do APK ficam em espaços separados.</p></div>`;
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
    if (!confirm('Substituir todos os dados atuais deste aparelho pelos dados do backup? Esta ação não pode ser desfeita.')) return;
    if (!db) throw new Error('Banco de dados ainda não está disponível.');
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RC_BACKUP_STORES, 'readwrite');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Falha ao restaurar.'));
      tx.onabort = () => reject(tx.error || new Error('Restauração cancelada.'));
      for (const name of RC_BACKUP_STORES) {
        const objectStore = tx.objectStore(name);
        objectStore.clear();
        for (const item of data[name] || []) objectStore.put(item);
      }
    });
    if (data.empresa && typeof data.empresa === 'object') localStorage.setItem('rc_empresa', JSON.stringify(data.empresa));
    if (Array.isArray(data.diagnosticos)) rcSalvarHistorico(data.diagnosticos);
    alert('Backup restaurado com os vínculos originais preservados.');
    show('home');
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    alert('Não foi possível restaurar: ' + error.message);
  } finally {
    event.target.value = '';
  }
}
