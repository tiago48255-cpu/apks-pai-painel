const tabs=[['home','Início'],['atend','Atendimentos'],['clientes','Clientes'],['equip','Equipamentos'],['os','Ordens de Serviço'],['orc','Orçamentos'],['pmoc','PMOC'],['ia','Assistência IA'],['relatorios','Relatórios'],['empresa','Minha Empresa'],['backup','Backup']];
let db;
const req=indexedDB.open('rcservicos',4);
req.onupgradeneeded=e=>{db=e.target.result;
 ['clientes','equip','os','fotos','orc','agenda','financeiro','estoque','contratos'].forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:'id',autoIncrement:true})});
};
req.onerror=e=>{console.error('Erro IndexedDB:',e.target.error); alert('Não foi possível abrir o banco de dados do sistema. Feche outras abas do RC Serviços e abra novamente.');};
req.onblocked=()=>{console.warn('IndexedDB bloqueado');};
req.onsuccess=e=>{db=e.target.result; db.onversionchange=()=>db.close(); init()};
function store(name,mode='readonly'){return db.transaction(name,mode).objectStore(name)}
function all(name){return new Promise((res,rej)=>{let r=store(name).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function put(name,obj){return new Promise((res,rej)=>{let r=store(name,'readwrite').put(obj);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function del(name,id){return new Promise((res,rej)=>{let r=store(name,'readwrite').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
async function init(){renderNav();show('home')}
function renderNav(){nav.innerHTML=tabs.map((t,i)=>`<button onclick="show('${t[0]}')" id="tab-${t[0]}">${t[1]}</button>`).join('') + `<button class="danger" style="margin-left:6px" onclick="zerarSistema()" title="Apagar todos os dados">🗑️ Zerar</button>`}
function active(n){document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));document.getElementById('tab-'+n)?.classList.add('active')}
async function show(n){active(n); if(n==='home')return home(); if(n==='atend')return atendimentos(); if(n==='clientes')return clientes();if(n==='equip')return equip();if(n==='os')return os();if(n==='orc')return orcamentos();if(n==='pmoc')return pmoc();if(n==='ia')return assistenciaIA();if(n==='relatorios')return relatorios();if(n==='empresa')return empresa();if(n==='backup')return backup()}
async function home(){let c=await all('clientes'),e=await all('equip'),o=await all('os'),q=await all('orc');let now=new Date().toISOString().slice(0,10);let pend=o.filter(x=>x.data>=now).length;app.innerHTML=`
<div class="grid">
<div class="card"><div class="muted">Clientes</div><div class="stat">${c.length}</div></div>
<div class="card"><div class="muted">Equipamentos</div><div class="stat">${e.length}</div></div>
<div class="card"><div class="muted">Ordens de serviço</div><div class="stat">${o.length}</div></div>
<div class="card"><div class="muted">Orçamentos</div><div class="stat">${q.length}</div></div>
</div>
<div class="card"><h2>Painel RC Serviços</h2><p>Organize toda a rotina: cliente → equipamento → orçamento → OS → checklist → medições → fotos → assinatura → PDF.</p>
<div class="actions"><button class="primary" onclick="show('clientes')">+ Novo cliente</button><button class="primary" onclick="show('equip')">+ Equipamento</button><button class="primary" onclick="show('orc')">+ Orçamento</button><button class="primary" onclick="show('os')">+ Nova OS</button><button class="secondary" onclick="show('pmoc')">PMOC</button></div></div>
<div class="card"><h3>Recursos da versão completa</h3><div class="grid">
<div>✔ OS numerada automaticamente</div><div>✔ Orçamento e aprovação</div><div>✔ Materiais e mão de obra</div><div>✔ Garantia e observações</div><div>✔ Checklist técnico</div><div>✔ Medições elétricas e frigoríficas</div><div>✔ Fotos e assinatura</div><div>✔ PDF profissional</div><div>✔ Histórico do equipamento</div><div>✔ Backup local</div></div></div>`}
async function clientes(){let cs=await all('clientes');app.innerHTML=`
<div class="card"><h2>Novo cliente</h2><div class="grid">
<div><label>Nome / Empresa</label><input id="cnome"></div><div><label>CPF/CNPJ</label><input id="ccpf"></div>
<div><label>Telefone/WhatsApp</label><input id="ctel"></div><div><label>E-mail</label><input id="cemail"></div>
<div><label>Endereço</label><input id="cend"></div><div><label>Responsável</label><input id="cres"></div>
</div><div class="actions"><button class="primary" onclick="saveCliente()">Salvar cliente</button></div></div>
<div class="card"><h2>Clientes cadastrados</h2>${cs.length?`<table><tr><th>Cliente</th><th>Contato</th><th>Endereço</th><th></th></tr>${cs.map(c=>`<tr><td><b>${esc(c.nome)}</b><br><span class="muted">${esc(c.cpf||'')}</span></td><td>${esc(c.tel||'')}<br>${esc(c.email||'')}</td><td>${esc(c.end||'')}</td><td><button class="danger" onclick="removeCliente(${c.id})">Excluir</button></td></tr>`).join('')}</table>`:'<p class="muted">Nenhum cliente cadastrado.</p>'}</div>`}
async function saveCliente(){await put('clientes',{nome:cnome.value,cpf:ccpf.value,tel:ctel.value,email:cemail.value,end:cend.value,res:cres.value});show('clientes')}
async function removeCliente(id){if(confirm('Excluir este cliente?')){await del('clientes',id);show('clientes')}}
const checklist=['Inspeção visual geral','EPI e proteção do ambiente','Desligamento e segurança elétrica','Limpeza dos filtros','Higienização da serpentina/evaporador','Limpeza da turbina/blower','Limpeza da bandeja de drenagem','Desobstrução e teste do dreno','Aplicação de bactericida/fungicida','Inspeção da condensadora','Verificação de vazamentos/anomalias','Inspeção visual das conexões elétricas','Medição de tensão','Medição de corrente','Medição de temperaturas','Teste final de funcionamento'];
async function equipBase(){let es=await all('equip'),cs=await all('clientes');app.innerHTML=`
<div class="card"><h2>Novo equipamento</h2><div class="grid">
<div><label>Cliente</label><select id="ecli">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div>
<div><label>Local</label><input id="elocal" placeholder="Sala, quarto, loja..."></div><div><label>Marca</label><input id="emarca"></div>
<div><label>Modelo</label><input id="emodelo" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" tabindex="0"></div><div><label>Potência / BTU/h</label><input id="ebtu" type="text" inputmode="numeric" autocomplete="off" tabindex="0"></div>
<div><label>Refrigerante</label><select id="egas"><option>R32</option><option>R410A</option><option>R22</option><option>Outro</option></select></div>
<div><label>Tensão</label><input id="etensao" placeholder="220 V"></div><div><label>Tipo</label><select id="etipo"><option>Split Hi-Wall</option><option>Split Cassete</option><option>Split Piso-Teto</option><option>Janela</option><option>Outro</option></select></div>
<div><label>Nº patrimônio/identificação</label><input id="epat"></div>
</div><div class="actions"><button class="primary" onclick="saveEquip()">Salvar equipamento</button></div></div>
<div class="card"><h2>Equipamentos</h2>${es.length?`<table><tr><th>Cliente</th><th>Equipamento</th><th>Dados</th><th></th></tr>${es.map(e=>{let c=cs.find(x=>x.id==e.clienteId);return `<tr><td>${esc(c?.nome||'')}</td><td><b>${esc(e.marca)} ${esc(e.modelo)}</b><br>${esc(e.local)}</td><td>${esc(e.btu)} BTU • ${esc(e.gas)} • ${esc(e.tensao)}</td><td><button class="danger" onclick="removeEquip(${e.id})">Excluir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum equipamento.</p>'}</div>`}
async function saveEquip(){await put('equip',{clienteId:+ecli.value,local:elocal.value,marca:emarca.value,modelo:emodelo.value,btu:ebtu.value,gas:egas.value,tensao:etensao.value,tipo:etipo.value,pat:epat.value});show('equip')}
async function removeEquip(id){if(confirm('Excluir este equipamento?')){await del('equip',id);show('equip')}}
async function os(){let cs=await all('clientes'),es=await all('equip'),osx=await all('os');app.innerHTML=`
<div class="card"><h2>Nova Ordem de Serviço</h2><div class="grid">
<div><label>Cliente</label><select id="ocliente" onchange="filterEquip()">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div>
<div><label>Equipamento</label><select id="oequip">${es.map(e=>`<option data-cli="${e.clienteId}" value="${e.id}">${esc(e.marca)} ${esc(e.modelo)} — ${esc(e.local)}</option>`).join('')}</select></div>
<div><label>Data</label><input id="odata" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
<div><label>Tipo de serviço</label><select id="otipo"><option>Manutenção preventiva</option><option>Higienização</option><option>Instalação</option><option>Manutenção corretiva</option><option>Vistoria / PMOC</option></select></div>
<div><label>Técnico responsável</label><input id="otecnico" value="Ricardo Costa"></div>
<div><label>Status do atendimento</label><select id="ostatus"><option>Em andamento</option><option>Aguardando aprovação</option><option>Aguardando peça</option><option>Agendado</option><option>Concluído</option><option>Cancelado</option></select></div>
<div><label>Garantia</label><input id="ogarantia" placeholder="Ex.: 90 dias"></div>
<div><label>Valor mão de obra (R$)</label><input id="omao" type="number" step="0.01"></div>
<div><label>Valor materiais (R$)</label><input id="omat" type="number" step="0.01"></div>
<div><label>Desconto (R$)</label><input id="odescval" type="number" step="0.01"></div>
<div><label>Forma de pagamento</label><select id="opag"><option>PIX</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option><option>Não informado</option></select></div>
<div><label>Pressão baixa</label><input id="opressao" placeholder="psi"></div><div><label>Corrente</label><input id="ocorrente" placeholder="A"></div>
<div><label>Tensão</label><input id="otensao" placeholder="V"></div><div><label>Temp. entrada</label><input id="otentrada" placeholder="°C"></div>
<div><label>Temp. saída</label><input id="osaida" placeholder="°C"></div><div><label>Superaquecimento</label><input id="osuper" placeholder="°C"></div>
<div><label>Sub-resfriamento</label><input id="osub" placeholder="°C"></div><div><label>Temperatura ambiente</label><input id="oamb" placeholder="°C"></div>
</div>
<h3>Checklist</h3><div id="checks">${checklist.map((x,i)=>`<label class="check"><input type="checkbox" id="ck${i}"> ${x}</label>`).join('')}</div>
<label>Materiais / peças utilizados</label><textarea id="omateriais" placeholder="Ex.: capacitor, fita isolante, produto bactericida..."></textarea>
<label>Serviço executado / observações</label><textarea id="odesc" placeholder="Descreva o serviço, peças, anomalias e recomendações..."></textarea>
<label>Fotos (antes/depois)</label><input id="photos" type="file" accept="image/*,.jpg,.jpeg,.png,.webp" multiple><small class="muted" style="display:block;margin-top:5px">Toque em “Escolher arquivos” para abrir a galeria ou pastas do aparelho. A câmera não é forçada.</small>
<div id="preview" class="photoGrid"></div>
<label>Assinatura do cliente</label><canvas id="signature"></canvas><div class="actions"><button class="secondary" onclick="clearSig()">Limpar assinatura</button><button class="primary" onclick="saveOS()">Salvar OS e abrir relatório</button></div></div>
<div class="card"><h2>Ordens salvas</h2>${osx.length?`<table><tr><th>Data</th><th>Cliente</th><th>Serviço</th><th></th></tr>${osx.slice().reverse().map(o=>{let c=cs.find(x=>x.id==o.clienteId);return `<tr><td>${o.data}</td><td>${esc(c?.nome||'')}</td><td>${esc(o.tipo)}</td><td><button class="secondary" onclick="report(${o.id})">Relatório</button> <button class="danger" onclick="removeOS(${o.id})">Excluir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhuma OS.</p>'}</div>`;
filterEquip(); initSig(); photos.onchange=previewPhotos}
function filterEquip(){let id=+ocliente.value;[...oequip.options].forEach(o=>o.hidden=+o.dataset.cli!==id);let first=[...oequip.options].find(o=>!o.hidden);if(first)oequip.value=first.value}
let photoData=[],sigData='';
function previewPhotos(){photoData=[];preview.innerHTML='';[...photos.files].forEach(f=>{let r=new FileReader();r.onload=()=>{photoData.push({name:f.name,data:r.result});let im=document.createElement('img');im.src=r.result;preview.appendChild(im)};r.readAsDataURL(f)})}
function initSig(){let c=signature,ctx=c.getContext('2d'),down=false;c.width=c.clientWidth*devicePixelRatio;c.height=c.clientHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.lineWidth=2;ctx.lineCap='round';function p(e){let r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}c.onpointerdown=e=>{down=true;let q=p(e);ctx.beginPath();ctx.moveTo(q.x,q.y)};c.onpointermove=e=>{if(!down)return;let q=p(e);ctx.lineTo(q.x,q.y);ctx.stroke()};c.onpointerup=()=>{down=false;sigData=c.toDataURL()}}
function clearSig(){let c=signature;c.getContext('2d').clearRect(0,0,c.width,c.height);sigData=''}
async function registrarServicoNoFinanceiro(o){let f=await all('financeiro');let existente=f.find(x=>x.origem==='OS'&&Number(x.osId)===Number(o.id));let valor=(Number(o.mao)||0)+(Number(o.materiaisValor)||0)-(Number(o.desconto)||0);let cs=await all('clientes');let c=cs.find(x=>x.id==o.clienteId);let desc='OS #'+o.id+' — '+(o.tipo||'Serviço')+(c?.nome?' — '+c.nome:'');if(valor<=0){if(existente)await del('financeiro',existente.id);return}let dados={data:o.data||today(),tipo:'Entrada',cat:'Serviço',valor,desc,origem:'OS',osId:o.id};if(existente){dados.id=existente.id;await put('financeiro',dados)}else await put('financeiro',dados)}
async function sincronizarServicosFinanceiro(){let osx=await all('os');for(const o of osx)await registrarServicoNoFinanceiro(o)}
async function saveOS(){let checks=checklist.map((x,i)=>({item:x,ok:document.getElementById('ck'+i).checked}));let id=await put('os',{clienteId:+ocliente.value,equipId:+oequip.value,data:odata.value,tipo:otipo.value,tecnico:otecnico.value,status:ostatus.value,garantia:ogarantia.value,mao:+omao.value||0,materiaisValor:+omat.value||0,desconto:+odescval.value||0,pagamento:opag.value,materiais:omateriais.value,pressao:opressao.value,corrente:ocorrente.value,tensao:otensao.value,entrada:otentrada.value,saida:osaida.value,super:osuper.value,sub:osub.value,amb:oamb.value,checks,desc:odesc.value,photos:photoData,signature:sigData});let o=(await all('os')).find(x=>x.id==id);await registrarServicoNoFinanceiro(o);alert('OS salva e receita registrada na planilha financeira.');report(id)}
async function removeOS(id){if(confirm('Excluir esta OS?')){await del('os',id);let f=await all('financeiro');for(const x of f.filter(x=>x.origem==='OS'&&Number(x.osId)===Number(id)))await del('financeiro',x.id);show('os')}}
async function report(id){
  let o=(await all('os')).find(x=>x.id==id),cs=await all('clientes'),es=await all('equip');
  if(!o){alert('OS não encontrada.');return;}
  let c=cs.find(x=>x.id==o.clienteId),e=es.find(x=>x.id==o.equipId);
  let checks=(o.checks||[]).map(x=>`<li>${x.ok?'☑':'☐'} ${esc(x.item)}</li>`).join('');
  let photos=(o.photos||[]).map(p=>`<img src="${p.data}" style="width:220px;height:160px;object-fit:cover;margin:5px;border:1px solid #222">`).join('');
  let html=`<div class="os-print-page">
    <div class="docHeader"><img src="${newLogoUri()}" alt="RC Serviços"></div>
    <div style="text-align:center;margin-bottom:10px">${esc(getEmpresa().responsavel)} • ${esc(getEmpresa().telefone)} • ${esc(getEmpresa().cidade)}</div>
    <h1 style="text-align:center;font-size:22px">RELATÓRIO DE ORDEM DE SERVIÇO / PMOC — OS Nº ${o.id}</h1>
    <div class="box"><b>OS:</b> ${o.id} &nbsp; <b>Data:</b> ${esc(o.data)} &nbsp; <b>Serviço:</b> ${esc(o.tipo)} &nbsp; <b>Status:</b> ${esc(o.status||'Em andamento')}</div>
    <h2>Cliente</h2><div class="box"><b>${esc(c?.nome||'')}</b><br>${esc(c?.cpf||'')}<br>${esc(c?.tel||'')}<br>${esc(c?.end||'')}</div>
    <h2>Equipamento</h2><div class="box">${esc(e?.marca||'')} ${esc(e?.modelo||'')} • ${esc(e?.tipo||'')} • ${esc(e?.btu||'')} BTU/h • ${esc(e?.gas||'')} • ${esc(e?.tensao||'')}<br>Local: ${esc(e?.local||'')} • Patrimônio: ${esc(e?.pat||'')}</div>
    <h2>Medições</h2><table><tr><th>Pressão</th><th>Corrente</th><th>Tensão</th><th>Temp. entrada</th><th>Temp. saída</th><th>Ambiente</th></tr><tr><td>${esc(o.pressao)}</td><td>${esc(o.corrente)}</td><td>${esc(o.tensao)}</td><td>${esc(o.entrada)}</td><td>${esc(o.saida)}</td><td>${esc(o.amb)}</td></tr></table>
    <p><b>Superaquecimento:</b> ${esc(o.super)} &nbsp; <b>Sub-resfriamento:</b> ${esc(o.sub)}</p>
    <h2>Checklist</h2><ul>${checks}</ul>
    <h2>Materiais / Peças</h2><div class="box">${esc(o.materiais||'').replace(/\n/g,'<br>')}</div>
    <h2>Serviço / Observações</h2><div class="box">${esc(o.desc||'').replace(/\n/g,'<br>')}</div>
    <h2>Valores</h2><table><tr><th>Mão de obra</th><th>Materiais</th><th>Desconto</th><th>Total</th><th>Pagamento</th></tr><tr><td>R$ ${(o.mao||0).toFixed(2)}</td><td>R$ ${(o.materiaisValor||0).toFixed(2)}</td><td>R$ ${(o.desconto||0).toFixed(2)}</td><td><b>R$ ${((o.mao||0)+(o.materiaisValor||0)-(o.desconto||0)).toFixed(2)}</b></td><td>${esc(o.pagamento||'')}</td></tr></table>
    <p><b>Técnico:</b> ${esc(o.tecnico||'')} &nbsp; <b>Garantia:</b> ${esc(o.garantia||'')}</p>
    ${photos?'<h2>Fotos</h2><div>'+photos+'</div>':''}${o.signature?'<h2>Assinatura do cliente</h2><img class="sig" src="'+o.signature+'">':''}
    <p style="margin-top:40px;font-size:11px">Documento gerado pelo sistema RC Serviços. Assinatura e registros devem refletir os serviços efetivamente realizados.</p>
  </div>`;
  app.innerHTML=`<div class="card no-print"><div class="actions"><button class="primary" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button><button class="secondary" onclick="show('relatorios')">← Voltar</button></div></div>${html}`;
  window.scrollTo({top:0,behavior:'smooth'});
}

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
// Garante edição e abertura do teclado em celulares Android
document.addEventListener("touchend",function(ev){const el=ev.target.closest("input,textarea");if(!el||el.disabled||el.readOnly)return;setTimeout(()=>{try{el.focus({preventScroll:true});}catch(e){el.focus();}},40);},{passive:true});
document.addEventListener("click",function(ev){const el=ev.target.closest("input,textarea");if(el&&!el.disabled&&!el.readOnly){setTimeout(()=>el.focus(),20);}});

function getEmpresa(){return JSON.parse(localStorage.getItem('rc_empresa')||'{"nome":"RC SERVIÇOS","responsavel":"Ricardo Costa","telefone":"","whatsapp":"","email":"","cnpj":"","endereco":"","cidade":"","logo":"LOGO_EMBUTIDA"}')}
function saveEmpresa(){let x={nome:enome.value,responsavel:eres.value,telefone:etel.value,whatsapp:ewpp.value,email:eemail.value,cnpj:ecnpj.value,endereco:eend.value,cidade:ecidade.value,logo:elogo.value};localStorage.setItem('rc_empresa',JSON.stringify(x));alert('Dados da empresa salvos.');show('empresa')}
function empresa(){let x=getEmpresa();app.innerHTML=`<div class="card"><h2>Minha Empresa</h2><p class="muted">Esses dados aparecem automaticamente nos relatórios e orçamentos.</p><div style="padding:10px;background:#111827;border-radius:10px;text-align:center;margin-bottom:12px"><img src="${RC_COMPANY_LOGO_URI}" style="max-width:220px;max-height:90px;object-fit:contain"></div><div class="grid">
<div><label>Nome da empresa</label><input id="enome" value="${esc(x.nome)}"></div><div><label>Responsável técnico</label><input id="eres" value="${esc(x.responsavel)}"></div>
<div><label>Telefone</label><input id="etel" value="${esc(x.telefone)}"></div><div><label>WhatsApp</label><input id="ewpp" value="${esc(x.whatsapp)}"></div>
<div><label>E-mail</label><input id="eemail" value="${esc(x.email)}"></div><div><label>CNPJ</label><input id="ecnpj" value="${esc(x.cnpj)}"></div>
<div><label>Endereço</label><input id="eend" value="${esc(x.endereco)}"></div><div><label>Cidade/UF</label><input id="ecidade" value="${esc(x.cidade)}"></div>
</div><label>Logo (opcional)</label><textarea id="elogo" placeholder="Logo incorporada ao sistema.">${esc(x.logo||"LOGO_EMBUTIDA")}</textarea>
<div class="actions"><button class="primary" onclick="saveEmpresa()">Salvar dados da empresa</button></div></div>`}


async function orcamentos(){let cs=await all('clientes'),qs=await all('orc');app.innerHTML=`
<div class="card"><h2>Novo orçamento</h2><div class="grid">
<div><label>Cliente</label><select id="qcli">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div>
<div><label>Validade</label><input id="qvalid" type="date"></div>
<div><label>Serviço</label><input id="qserv" placeholder="Higienização, instalação, manutenção..."></div>
<div><label>Quantidade</label><input id="qqtd" type="number" value="1"></div>
<div><label>Valor unitário (R$)</label><input id="qunit" type="number" step="0.01"></div>
<div><label>Desconto (R$)</label><input id="qdes" type="number" step="0.01"></div>
</div><label>Descrição / condições</label><textarea id="qobs"></textarea>
<div class="actions"><button class="primary" onclick="saveOrc()">Salvar e gerar orçamento</button></div></div>
<div class="card"><h2>Orçamentos</h2>${qs.length?`<table><tr><th>Nº</th><th>Cliente</th><th>Serviço</th><th>Total</th><th></th></tr>${qs.slice().reverse().map(q=>{let c=cs.find(x=>x.id==q.clienteId);return `<tr><td>${q.id}</td><td>${esc(c?.nome||'')}</td><td>${esc(q.serv)}</td><td>R$ ${q.total.toFixed(2)}</td><td><button class="secondary" onclick="reportOrc(${q.id})">PDF</button> <button class="danger" onclick="delOrc(${q.id})">Excluir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum orçamento.</p>'}</div>`}
async function saveOrc(){let qtd=+qqtd.value||1,unit=+qunit.value||0,des=+qdes.value||0;let id=await put('orc',{clienteId:+qcli.value,valid:qvalid.value,serv:qserv.value,qtd,unit,des,total:qtd*unit-des,obs:qobs.value,data:new Date().toISOString().slice(0,10)});reportOrc(id)}
async function delOrc(id){if(confirm('Excluir orçamento?')){await del('orc',id);show('orc')}}
async function reportOrc(id){let q=(await all('orc')).find(x=>x.id==id),cs=await all('clientes'),c=cs.find(x=>x.id==q.clienteId);let w=window.open('','_blank');w.document.write(`<html><head><title>Orçamento ${q.id} - RC Serviços</title><style>body{font-family:Arial;padding:35px}.docHeader{display:block;width:100%;margin:0 0 18px;border-bottom:2px solid #111;padding:0 0 10px}.docHeader img{display:block;width:100%;height:auto;max-width:none;max-height:none;object-fit:contain;object-position:center top;margin:0 0 12px}table{width:100%;border-collapse:collapse;border:1px solid #222}td,th{border:1px solid #222;padding:10px;text-align:left}.box{border:1px solid #222;padding:12px;margin:12px 0}</style></head><body><div class="docHeader"><img src="${newLogoUri()}" alt="RC Serviços"></div><div style="text-align:center">${esc(getEmpresa().responsavel)} • ${esc(getEmpresa().telefone)} • ${esc(getEmpresa().cidade)}</div><h2>ORÇAMENTO Nº ${q.id}</h2><div class="box"><b>Cliente:</b> ${esc(c?.nome||'')}<br><b>Telefone:</b> ${esc(c?.tel||'')}<br><b>Endereço:</b> ${esc(c?.end||'')}<br><b>Validade:</b> ${esc(q.valid||'')}</div><table><tr><th>Serviço</th><th>Qtd.</th><th>Unitário</th><th>Desconto</th><th>Total</th></tr><tr><td>${esc(q.serv)}</td><td>${q.qtd}</td><td>R$ ${q.unit.toFixed(2)}</td><td>R$ ${q.des.toFixed(2)}</td><td><b>R$ ${q.total.toFixed(2)}</b></td></tr></table><h3>Condições / Observações</h3><div class="box">${esc(q.obs||'').replace(/\\n/g,'<br>')}</div><p style="margin-top:60px">________________________________________<br>RC Serviços — Ricardo Costa</p><scr\x69pt>window.onload=()=>setTimeout(()=>window.print(),500)<\/script></body></html>`);w.document.close()}
async function atendimentos(){
 const osx=await all('os'), qs=await all('orc'), ds=JSON.parse(localStorage.getItem('rc_diagnosticos')||'[]'), cs=await all('clientes'), es=await all('equip');
 const statusList=['Todos','Agendado','Em andamento','Aguardando aprovação','Aguardando peça','Concluído','Cancelado'];
 const counts={}; statusList.slice(1).forEach(st=>counts[st]=osx.filter(o=>(o.status||'Em andamento')===st).length);
 const totalReceita=osx.reduce((a,o)=>a+(Number(o.mao)||0)+(Number(o.materiaisValor)||0)-(Number(o.desconto)||0),0);
 const pend=osx.filter(o=>!['Concluído','Cancelado'].includes(o.status||'Em andamento')).length;
 app.innerHTML=`<div class="card"><h2>📋 Painel de Atendimentos</h2><p class="muted">Acompanhe OS, diagnósticos e orçamentos em um único lugar.</p>
 <div class="grid"><div class="card"><div class="muted">Atendimentos</div><div class="stat">${osx.length}</div></div><div class="card"><div class="muted">Em aberto</div><div class="stat">${pend}</div></div><div class="card"><div class="muted">Orçamentos</div><div class="stat">${qs.length}</div></div><div class="card"><div class="muted">Valor das OS</div><div class="stat">R$ ${totalReceita.toFixed(2)}</div></div></div></div>
 <div class="card"><h3>Status</h3><div class="actions">${statusList.slice(1).map(st=>`<button class="secondary" onclick="filtrarAtendimentos('${st}')">${st}: ${counts[st]}</button>`).join('')}<button class="secondary" onclick="filtrarAtendimentos('Todos')">Todos: ${osx.length}</button></div></div>
 <div class="card"><h3>Ordens de serviço</h3><div id="listaAtendimentos">${rcTabelaAtendimentos(osx,cs,es)}</div></div>
 <div class="card"><h3>Diagnósticos recentes</h3>${ds.length?`<table><tr><th>Data</th><th>Equipamento</th><th>Status</th><th></th></tr>${ds.slice().reverse().slice(0,10).map(d=>{let e=es.find(x=>Number(x.id)===Number(d.equipId));return `<tr><td>${esc(d.data||'')}</td><td>${esc((d.marca||e?.marca||'')+' '+(d.modelo||e?.modelo||''))}</td><td>${esc(d.status||'Não informado')}</td><td><button class="secondary" onclick='gerarRelatorioTecnicoRC(${JSON.stringify(d).replace(/'/g,"&#39;")})'>Relatório</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum diagnóstico salvo.</p>'}</div>`;
}
function rcTabelaAtendimentos(list,cs,es){if(!list.length)return '<p class="muted">Nenhum atendimento encontrado.</p>';return `<table><tr><th>OS</th><th>Data</th><th>Cliente</th><th>Equipamento</th><th>Status</th><th>Valor</th><th>Ações</th></tr>${list.slice().reverse().map(o=>{let c=cs.find(x=>Number(x.id)===Number(o.clienteId)),e=es.find(x=>Number(x.id)===Number(o.equipId)),v=(Number(o.mao)||0)+(Number(o.materiaisValor)||0)-(Number(o.desconto)||0);return `<tr><td>${o.id}</td><td>${esc(o.data||'')}</td><td>${esc(c?.nome||'')}</td><td>${esc((e?.marca||'')+' '+(e?.modelo||''))}</td><td><select onchange="alterarStatusAtendimento(${o.id},this.value)">${['Agendado','Em andamento','Aguardando aprovação','Aguardando peça','Concluído','Cancelado'].map(st=>`<option ${((o.status||'Em andamento')===st)?'selected':''}>${st}</option>`).join('')}</select></td><td>R$ ${v.toFixed(2)}</td><td><button class="secondary" onclick="report(${o.id})">OS</button> <button class="danger" onclick="removeOS(${o.id})">Excluir</button></td></tr>`}).join('')}</table>`}
async function alterarStatusAtendimento(id,status){let o=(await all('os')).find(x=>Number(x.id)===Number(id));if(!o)return;o.status=status;await put('os',o);show('atend')}
async function filtrarAtendimentos(status){const osx=await all('os'),cs=await all('clientes'),es=await all('equip');const list=status==='Todos'?osx:osx.filter(o=>(o.status||'Em andamento')===status);const box=document.getElementById('listaAtendimentos');if(box)box.innerHTML=rcTabelaAtendimentos(list,cs,es)}

async function relatorios(){let osx=await all('os'),cs=await all('clientes');app.innerHTML=`<div class="card"><h2>Histórico de serviços</h2>${osx.length?`<table><tr><th>OS</th><th>Data</th><th>Cliente</th><th>Serviço</th><th>Valor</th><th></th></tr>${osx.slice().reverse().map(o=>{let c=cs.find(x=>x.id==o.clienteId),v=(o.mao||0)+(o.materiaisValor||0)-(o.desconto||0);return `<tr><td>${o.id}</td><td>${o.data}</td><td>${esc(c?.nome||'')}</td><td>${esc(o.tipo)}</td><td>R$ ${v.toFixed(2)}</td><td><button class="secondary" onclick="report(${o.id})">Abrir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum serviço registrado.</p>'}</div>`}


/* === BASE DE CÓDIGOS DE ERRO RC SERVIÇOS — módulo ampliado === */
const RC_CODIGOS_ERRO=[
{m:'LG',c:'CH05',d:'Erro de comunicação entre unidade interna e externa.',t:'Verificar alimentação das duas unidades, cabos de comunicação, bornes, sequência de ligação e placa eletrônica. O significado pode variar conforme a linha/modelo.'},
{m:'LG',c:'CH38',d:'Proteção relacionada à baixa quantidade de refrigerante / falta de refrigerante detectada pelo sistema.',t:'Verificar vazamento, estanqueidade, condições de operação e carga conforme especificação do modelo antes de adicionar refrigerante.'},
{m:'LG',c:'CH53',d:'Falha de comunicação entre unidades.',t:'Conferir cabo de comunicação, alimentação, conexões, interferências e placas. Confirmar o código no manual do modelo.'},
{m:'LG',c:'CH61',d:'Proteção por temperatura elevada / condição de alta temperatura, conforme modelo.',t:'Verificar troca de calor da condensadora, sujeira, ventilador, temperatura ambiente e condições de instalação.'},
{m:'LG',c:'CH10',d:'Falha relacionada ao motor/ventilador da unidade interna em determinadas linhas.',t:'Verificar alimentação do motor, conector, placa, travamento mecânico e sinal de comando.'},
{m:'LG',c:'CH07',d:'Condição anormal relacionada ao modo de operação em determinadas linhas.',t:'Confirmar configuração, comunicação entre unidades e compatibilidade dos modos. Consultar manual específico.'},
{m:'LG',c:'CH21',d:'Proteção/falha relacionada ao compressor ou circuito de potência em determinadas linhas.',t:'Verificar alimentação, corrente, módulo/inversor, compressor e proteções. Não condenar compressor apenas pelo código.'},
{m:'LG',c:'CH26',d:'Falha relacionada ao acionamento/posição do compressor em determinadas linhas inverter.',t:'Verificar compressor, cabos U/V/W, módulo IPM/inversor e resistência dos enrolamentos conforme manual.'},
{m:'LG',c:'CH32',d:'Proteção de descarga/compressor por condição térmica em determinadas linhas.',t:'Verificar fluxo de ar, condensadora, carga de refrigerante, temperatura de descarga e sensores.'},
{m:'LG',c:'CH34',d:'Proteção por alta pressão/condição de pressão elevada em determinadas linhas.',t:'Verificar condensadora, ventilador, obstrução, excesso de refrigerante e sensores/pressostatos conforme modelo.'},
{m:'LG',c:'CH67',d:'Falha/proteção relacionada ao ventilador da unidade externa em determinadas linhas.',t:'Verificar motor, hélice, alimentação, placa, conectores e obstrução mecânica.'},
{m:'LG',c:'F4',d:'Código relacionado a condição anormal de sensor/temperatura em determinadas linhas.',t:'Identificar o sensor pelo manual do modelo e medir resistência/sinal conforme tabela do fabricante.'},
{m:'Samsung',c:'C422',d:'Instabilidade na alimentação elétrica / condição de proteção do sistema; em algumas linhas também pode estar relacionada à refrigeração insuficiente.',t:'Verificar tensão, queda/oscilação de energia, conexões e condições de refrigeração. Se persistir, seguir diagnóstico específico do modelo.'},
{m:'Samsung',c:'CF',d:'Lembrete de limpeza/redefinição do filtro; não é necessariamente defeito.',t:'Limpar o filtro conforme manual e realizar a redefinição indicada pelo controle/modelo.'},
{m:'Samsung',c:'dF',d:'Modo de descongelamento automático durante aquecimento; normalmente não é falha.',t:'Aguardar o ciclo terminar. Se houver repetição anormal, investigar sensores, troca de calor e condições externas.'},
{m:'Samsung',c:'AP',d:'Indicação relacionada à configuração/conexão SmartThings em modelos compatíveis.',t:'Verificar o procedimento de configuração do Wi‑Fi/SmartThings do modelo.'},
{m:'Samsung',c:'C1',d:'Em modelos compatíveis, pode indicar limpeza automática em andamento.',t:'Aguardar o ciclo. Se o código permanecer fora da condição esperada, consultar o manual específico.'},
{m:'Samsung',c:'C154',d:'Falha/proteção relacionada ao ventilador da unidade interna em determinadas linhas.',t:'Verificar motor, alimentação, conector, placa e travamento mecânico.'},
{m:'Samsung',c:'C155',d:'Falha/proteção relacionada ao ventilador da unidade interna em determinadas linhas.',t:'Verificar motor, chicote, placa e comando do ventilador.'},
{m:'Samsung',c:'C176',d:'Código de proteção/diagnóstico que depende da série do equipamento.',t:'Registrar o código completo e consultar a tabela do modelo antes de substituir componentes.'},
{m:'Samsung',c:'C121',d:'Alarme cuja interpretação depende da linha/modelo e da forma de exibição.',t:'Registrar o código completo exibido, LEDs e momento da ocorrência; consultar manual de serviço do modelo.'},
{m:'Gree',c:'C5',d:'Problema no jumper da placa eletrônica da evaporadora ou condição associada à PCI.',t:'Verificar presença, encaixe e integridade do jumper e a placa principal.'},
{m:'Gree',c:'E1',d:'Proteção por alta pressão de refrigerante.',t:'Verificar carga de refrigerante, troca de calor, ventilador externo, obstruções, temperatura externa e sensor/pressostato.'},
{m:'Gree',c:'E2',d:'Proteção anticongelamento da unidade interna.',t:'Verificar filtro, fluxo de ar, serpentina, turbina, motor/capacitor e carga de refrigerante.'},
{m:'Gree',c:'E3',d:'Proteção por baixa pressão de refrigerante.',t:'Verificar vazamento, carga de refrigerante, fluxo de ar e restrições no circuito frigorífico.'},
{m:'Gree',c:'E4',d:'Proteção por alta temperatura de descarga do compressor.',t:'Verificar carga, troca de calor, superaquecimento, compressor e sensor de descarga.'},
{m:'Gree',c:'E5',d:'Proteção por sobrecorrente do compressor/eletrônica em determinadas linhas.',t:'Medir corrente, tensão e verificar compressor, módulo/inversor, ventilação e condições frigoríficas.'},
{m:'Gree',c:'E6',d:'Falha de comunicação entre unidades.',t:'Verificar alimentação, cabo de comunicação, bornes, sequência e placas.'},
{m:'Gree',c:'H3',d:'Proteção contra sobrecarga do compressor em determinadas linhas.',t:'Verificar pressão, temperatura, corrente, ventilação da condensadora e condições do compressor.'},
{m:'Gree',c:'H5',d:'Proteção do módulo IPM/inversor em determinadas linhas.',t:'Verificar alimentação, corrente, ventilação, dissipador, compressor e módulo IPM.'},
{m:'Gree',c:'H6',d:'Falha de realimentação do motor/ventilador em determinadas linhas.',t:'Verificar motor, alimentação, sinal de retorno, conector e placa.'},
{m:'Gree',c:'F0',d:'Falha/proteção relacionada a refrigerante ou sensor de pressão em determinadas linhas.',t:'Confirmar o significado no manual do modelo e verificar pressão, sensores e carga de refrigerante.'},
{m:'Midea',c:'E1',d:'Falha do sensor de temperatura do ambiente em determinadas linhas.',t:'Verificar sensor, conector e resistência/sinal conforme tabela do modelo.'},
{m:'Midea',c:'E2',d:'Falha do sensor de temperatura do evaporador em determinadas linhas.',t:'Verificar sensor do evaporador, conector e resistência/sinal.'},
{m:'Midea',c:'E3',d:'Código de falha que varia conforme a família do produto.',t:'Identificar modelo exato antes do diagnóstico; verificar sensores, placa e alimentação conforme manual.'},
{m:'Midea',c:'E4',d:'Falha no display/painel em determinadas linhas portáteis.',t:'Verificar cabo/conector do painel e placa de controle.'},
{m:'Midea',c:'P1',d:'Proteção relacionada à bandeja inferior cheia em determinados modelos portáteis.',t:'Drenar a bandeja, verificar mangueira/dreno e testar novamente.'},
{m:'Midea',c:'E5',d:'Falha elétrica/eletrônica em determinadas famílias de produtos.',t:'Verificar alimentação, conectores, placa e proteções; consultar o manual do modelo.'},
{m:'Midea',c:'E6',d:'Condição de temperatura elevada/falha de proteção em determinadas famílias.',t:'Verificar ventilação, temperatura e funcionamento do ventilador; confirmar tabela específica.'},
{m:'Midea',c:'E7',d:'Tensão de alimentação fora da faixa em determinadas linhas.',t:'Medir tensão de alimentação e comparar com a tensão nominal/faixa do equipamento.'},
{m:'Midea',c:'U1',d:'Erro de comunicação em determinadas linhas.',t:'Verificar cabos de comunicação, alimentação, conectores e placas.'},
{m:'Elgin',c:'E1',d:'Código cuja função varia conforme a série/modelo do equipamento.',t:'Identificar o modelo exato e consultar a tabela de códigos correspondente antes de trocar peças.'},
{m:'Elgin',c:'E2',d:'Código cuja função varia conforme a série/modelo.',t:'Registrar código completo, LEDs e comportamento; conferir sensores e comunicação conforme manual.'},
{m:'Elgin',c:'E3',d:'Código cuja função varia conforme a série/modelo.',t:'Verificar sensores, ventiladores, alimentação e parâmetros frigoríficos de acordo com o modelo.'},
{m:'Elgin',c:'E4',d:'Código cuja função varia conforme a série/modelo.',t:'Consultar tabela específica e confirmar medições antes de substituir placa.'},
{m:'Fujitsu',c:'A1',d:'Código associado a falha de sensor/temperatura em determinadas linhas.',t:'Identificar o sensor pelo modelo e verificar resistência, chicote e placa.'},
{m:'Fujitsu',c:'A2',d:'Código associado a condição de sensor/temperatura em determinadas linhas.',t:'Testar sensor, conexão e placa conforme manual de serviço.'},
{m:'Fujitsu',c:'A3',d:'Código associado ao sistema de drenagem em determinadas linhas.',t:'Verificar bandeja, bomba quando existente, mangueira, nível e obstrução.'},
{m:'Fujitsu',c:'A4',d:'Código de proteção/temperatura que depende da série.',t:'Verificar troca de calor, ventiladores, sensores e parâmetros do modelo.'},
{m:'Daikin',c:'U0',d:'Proteção relacionada à insuficiência de refrigerante em determinadas séries.',t:'Verificar vazamento, carga, condições de operação e parâmetros de superaquecimento/sub-resfriamento conforme modelo.'},
{m:'Daikin',c:'U4',d:'Falha de comunicação entre unidades interna e externa.',t:'Verificar alimentação, cabeamento de comunicação, bornes, placas e interferências.'},
{m:'Daikin',c:'A1',d:'Falha da placa eletrônica da unidade interna em determinadas séries.',t:'Verificar alimentação, placa, conectores e sinais de curto/queima.'},
{m:'Daikin',c:'A3',d:'Falha/proteção relacionada ao sistema de drenagem em determinadas séries.',t:'Verificar dreno, bomba, boia, bandeja e obstruções.'},
{m:'Daikin',c:'A5',d:'Proteção anticongelamento/controle de alta pressão conforme modo e série.',t:'Verificar fluxo de ar, filtros, serpentina, carga de refrigerante e sensores.'},
{m:'Daikin',c:'E5',d:'Proteção de sobrecarga do compressor em determinadas séries.',t:'Verificar corrente, pressão, ventilação, compressor e condições frigoríficas.'},
{m:'Carrier',c:'E1',d:'Código que pode indicar falha de sensor/controle dependendo da família.',t:'Confirmar modelo e consultar tabela específica; testar sensor, chicote e placa.'},
{m:'Carrier',c:'E2',d:'Código que varia conforme a série do equipamento.',t:'Identificar modelo exato e verificar sensores/placa conforme manual.'},
{m:'Carrier',c:'E3',d:'Código que varia conforme a série do equipamento.',t:'Conferir sensores, ventiladores, alimentação e parâmetros de operação.'},
{m:'Carrier',c:'E4',d:'Código que varia conforme a série do equipamento.',t:'Consultar tabela do modelo e realizar medições antes de condenar componentes.'},
{m:'Agratto',c:'E1',d:'Código cuja interpretação depende da linha/modelo.',t:'Identificar modelo exato, registrar código e consultar manual correspondente.'},
{m:'Agratto',c:'E2',d:'Código cuja interpretação depende da linha/modelo.',t:'Verificar sensores, comunicação e alimentação conforme a documentação do modelo.'},
{m:'Agratto',c:'E3',d:'Código cuja interpretação depende da linha/modelo.',t:'Verificar sensores, ventiladores e parâmetros frigoríficos conforme manual.'},
{m:'Agratto',c:'E4',d:'Código cuja interpretação depende da linha/modelo.',t:'Consultar tabela específica antes de substituir placa ou sensor.'}
];

function newLogoUri(){return RC_LOGO_URI}
function rcNormal(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim()}
function rcBuscarCodigo(){const marca=rcNormal(document.getElementById('rcMarcaErro')?.value);const codigo=rcNormal(document.getElementById('rcCodigoErro')?.value);const lista=RC_CODIGOS_ERRO.filter(x=>(!marca||rcNormal(x.m)===marca)&&(!codigo||rcNormal(x.c)===codigo));const box=document.getElementById('rcResultadoCodigo');if(!box)return;box.innerHTML=lista.length?lista.map(x=>`<div class="card" style="margin-top:8px"><div><span class="badge">${x.m}</span> <b>${x.c}</b></div><p><b>Diagnóstico:</b> ${esc(x.d)}</p><p><b>Testes / verificações:</b> ${esc(x.t)}</p><p class="muted">Confirme sempre o código no manual do modelo específico antes de substituir componentes.</p></div>`).join(''):`<div class="card" style="margin-top:8px"><b>Nenhum código encontrado.</b><p class="muted">Verifique a marca, o código e o modelo. Alguns fabricantes utilizam códigos diferentes para séries diferentes.</p></div>`}
function rcPreencherCodigo(){const codigo=rcNormal(document.getElementById('rcCodigoErro')?.value);const marca=rcNormal(document.getElementById('rcMarcaErro')?.value);const box=document.getElementById('rcSugestoesCodigo');if(!box)return;let lista=RC_CODIGOS_ERRO.filter(x=>(!marca||rcNormal(x.m)===marca)&&(!codigo||rcNormal(x.c).startsWith(codigo))).slice(0,12);box.innerHTML=lista.map(x=>`<button class="secondary" style="margin:3px" onclick="document.getElementById('rcMarcaErro').value='${x.m}';document.getElementById('rcCodigoErro').value='${x.c}';rcBuscarCodigo()">${x.m} — ${x.c}</button>`).join('')}
async function assistenciaIABase(){
app.innerHTML=`
<div class="card"><h2>🧠 Assistência Técnica — Diagnóstico Profissional</h2><p class="muted">Diagnóstico guiado por sintomas, medições, verificações e códigos. O sistema auxilia a análise; confirme parâmetros no manual do modelo.</p>
<div class="grid">
<div><label>Marca</label><select id="iaMarca"><option>Não informada</option><option>LG</option><option>Samsung</option><option>Gree</option><option>Midea</option><option>Elgin</option><option>Fujitsu</option><option>Daikin</option><option>Carrier</option><option>Agratto</option><option>Outra</option></select></div>
<div><label>Modelo exato</label><input id="iaModelo" placeholder="Ex.: S4-W12JA3WA"></div>
<div><label>Tipo</label><select id="iaTipo"><option>Split convencional</option><option>Split inverter</option><option>Multi Split</option><option>Portátil</option><option>Outro</option></select></div>
<div><label>Potência</label><input id="iabtu" inputmode="numeric" placeholder="Ex.: 12000 BTU"></div>
<div><label>Refrigerante</label><select id="iagas"><option>R32</option><option>R410A</option><option>R22</option><option>R407C</option><option>R134a</option><option>Outro</option><option>Não informado</option></select></div>
<div><label>Código de erro (opcional)</label><input id="iaerro" placeholder="Deixe vazio se não houver código"></div>
<div><label>Problema / sintoma principal</label><select id="iasint" onchange="rcAtualizarPerguntas()">
<option>Não liga</option><option>Não está gelando</option><option>Gela pouco</option><option>Ventila mas não refrigera</option><option>Evaporadora não sopra ar</option><option>Ventilador não gira</option><option>Compressor não parte</option><option>Compressor liga e desliga</option><option>Desarma o disjuntor</option><option>Evaporadora congelando</option><option>Tubulação congelando</option><option>Pressão baixa</option><option>Pressão alta</option><option>Vazamento de gás</option><option>Vazamento de água</option><option>Ruído / vibração</option><option>Odor de queimado</option><option>Baixa vazão de ar</option><option>Corrente acima do normal</option><option>Tensão baixa</option><option>Tensão alta</option><option>Placa eletrônica sem funcionamento</option><option>Sensor suspeito</option><option>Problema após instalação</option><option>Problema após manutenção</option><option>Outro</option>
</select></div>
</div></div>
<div class="card"><h3>🧭 Perguntas guiadas</h3><p class="muted">Responda o que você já verificou. O resultado usará essas respostas para direcionar os próximos testes.</p><div id="rcPerguntas"></div></div>
<div class="card"><h3>📏 Medições frigoríficas</h3><div class="grid">
<div><label>Pressão (psi)</label><input id="iapress" type="number" step="0.1"></div><div><label>Temperatura entrada (°C)</label><input id="iaent" type="number" step="0.1"></div><div><label>Temperatura saída (°C)</label><input id="iasaida" type="number" step="0.1"></div><div><label>Temperatura ambiente (°C)</label><input id="iaamb" type="number" step="0.1"></div><div><label>Superaquecimento (°C)</label><input id="iasuper" type="number" step="0.1"></div><div><label>Sub-resfriamento (°C)</label><input id="iasub" type="number" step="0.1"></div>
</div><div id="rcFrigoResumo" class="muted" style="margin-top:8px"></div></div>
<div class="card"><h3>⚡ Medições elétricas</h3><div class="grid">
<div><label>Tensão nominal (V)</label><input id="ianominal" type="number" step="1" placeholder="Ex.: 220"></div><div><label>Tensão medida (V)</label><input id="iatens" type="number" step="0.1"></div><div><label>Corrente nominal (A)</label><input id="iacorrnom" type="number" step="0.1"></div><div><label>Corrente medida (A)</label><input id="iacorr" type="number" step="0.1"></div><div><label>Capacitor nominal (µF)</label><input id="iacapnom" type="number" step="0.1"></div><div><label>Capacitor medido (µF)</label><input id="iacap" type="number" step="0.1"></div><div><label>Resistência compressor (Ω)</label><input id="iaohmcomp" type="number" step="0.1"></div><div><label>Observação elétrica</label><input id="iaeleobs" placeholder="Ex.: borne aquecido, placa sem alimentação..."></div>
</div></div>
<div class="card"><h3>📷 Evidências e status do atendimento</h3><div class="grid"><div><label>Status do atendimento</label><select id="iaStatus"><option>Diagnóstico em andamento</option><option>Diagnóstico concluído</option><option>Aguardando peça</option><option>Aguardando orçamento</option><option>Reparo autorizado</option><option>Reparo concluído</option><option>Equipamento liberado</option><option>Retorno necessário</option></select></div><div><label>Fotos do diagnóstico</label><input id="iaFotos" type="file" accept="image/*" multiple onchange="rcSelecionarFotosDiag(event)"></div></div><div id="rcFotosDiagPreview" class="grid" style="margin-top:10px"></div></div>
<div class="card"><h3>📝 Conclusão e orçamento</h3><div class="grid"><div><label>Conclusão técnica</label><textarea id="iaConclusao" placeholder="Informe o diagnóstico/conclusão final do atendimento..."></textarea></div><div><label>Recomendação ao cliente</label><textarea id="iaRecomendacao" placeholder="Informe o reparo recomendado, troca de peça, higienização, retorno etc."></textarea></div><div><label>Valor estimado / orçamento (R$)</label><input id="iaValor" inputmode="decimal" placeholder="Ex.: 350,00"></div><div><label>Garantia / prazo</label><input id="iaGarantia" placeholder="Ex.: 90 dias / conforme serviço"></div></div></div>
<div class="card"><h3>✍️ Assinatura do cliente</h3><p class="muted">O cliente pode assinar diretamente na tela do celular.</p><canvas id="rcAssinatura" width="700" height="220" style="width:100%;height:220px;border:1px solid #999;border-radius:6px;background:#fff;touch-action:none"></canvas><div class="actions"><button class="secondary" onclick="rcLimparAssinatura()">Limpar assinatura</button></div></div>
<div class="card"><h3>🔍 Checklist técnico</h3><div class="grid">
<label class="check"><input type="checkbox" id="iacFiltro"> Filtro verificado</label><label class="check"><input type="checkbox" id="iacSerp"> Evaporador/serpentina verificado</label><label class="check"><input type="checkbox" id="iacTurb"> Turbina/fluxo de ar verificado</label><label class="check"><input type="checkbox" id="iacCond"> Condensadora verificada</label><label class="check"><input type="checkbox" id="iacDreno"> Dreno verificado</label><label class="check"><input type="checkbox" id="iacEletrica"> Elétrica/conexões verificadas</label><label class="check"><input type="checkbox" id="iacVazamento"> Vazamento pesquisado</label><label class="check"><input type="checkbox" id="iacComunicacao"> Comunicação verificada</label><label class="check"><input type="checkbox" id="iacCompressor"> Compressor verificado</label><label class="check"><input type="checkbox" id="iacVentilador"> Ventiladores verificados</label><label class="check"><input type="checkbox" id="iacSensores"> Sensores verificados</label><label class="check"><input type="checkbox" id="iacVacuo"> Vácuo/estanqueidade verificados</label>
</div><label>Observações</label><textarea id="iaobs" placeholder="Descreva o comportamento, medições e o que encontrou..."></textarea><div class="actions"><button class="primary" onclick="diagnosticarIA()">🧠 Analisar diagnóstico</button><button class="secondary" onclick="limparDiagnosticoRC()">Limpar</button></div></div>
<div id="iaresultado"></div>
<div class="card"><h2>🔎 Banco de Códigos de Erro</h2><p class="muted">Consulta separada por fabricante. Confirme sempre o código no manual do modelo específico.</p><div class="grid"><div><label>Marca</label><select id="rcMarcaErro" onchange="rcPreencherCodigo()"><option value="">Todas as marcas</option>${[...new Set(RC_CODIGOS_ERRO.map(x=>x.m))].map(m=>`<option>${esc(m)}</option>`).join('')}</select></div><div><label>Código</label><input id="rcCodigoErro" placeholder="Ex.: CH05, E1, U4" oninput="rcPreencherCodigo()"></div></div><div id="rcSugestoesCodigo"></div><div class="actions"><button class="primary" onclick="rcBuscarCodigo()">Consultar código</button><button class="secondary" onclick="limparCodigoRC()">Limpar</button></div><div id="rcResultadoCodigo"></div></div>`;
rcPreencherCodigo(); rcAtualizarPerguntas(); setTimeout(rcInitAssinatura,50);
}

let __RC_DIAG_FOTOS=[];
function rcSelecionarFotosDiag(ev){
 const files=[...(ev.target.files||[])].slice(0,4);
 __RC_DIAG_FOTOS=[];
 const box=document.getElementById('rcFotosDiagPreview'); if(box) box.innerHTML='';
 files.forEach((file)=>{
  if(!file.type.startsWith('image/')) return;
  const r=new FileReader();
  r.onload=()=>{
   const img=new Image();
   img.onload=()=>{
    const max=1100, scale=Math.min(1,max/Math.max(img.width,img.height));
    const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(img.width*scale)); c.height=Math.max(1,Math.round(img.height*scale));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const data=c.toDataURL('image/jpeg',0.78); __RC_DIAG_FOTOS.push(data);
    const wrap=document.createElement('div'); wrap.className='card'; wrap.style.padding='6px'; wrap.innerHTML='<img src="'+data+'" style="width:100%;max-height:180px;object-fit:cover;border-radius:4px">'; if(box)box.appendChild(wrap);
   }; img.src=r.result;
  }; r.readAsDataURL(file);
 });
}

function rcAtualizarPerguntas(){
const s=document.getElementById('iasint')?.value||''; const box=document.getElementById('rcPerguntas'); if(!box)return;
const comum=['O equipamento recebe alimentação elétrica?','O controle remoto/receptor responde?','A evaporadora apresenta fluxo de ar?'];
let qs=[...comum];
if(['Não está gelando','Gela pouco','Ventila mas não refrigera','Evaporadora congelando','Tubulação congelando'].includes(s)) qs.push('O compressor está funcionando?','A condensadora está ventilando?','Filtros/evaporador estão limpos?','Há formação de gelo?');
if(['Compressor não parte','Compressor liga e desliga','Corrente acima do normal'].includes(s)) qs.push('Existe tensão correta no compressor/circuito?','A proteção/disjuntor atua?','Há ruído ou aquecimento anormal?');
if(['Vazamento de água'].includes(s)) qs.push('O dreno está livre?','A bandeja está limpa e nivelada?','Há gelo na evaporadora?');
if(['Desarma o disjuntor','Odor de queimado','Tensão baixa','Tensão alta'].includes(s)) qs.push('Há sinais de aquecimento/queima em cabos ou bornes?','A tensão foi medida durante a operação?');
if(['Placa eletrônica sem funcionamento','Sensor suspeito'].includes(s)) qs.push('A placa recebe alimentação?','Conectores estão firmes?','O sensor foi medido conforme especificação?');
if(s==='Problema após instalação') qs.push('Tubulação tem diâmetro correto?','Foi realizado vácuo?','Foi realizado teste de estanqueidade?','Dreno e comunicação foram testados?');
box.innerHTML=qs.map((q,i)=>`<label class="check"><input type="checkbox" id="iaq${i}" data-question="${esc(q)}"> ${esc(q)}</label>`).join('');
}

function rcInitAssinatura(){const c=document.getElementById('rcAssinatura');if(!c||c.__rcReady)return;c.__rcReady=true;const ctx=c.getContext('2d');ctx.lineWidth=2;ctx.lineCap='round';let drawing=false;const pos=e=>{const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return {x:(p.clientX-r.left)*c.width/r.width,y:(p.clientY-r.top)*c.height/r.height}};const down=e=>{e.preventDefault();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};const move=e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};const up=()=>drawing=false;c.addEventListener('mousedown',down);c.addEventListener('mousemove',move);window.addEventListener('mouseup',up);c.addEventListener('touchstart',down,{passive:false});c.addEventListener('touchmove',move,{passive:false});c.addEventListener('touchend',up);}
function rcLimparAssinatura(){const c=document.getElementById('rcAssinatura');if(c)c.getContext('2d').clearRect(0,0,c.width,c.height)}
function rcAssinaturaData(){const c=document.getElementById('rcAssinatura');if(!c)return '';const blank=document.createElement('canvas');blank.width=c.width;blank.height=c.height;return c.toDataURL('image/png')===blank.toDataURL('image/png')?'':c.toDataURL('image/png')}
function diagnosticarIA(){
const val=id=>document.getElementById(id)?.value?.trim()||''; const num=id=>{const x=parseFloat(val(id).replace(',','.'));return Number.isFinite(x)?x:null};
const sint=val('iasint'),marca=val('iaMarca'),modelo=val('iaModelo'),gas=val('iagas'),erro=val('iaerro'),obs=val('iaobs');
const p=num('iapress'),a=num('iacorr'),an=num('iacorrnom'),v=num('iatens'),vn=num('ianominal'),te=num('iaent'),ts=num('iasaida'),ta=num('iaamb'),sup=num('iasuper'),sub=num('iasub'),cap=num('iacap'),capn=num('iacapnom'),ohm=num('iaohmcomp');
let h=[],t=[],alertas=[];const add=(x,y)=>{h.push(...x);t.push(...y)};
if(sint==='Não liga')add(['Verificar alimentação, disjuntor, tensão, controle/receptor e placa.'],['Medir tensão no ponto de alimentação.','Verificar proteções, bornes e conexões.']);
if(['Não está gelando','Gela pouco','Ventila mas não refrigera'].includes(sint))add(['Investigar fluxo de ar, limpeza, troca térmica e circuito frigorífico.'],['Verificar filtros, serpentina e turbina.','Medir temperaturas de entrada e saída.','Conferir pressão, corrente e tensão em regime estável.','Pesquisar vazamento antes de alterar a carga.']);
if(['Evaporadora não sopra ar','Ventilador não gira'].includes(sint))add(['Verificar motor, alimentação, conectores, placa e travamento mecânico.'],['Com equipamento desenergizado, verificar movimento livre.','Medir alimentação/comando do motor conforme esquema.']);
if(['Compressor não parte','Compressor liga e desliga'].includes(sint))add(['Verificar alimentação, comando, proteção, capacitor quando aplicável e condições frigoríficas.'],['Medir tensão e corrente na tentativa de partida.','Verificar temperatura do compressor e atuação de proteção.']);
if(sint==='Desarma o disjuntor')add(['Possíveis pontos: curto, fuga, sobrecorrente, compressor, motor, placa ou alimentação inadequada.'],['Desenergizar antes da inspeção.','Verificar cabos, bornes, isolamento e aquecimento.']);
if(['Evaporadora congelando','Tubulação congelando','Pressão baixa'].includes(sint))add(['Investigar fluxo de ar insuficiente, sujeira, baixa carga, restrição ou condição anormal.','Congelamento isoladamente não confirma falta de refrigerante.'],['Verificar filtros e evaporador.','Medir temperatura, pressão e corrente.','Pesquisar vazamento e restrições antes de alterar a carga.']);
if(sint==='Pressão alta')add(['Investigar condensadora suja, ventilação insuficiente, excesso de refrigerante, não condensáveis ou temperatura ambiente elevada.'],['Verificar limpeza e ventilação.','Conferir corrente e temperatura de descarga.','Comparar pressão com a especificação do refrigerante e condições ambientais.']);
if(sint==='Vazamento de gás')add(['Possíveis pontos: flanges, soldas, válvulas, serpentinas e tubulações.'],['Pesquisar o vazamento com método apropriado.','Reparar o ponto antes de realizar carga.']);
if(sint==='Vazamento de água')add(['Verificar dreno, bandeja, nivelamento, isolamento e possível congelamento.'],['Testar escoamento.','Limpar dreno/bandeja e verificar nivelamento.']);
if(sint==='Ruído / vibração')add(['Investigar turbina/hélice, fixações, tubulações, rolamentos e compressor.'],['Localizar a origem sem tocar partes móveis.','Com equipamento desligado, verificar folgas e fixações.']);
if(sint==='Odor de queimado'){add(['Odor de queimado exige inspeção elétrica antes de continuar a operação.'],['Desligar o equipamento.','Inspecionar cabos, bornes, placa, motor e sinais de aquecimento.']);alertas.push('Não manter o equipamento operando até identificar a causa do odor.');}
if(sint==='Baixa vazão de ar')add(['Sujeira em filtro, evaporador ou turbina pode reduzir vazão e capacidade.'],['Limpar filtros e evaporador.','Inspecionar turbina.','Repetir teste após a limpeza.']);
if(sint==='Corrente acima do normal')add(['Comparar corrente medida com a nominal e as condições reais de operação.'],['Verificar tensão, ventilação, limpeza, pressão e compressor.']);
if(['Tensão baixa','Tensão alta'].includes(sint))add(['Alimentação fora da faixa pode provocar proteção e danos.'],['Medir tensão durante a operação.','Comparar com etiqueta/manual.']);
if(['Placa eletrônica sem funcionamento','Sensor suspeito'].includes(sint))add(['Confirmar alimentação, conectores e componente antes de substituir placa.'],['Identificar o componente pelo manual.','Medir conforme especificação do modelo.']);
if(sint==='Problema após instalação')add(['Revisar elétrica, comunicação, tubulação, vácuo, drenagem e configuração.'],['Conferir diâmetro/comprimento da tubulação.','Verificar estanqueidade, vácuo e drenagem.']);
if(sint==='Problema após manutenção')add(['Revisar os pontos desmontados, limpos ou reconectados na última intervenção.'],['Conferir conectores, dreno, filtros e sensores.']);
if(erro){const l=RC_CODIGOS_ERRO.filter(x=>(!marca||rcNormal(x.m)===rcNormal(marca))&&rcNormal(x.c)===rcNormal(erro));if(l.length){h.unshift(...l.map(x=>x.m+' '+x.c+': '+x.d));t.unshift(...l.map(x=>x.t));}else alertas.push('Código não encontrado na base atual. Confirme o modelo e consulte a documentação do fabricante.');}
if(v!==null&&vn!==null&&vn>0){const dif=((v-vn)/vn)*100;if(Math.abs(dif)>10){h.push('Tensão medida está '+dif.toFixed(1)+'% em relação à nominal informada.');alertas.push('Verificar a alimentação elétrica antes de manter o equipamento em operação.');}else h.push('Tensão medida dentro de aproximadamente ±10% da nominal informada.');}
if(a!==null&&an!==null&&an>0){const dif=((a-an)/an)*100;if(a>an)h.push('Corrente medida está '+dif.toFixed(1)+'% acima da corrente nominal informada.');else h.push('Corrente medida está '+Math.abs(dif).toFixed(1)+'% abaixo da corrente nominal informada.');}
if(cap!==null&&capn!==null&&capn>0){const dif=((cap-capn)/capn)*100;h.push('Capacitor medido está '+dif.toFixed(1)+'% em relação ao valor nominal informado.');if(Math.abs(dif)>10)alertas.push('Capacitor fora de uma faixa aproximada de ±10%: confirmar especificação antes da substituição.');}
if(p!==null){if(p<20)h.push('Pressão informada é baixa; o valor isolado não confirma falta de refrigerante.');if(p>150)h.push('Pressão informada é elevada; interpretar conforme refrigerante, temperatura e especificação.');}
if(te!==null&&ts!==null){const dt=te-ts;h.push('Delta T (entrada − saída): '+dt.toFixed(1)+' °C. Interpretar junto com vazão, carga térmica e condições de operação.');}
if(sup!==null)h.push('Superaquecimento informado: '+sup.toFixed(1)+' °C. Comparar com procedimento aplicável.');
if(sub!==null)h.push('Sub-resfriamento informado: '+sub.toFixed(1)+' °C. Comparar com procedimento aplicável.');
if(ohm!==null)h.push('Resistência informada do compressor: '+ohm.toFixed(1)+' Ω. Comparar com o procedimento e valores do modelo; uma leitura isolada não condena o compressor.');
const perguntas=[...document.querySelectorAll('#rcPerguntas input[type=checkbox]')].filter(x=>x.checked).map(x=>x.dataset.question);
const checks=[['iacFiltro','Filtro'],['iacSerp','Serpentina'],['iacTurb','Turbina'],['iacCond','Condensadora'],['iacDreno','Dreno'],['iacEletrica','Elétrica'],['iacVazamento','Vazamento'],['iacComunicacao','Comunicação'],['iacCompressor','Compressor'],['iacVentilador','Ventiladores'],['iacSensores','Sensores'],['iacVacuo','Vácuo/estanqueidade']];
const feitas=checks.filter(x=>document.getElementById(x[0])?.checked).map(x=>x[1]);
if(!h.length)h.push('Dados insuficientes para uma hipótese específica.');
const resultado={data:new Date().toLocaleString('pt-BR'),marca,modelo,tipo:val('iaTipo'),btu:val('iabtu'),gas,erro,sintoma:sint,status:val('iaStatus')||'Diagnóstico em andamento',conclusao:val('iaConclusao'),recomendacao:val('iaRecomendacao'),valor:val('iaValor'),garantia:val('iaGarantia'),assinatura:rcAssinaturaData(),medicoes:{p,a,an,v,vn,te,ts,ta,sup,sub,cap,capn,ohm},hipoteses:h,testes:t,alertas,verificacoes:feitas,perguntas,obs,eletrica:val('iaeleobs'),fotos:[...__RC_DIAG_FOTOS]};
window.__RC_ULTIMO_DIAG=resultado;
const safe=x=>esc(String(x));
document.getElementById('iaresultado').innerHTML=`<div class="card"><h2>📋 Resultado do diagnóstico</h2><p><b>${safe(marca)} ${safe(modelo)}</b> — ${safe(sint)}<br><b>Status:</b> ${safe(resultado.status)}</p>${alertas.length?'<div class="card" style="border-color:#b00"><h3>⚠️ Alertas</h3><ul>'+alertas.map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul></div>':''}<h3>Possíveis causas / achados</h3><ul>${h.map(x=>'<li>'+safe(x)+'</li>').join('')}</ul><h3>Próximos testes</h3><ol>${t.map(x=>'<li>'+safe(x)+'</li>').join('')}</ol><h3>Conclusão técnica</h3><p>${safe(resultado.conclusao||'Não informada.')}</p><h3>Recomendação</h3><p>${safe(resultado.recomendacao||'Não informada.')}</p><p><b>Valor estimado:</b> ${safe(resultado.valor||'Não informado')} &nbsp; <b>Garantia:</b> ${safe(resultado.garantia||'Não informada')}</p><h3>Checklist concluído</h3><p>${feitas.length?feitas.map(safe).join(' • '):'Nenhuma verificação marcada.'}</p><h3>Perguntas confirmadas</h3><ul>${perguntas.length?perguntas.map(x=>'<li>'+safe(x)+'</li>').join(''):'<li>Nenhuma pergunta marcada.</li>'}</ul><div class="actions"><button class="primary" onclick="salvarDiagnosticoRC()">💾 Salvar diagnóstico</button><button class="secondary" onclick="vincularDiagnosticoAOS()">🔗 Anexar à OS</button><button class="primary" onclick="rcGerarOSOrcamentoDiagnostico()">📋 Gerar OS + orçamento</button><button class="secondary" onclick="gerarRelatorioTecnicoRC()">📄 Relatório técnico</button><button class="secondary" onclick="imprimirDiagnosticoRC()">🖨️ Imprimir / PDF</button></div></div>`;
}

async function rcGerarOSOrcamentoDiagnostico(){
 const d=window.__RC_ULTIMO_DIAG;
 if(!d)return alert('Faça uma análise primeiro.');
 const ctx=window.__RC_DIAG_CTX||{};
 const clienteId=Number(d.clienteId||ctx.clienteId||0),equipId=Number(d.equipId||ctx.equipId||0);
 if(!clienteId||!equipId)return alert('Vincule o diagnóstico a um cliente e equipamento antes de gerar a OS.');
 const cs=await all('clientes'),es=await all('equip');
 const c=cs.find(x=>Number(x.id)===clienteId),e=es.find(x=>Number(x.id)===equipId);
 if(!c||!e)return alert('Cliente ou equipamento não encontrado.');
 const parseValor=v=>{let x=String(v??'').replace(/[^0-9,.-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.');let n=parseFloat(x);return Number.isFinite(n)&&n>0?n:0};
 const valor=parseValor(d.valor);
 const descricao=d.sintoma||'Diagnóstico técnico';
 const conclusao=d.conclusao||'';
 const recomendacao=d.recomendacao||'';
 const obs=[conclusao&&('Conclusão: '+conclusao),recomendacao&&('Recomendação: '+recomendacao),d.obs&&('Observações: '+d.obs)].filter(Boolean).join('\n');
 const checks=(d.verificacoes||[]).map(x=>({item:x,ok:true}));
 const osId=await put('os',{clienteId,equipId,data:new Date().toISOString().slice(0,10),tipo:'Manutenção corretiva',tecnico:'Ricardo Costa',garantia:d.garantia||'',mao:valor,materiaisValor:0,desconto:0,pagamento:'Não informado',materiais:'',pressao:d.medicoes?.p||'',corrente:d.medicoes?.a||'',tensao:d.medicoes?.v||'',entrada:d.medicoes?.te||'',saida:d.medicoes?.ts||'',super:d.medicoes?.sup||'',sub:d.medicoes?.sub||'',amb:d.medicoes?.ta||'',checks,desc:obs,photos:(d.fotos||[]).map((x,i)=>({name:x.name||('diagnostico_'+(i+1)+'.jpg'),data:x.data||x})),signature:d.assinatura||''});
 const qId=await put('orc',{clienteId,valid:'',serv:descricao,qtd:1,unit:valor,des:0,total:valor,obs:obs||'Gerado a partir do diagnóstico técnico.',data:new Date().toISOString().slice(0,10),equipId,osId,diagnosticoId:d.id||null});
 const h=JSON.parse(localStorage.getItem('rc_diagnosticos')||'[]');
 const atualizado={...d,osId,orcamentoId:qId,clienteId,equipId};
 const idx=h.findIndex(x=>x===d||((d.id&&x.id===d.id)&&Number(x.equipId)===equipId));
 if(idx>=0)h[idx]=atualizado;else h.unshift(atualizado);
 localStorage.setItem('rc_diagnosticos',JSON.stringify(h.slice(0,50)));
 window.__RC_DIAG_CTX={...ctx,clienteId,equipId,osId,orcamentoId:qId};
 window.__RC_ULTIMO_DIAG=atualizado;
 await registrarServicoNoFinanceiro((await all('os')).find(x=>Number(x.id)===Number(osId)));
 alert('OS nº '+osId+' e orçamento nº '+qId+' gerados com sucesso.');
 const escolha=confirm('Deseja abrir o relatório da OS agora?');
 if(escolha)report(osId); else show('os');
}

function limparDiagnosticoRC(){['iaModelo','iabtu','iaerro','iaConclusao','iaRecomendacao','iaValor','iaGarantia','iapress','iacorr','iatens','iaent','iasaida','iaamb','iasuper','iasub','iaobs'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});const st=document.getElementById('iaStatus');if(st)st.selectedIndex=0;const fi=document.getElementById('iaFotos');if(fi)fi.value='';__RC_DIAG_FOTOS=[];rcLimparAssinatura();const fp=document.getElementById('rcFotosDiagPreview');if(fp)fp.innerHTML='';document.querySelectorAll('[id^="iac"]').forEach(e=>{if(e.type==='checkbox')e.checked=false});const r=document.getElementById('iaresultado');if(r)r.innerHTML=''}
function salvarDiagnosticoRC(){const d=window.__RC_ULTIMO_DIAG;if(!d)return alert('Faça uma análise primeiro.');const h=JSON.parse(localStorage.getItem('rc_diagnosticos')||'[]');h.unshift(d);localStorage.setItem('rc_diagnosticos',JSON.stringify(h.slice(0,50)));alert('Diagnóstico salvo com sucesso.');}
function imprimirDiagnosticoRC(){const d=window.__RC_ULTIMO_DIAG;if(!d)return alert('Faça uma análise primeiro.');const w=window.open('','_blank');if(!w)return alert('Permita a abertura de pop-ups para imprimir.');w.document.write('<html><head><title>Diagnóstico Técnico - RC Serviços</title><style>body{font-family:Arial;padding:25px} .box{border:1px solid #222;padding:12px;margin:10px 0}li{margin:5px 0}</style></head><body><h1>RELATÓRIO DE DIAGNÓSTICO TÉCNICO</h1><p><b>RC Serviços — Ricardo Costa</b></p><div class="box"><b>Marca:</b> '+esc(d.marca)+'<br><b>Modelo:</b> '+esc(d.modelo)+'<br><b>Tipo:</b> '+esc(d.tipo)+'<br><b>Potência:</b> '+esc(d.btu)+'<br><b>Refrigerante:</b> '+esc(d.gas)+'<br><b>Problema:</b> '+esc(d.sintoma)+'<br><b>Código:</b> '+esc(d.erro||'Não informado')+'<br><b>Data:</b> '+esc(d.data)+'</div><div class="box"><h3>Possíveis causas / achados</h3><ul>'+d.hipoteses.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div class="box"><h3>Próximos testes</h3><ol>'+d.testes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div><p>Este relatório é apoio ao diagnóstico. Confirme parâmetros no manual do modelo antes de substituir componentes ou alterar carga de refrigerante.</p><scr\x69pt>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>');w.document.close()}
function rcPreencherCodigo(){const codigo=rcNormal(document.getElementById('rcCodigoErro')?.value),marca=rcNormal(document.getElementById('rcMarcaErro')?.value),box=document.getElementById('rcSugestoesCodigo');if(!box)return;const lista=RC_CODIGOS_ERRO.filter(x=>(!marca||rcNormal(x.m)===marca)&&(!codigo||rcNormal(x.c).startsWith(codigo))).slice(0,12);box.innerHTML=lista.map(x=>'<button class="secondary" style="margin:3px" onclick="document.getElementById(\'rcMarcaErro\').value=\''+x.m+'\';document.getElementById(\'rcCodigoErro\').value=\''+x.c+'\';rcBuscarCodigo()">'+esc(x.m)+' — '+esc(x.c)+'</button>').join('')}
function rcBuscarCodigo(){const marca=rcNormal(document.getElementById('rcMarcaErro')?.value),codigo=rcNormal(document.getElementById('rcCodigoErro')?.value),box=document.getElementById('rcResultadoCodigo');if(!box)return;const lista=RC_CODIGOS_ERRO.filter(x=>(!marca||rcNormal(x.m)===marca)&&(!codigo||rcNormal(x.c)===codigo));box.innerHTML=lista.length?lista.map(x=>'<div class="card"><b>'+esc(x.m)+' — '+esc(x.c)+'</b><p><b>Diagnóstico:</b> '+esc(x.d)+'</p><p><b>Verificações:</b> '+esc(x.t)+'</p></div>').join(''):'<div class="card"><b>Nenhum código encontrado.</b></div>'}
function limparCodigoRC(){const m=document.getElementById('rcMarcaErro'),c=document.getElementById('rcCodigoErro'),r=document.getElementById('rcResultadoCodigo');if(m)m.value='';if(c)c.value='';if(r)r.innerHTML='';rcPreencherCodigo()}

async function pmoc(){let cs=await all('clientes'),es=await all('equip');app.innerHTML=`<div class="card"><h2>Gerador de PMOC</h2><p class="muted">Cadastre os equipamentos e use este módulo para imprimir um documento com identificação, plano de manutenção e periodicidade.</p><div class="grid"><div><label>Cliente</label><select id="pcli">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div><div><label>Responsável técnico</label><input id="prt" placeholder="Nome / registro profissional"></div><div><label>Periodicidade</label><select id="pper"><option>Mensal</option><option>Bimestral</option><option>Trimestral</option></select></div></div><label>Observações do PMOC</label><textarea id="pobs">Executar inspeção, limpeza, higienização, verificação de drenagem, conexões elétricas, funcionamento e registros de parâmetros conforme plano de manutenção e condições do equipamento.</textarea><div class="actions"><button class="primary" onclick="generatePMOC()">Gerar PMOC para impressão/PDF</button></div></div>
<div class="card"><h3>Equipamentos cadastrados: ${es.length}</h3>${es.map(e=>{let c=cs.find(x=>x.id==e.clienteId);return `<div class="check"><span>•</span>${esc(c?.nome||'')} — ${esc(e.marca)} ${esc(e.modelo)} — ${esc(e.local)} — ${esc(e.btu)} BTU</div>`}).join('')}</div>`}
async function generatePMOC(){let cs=await all('clientes'),es=await all('equip'),c=cs.find(x=>x.id==+pcli.value),list=es.filter(e=>e.clienteId===c?.id);let w=window.open('','_blank');w.document.write(`<html><head><title>PMOC - ${esc(c?.nome||'')}</title><style>body{font-family:Arial;padding:18px;color:#111}.docPage{border:1.5px solid #222;padding:18px;min-height:calc(100vh - 36px)}.docHeader{display:block;width:100%;margin:0 0 18px;border-bottom:2px solid #111;padding:0 0 10px}.docHeader img{display:block;width:100%;max-width:none;height:auto;max-height:none;object-fit:contain;object-position:center top;margin:0 0 10px}.docSection{border:1px solid #222;padding:10px;margin:10px 0}.docSection h2{margin-top:0}table{width:100%;border-collapse:collapse;border:1px solid #222}th,td{border:1px solid #222;padding:7px;font-size:12px}h1{font-size:22px}h2{border-bottom:1px solid #aaa;padding-bottom:5px}ol{border:1px solid #222;padding:12px 12px 12px 32px;margin:10px 0} @media print{body{padding:8px}.docPage{min-height:auto;border:1.5px solid #222;padding:14px}}</style></head><body><div class="docPage"><div class="docHeader"><img src="${newLogoUri()}" alt="RC Serviços"></div><h1>PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE — PMOC</h1><div class="docSection"><p><b>Contratante:</b> ${esc(c?.nome||'')}<br><b>Endereço:</b> ${esc(c?.end||'')}<br><b>Responsável técnico:</b> ${esc(prt.value)}<br><b>Periodicidade:</b> ${esc(pper.value)}</p></div><h2>Equipamentos</h2><table><tr><th>Local</th><th>Marca/Modelo</th><th>Capacidade</th><th>Fluido</th><th>Tensão</th></tr>${list.map(e=>`<tr><td>${esc(e.local)}</td><td>${esc(e.marca)} ${esc(e.modelo)}</td><td>${esc(e.btu)} BTU/h</td><td>${esc(e.gas)}</td><td>${esc(e.tensao)}</td></tr>`).join('')}</table><h2>Plano de manutenção</h2><ol><li>Inspeção visual e condições de operação.</li><li>Limpeza/higienização de filtros, evaporador, turbina e bandeja.</li><li>Verificação e teste do sistema de drenagem.</li><li>Inspeção da condensadora e trocador de calor.</li><li>Verificação das conexões elétricas e medições operacionais.</li><li>Verificação de ruídos, vibrações, vazamentos e anomalias.</li><li>Registro das intervenções, medições e recomendações.</li></ol><h2>Observações</h2><div class="docSection"><p>${esc(pobs.value)}</p></div><p style="margin-top:50px">________________________________________<br>Responsável técnico / empresa</p></div><scr\x69pt>window.onload=()=>setTimeout(()=>window.print(),500)<\/script></body></html>`);w.document.close()}
async function zerarSistema(){
  const opcoes=[
    ['clientes','👤 Clientes','clientes cadastrados'],
    ['equip','❄️ Equipamentos','equipamentos cadastrados'],
    ['os','📋 Ordens de Serviço','ordens de serviço'],
    ['fotos','📷 Fotos','fotos anexadas'],
    ['orc','💰 Orçamentos','orçamentos'],
    ['agenda','📅 Agenda','compromissos da agenda'],
    ['financeiro','💵 Financeiro','lançamentos financeiros'],
    ['estoque','📦 Estoque','itens do estoque'],
    ['contratos','📝 Contratos','contratos'],
    ['empresa','🏢 Dados da Empresa','logo, CNPJ, endereço e dados cadastrados']
  ];
  const modal=document.createElement('div');
  modal.id='modalZerar';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--card,#fff);color:inherit;width:min(560px,100%);max-height:90vh;overflow:auto;border-radius:16px;padding:20px;box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.4)">
    <h2 style="margin-top:0">🗑️ O que deseja apagar?</h2>
    <p class="muted">Selecione somente as informações que deseja excluir. A ação é permanente.</p>
    <div style="display:grid;gap:8px;margin:16px 0">${opcoes.map(([id,t,d])=>`<label style="display:flex;align-items:center;gap:10px;padding:11px;border:1px solid rgba(127,127,127,.25);border-radius:10px;cursor:pointer"><input type="checkbox" class="chkZerar" value="${id}" style="width:20px;height:20px"><span><b>${t}</b><br><small class="muted">${d}</small></span></label>`).join('')}</div>
    <div class="actions" style="display:flex;flex-wrap:wrap;gap:8px"><button class="secondary" id="zSelTodos">Selecionar tudo</button><button class="secondary" id="zCancelar">Cancelar</button><button class="danger" id="zApagar">🗑️ Apagar selecionados</button></div>
  </div>`;
  document.body.appendChild(modal);
  const checks=[...modal.querySelectorAll('.chkZerar')];
  modal.querySelector('#zSelTodos').onclick=()=>{const todos=checks.every(x=>x.checked);checks.forEach(x=>x.checked=!todos);modal.querySelector('#zSelTodos').textContent=todos?'Selecionar tudo':'Desmarcar tudo'};
  modal.querySelector('#zCancelar').onclick=()=>modal.remove();
  modal.querySelector('#zApagar').onclick=async()=>{
    const selecionados=checks.filter(x=>x.checked).map(x=>x.value);
    if(!selecionados.length){alert('Selecione pelo menos uma opção para apagar.');return;}
    const nomes=opcoes.filter(x=>selecionados.includes(x[0])).map(x=>x[1]).join(', ');
    if(!confirm('⚠️ Confirma apagar:\n\n'+nomes+'\n\nEssa ação não pode ser desfeita.'))return;
    const palavra=prompt('Para confirmar, digite APAGAR');
    if(palavra!=='APAGAR'){alert('Operação cancelada. Nenhuma informação foi apagada.');return;}
    try{
      await ready;
      const stores=selecionados.filter(x=>x!=='empresa');
      if(stores.length){
        const tx=db.transaction(stores,'readwrite');
        stores.forEach(n=>tx.objectStore(n).clear());
        await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Não foi possível apagar os dados.'));tx.onabort=()=>reject(tx.error||new Error('Operação cancelada.'));});
      }
      if(selecionados.includes('empresa'))localStorage.removeItem('rc_empresa');
      modal.remove();
      alert('✅ Exclusão concluída. Foram apagados somente os itens selecionados.');
      location.reload();
    }catch(e){console.error('Erro ao apagar dados:',e);alert('Não foi possível concluir a exclusão: '+(e?.message||String(e)));}
  };
}

async function backup(){app.innerHTML=`<div class="card"><h2>Backup e restauração</h2><p>Use o backup para guardar seus clientes, equipamentos e OS em um arquivo JSON. O arquivo pode ser salvo no Google Drive, WhatsApp ou outro local.</p><div class="actions"><button class="primary" onclick="exportData()">Exportar backup</button><label class="secondary" style="display:inline-block;cursor:pointer">Restaurar backup <input type="file" accept=".json" onchange="importData(event)" style="display:none"></label></div><p class="muted">O sistema funciona offline depois de instalado. Faça backups periódicos.</p></div>`}
async function exportData(){let data={version:3,empresa:getEmpresa(),clientes:await all('clientes'),equip:await all('equip'),os:await all('os'),orc:await all('orc')};let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='backup-rc-servicos.json';a.click()}
async function importData(ev){let f=ev.target.files[0];if(!f)return;let d=JSON.parse(await f.text());if(d.empresa)localStorage.setItem('rc_empresa',JSON.stringify(d.empresa)); for(let x of ['clientes','equip','os','orc'])for(let item of (d[x]||[])){delete item.id;await put(x,item)}alert('Backup restaurado.');show('home')}
(function(){
const EXTRA_TABS=[['agenda','Agenda'],['hoje','Hoje'],['financeiro','Financeiro'],['estoque','Estoque'],['contratos','Contratos']];
const baseTabs=window.__rcBaseTabs || tabs;
window.__rcBaseTabs=baseTabs;
EXTRA_TABS.forEach(t=>{if(!tabs.some(x=>x[0]===t[0]))tabs.push(t)});
const oldShow=show;
window.show=async function(n){
 try{
  active(n);
  if(n==='agenda')return await agenda();
  if(n==='hoje')return await hoje();
  if(n==='financeiro')return await financeiro();
  if(n==='estoque')return await estoque();
  if(n==='contratos')return await contratos();
  return await oldShow(n);
 }catch(err){
  console.error('Erro ao abrir módulo',n,err);
  if(window.app) app.innerHTML='<div class="card"><h2>Não foi possível abrir este módulo</h2><p>Ocorreu um erro ao carregar <b>'+esc(String(n))+'</b>.</p><p class="muted">'+esc(err?.message||String(err))+'</p><button class="primary" onclick="location.reload()">Recarregar sistema</button></div>';
 }
};

function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function today(){return new Date().toISOString().slice(0,10)}

async function hoje(){
 await ready;
 const d=today(), a=await all('agenda'), cs=await all('clientes'), es=await all('equip'), os=await all('os'), orc=await all('orc');
 const now=new Date(); const hm=now.toTimeString().slice(0,5);
 const itens=a.filter(x=>x.data===d).sort((x,y)=>String(x.hora||'').localeCompare(String(y.hora||'')));
 const ativos=itens.filter(x=>x.status!=='Cancelado');
 const atrasados=ativos.filter(x=>x.hora&&x.hora<hm&&x.status!=='Concluído');
 const proximos=ativos.filter(x=>x.hora&&x.hora>=hm&&x.status!=='Concluído');
 const concluidos=ativos.filter(x=>x.status==='Concluído');
 const badge=s=>`<span class="badge">${esc(s||'')}</span>`;
 const itemHtml=x=>{const c=cs.find(z=>Number(z.id)===Number(x.clienteId)),e=es.find(z=>Number(z.id)===Number(x.equipId));return `<div class="rc-agenda-item"><div><strong style="font-size:20px">${esc(x.hora||'--:--')}</strong> · ${esc(x.tipo||'')} ${badge(x.status)}<br><b>${esc(c?.nome||'Cliente não informado')}</b>${e?` — ${esc(e.marca||'')} ${esc(e.modelo||'')}`:''}<br><span class="muted">${esc(x.local||c?.end||'')}${x.obs?` · ${esc(x.obs)}`:''}</span></div><div class="actions"><button class="secondary" onclick="rcAbrirAtendimentoAgenda(${x.id})">Abrir</button><button class="secondary" onclick="rcWhatsAgenda(${x.id})">WhatsApp</button><button class="primary" onclick="rcConcluirHoje(${x.id})">Concluir</button></div></div>`};
 app.innerHTML=`<div class="card"><div class="actions" style="justify-content:space-between;align-items:center"><div><h2 style="margin:0">☀️ Hoje — ${now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</h2><p class="muted">Central de operação para acompanhar sua rota e os atendimentos do dia.</p></div><button class="secondary" onclick="show('agenda')">📅 Agenda completa</button></div></div>
 <div class="grid"><div class="card"><div class="muted">Atendimentos</div><div class="stat">${ativos.length}</div></div><div class="card"><div class="muted">Próximos</div><div class="stat">${proximos.length}</div></div><div class="card"><div class="muted">Concluídos</div><div class="stat">${concluidos.length}</div></div><div class="card"><div class="muted">Atrasados</div><div class="stat">${atrasados.length}</div></div></div>
 <div class="card"><h3>🚨 Atenção</h3>${atrasados.length?atrasados.map(itemHtml).join(''):'<p class="muted">Nenhum atendimento atrasado no momento.</p>'}</div>
 <div class="card"><h3>🕒 Próximos atendimentos</h3>${proximos.length?proximos.map(itemHtml).join(''):'<p class="muted">Não há atendimentos futuros cadastrados para hoje.</p>'}</div>
 <div class="card"><h3>✅ Finalizados hoje</h3>${concluidos.length?concluidos.map(x=>{const c=cs.find(z=>Number(z.id)===Number(x.clienteId));return `<div class="rc-agenda-item"><div><strong>${esc(x.hora||'')}</strong> · ${esc(x.tipo||'')} ${badge(x.status)}<br>${esc(c?.nome||'')}</div><div class="actions"><button class="secondary" onclick="rcAbrirAtendimentoAgenda(${x.id})">Abrir</button></div></div>`}).join(''):'<p class="muted">Nenhum atendimento concluído hoje.</p>'}</div>`;
}
window.rcConcluirHoje=async id=>{const a=await all('agenda'),x=a.find(z=>Number(z.id)===Number(id));if(!x)return;if(confirm('Marcar este atendimento como concluído?')){x.status='Concluído';x.concluidoEm=new Date().toISOString();await put('agenda',x);hoje()}};

let ready=new Promise((resolve,reject)=>{ if(db) resolve(); else { const check=setInterval(()=>{ if(db){clearInterval(check);resolve()} },25); setTimeout(()=>{clearInterval(check); if(!db) reject(new Error('Banco de dados ainda não foi inicializado.'))},10000); } });

async function agenda(){
 await ready;
 const a=await all('agenda'), cs=await all('clientes'), es=await all('equip');
 const selectedDate=(window.__RC_AGENDA_DATE||today());
 const month=selectedDate.slice(0,7);
 const list=a.slice().sort((x,y)=>(String(x.data||'')+String(x.hora||'')).localeCompare(String(y.data||'')+String(y.hora||'')));
 const monthItems=list.filter(x=>String(x.data||'').slice(0,7)===month);
 const dayItems=list.filter(x=>x.data===selectedDate && x.status!=='Cancelado');
 const counts={Agendado:0,Confirmado:0,'Em andamento':0,Concluído:0,Cancelado:0};
 a.forEach(x=>{if(counts[x.status]!=null)counts[x.status]++});
 const first=new Date(selectedDate+'T12:00:00'); first.setDate(1); const firstDow=first.getDay();
 const daysInMonth=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
 const pad=n=>String(n).padStart(2,'0');
 let cal='';
 for(let i=0;i<firstDow;i++) cal+='<div class="rc-cal-day empty"></div>';
 for(let d=1;d<=daysInMonth;d++){
   const ds=`${month}-${pad(d)}`; const items=list.filter(x=>x.data===ds); const active=ds===selectedDate?' selected':''; const todayCls=ds===today()?' today':'';
   cal+=`<div class="rc-cal-day${active}${todayCls}" onclick="selecionarDataAgenda('${ds}')"><b>${d}</b>${items.slice(0,3).map(x=>`<span class="rc-cal-dot ${x.status==='Concluído'?'done':x.status==='Cancelado'?'cancel':''}">${esc(x.hora||'')} ${esc(x.tipo||'')}</span>`).join('')}${items.length>3?`<small>+${items.length-3} atendimento(s)</small>`:''}</div>`;
 }
 app.innerHTML=`
 <div class="grid">
  <div class="card"><div class="muted">Hoje</div><div class="stat">${a.filter(x=>x.data===today()&&x.status!=='Cancelado').length}</div></div>
  <div class="card"><div class="muted">Este mês</div><div class="stat">${monthItems.filter(x=>x.status!=='Cancelado').length}</div></div>
  <div class="card"><div class="muted">Concluídos</div><div class="stat">${counts['Concluído']}</div></div>
  <div class="card"><div class="muted">Em andamento</div><div class="stat">${counts['Em andamento']}</div></div>
 </div>
 <div class="card"><h2>📅 Agenda técnica</h2><p class="muted">Agende visitas, vincule o equipamento e acompanhe o atendimento pelo celular.</p>
 <div class="grid">
  <div><label>Data</label><input id="adata" type="date" value="${selectedDate}"></div><div><label>Horário</label><input id="ahora" type="time" value="08:00"></div>
  <div><label>Cliente</label><select id="acli" onchange="rcAtualizarEquipAgenda()"><option value="">Selecione</option>${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div>
  <div><label>Equipamento</label><select id="aequip"><option value="">Não vinculado</option>${es.map(e=>{let c=cs.find(z=>Number(z.id)===Number(e.clienteId));return `<option value="${e.id}">${esc(c?.nome||'')} — ${esc(e.marca||'')} ${esc(e.modelo||'')} ${e.btu?`(${esc(e.btu)})`:''}</option>`}).join('')}</select></div>
  <div><label>Serviço</label><select id="atipo"><option>Higienização</option><option>Manutenção preventiva</option><option>Manutenção corretiva</option><option>Instalação</option><option>Vistoria</option><option>Retorno</option></select></div>
  <div><label>Status</label><select id="astatus"><option>Agendado</option><option>Confirmado</option><option>Em andamento</option><option>Concluído</option><option>Cancelado</option></select></div>
  <div><label>Duração</label><select id="aduracao"><option value="60">1 hora</option><option value="90">1h30</option><option value="120">2 horas</option><option value="180">3 horas</option><option value="240">4 horas</option><option value="480">Dia inteiro</option></select></div>
  <div><label>Endereço / local</label><input id="alocal" placeholder="Endereço do atendimento"></div>
 </div><label>Observações</label><textarea id="aobs" placeholder="Informações importantes para a visita"></textarea>
 <div class="actions"><button class="primary" onclick="saveAgenda()">💾 Salvar agendamento</button><button class="secondary" onclick="selecionarDataAgenda(adata.value||today())">📅 Ver dia</button></div></div>
 <div class="card"><div class="actions" style="justify-content:space-between"><div><button class="secondary" onclick="rcMudarMesAgenda(-1)">‹ Mês anterior</button> <button class="secondary" onclick="selecionarDataAgenda(today())">Hoje</button> <button class="secondary" onclick="rcMudarMesAgenda(1)">Próximo mês ›</button></div><b>${first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</b></div>
 <div class="rc-cal-head">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>`<b>${x}</b>`).join('')}</div><div class="rc-cal">${cal}</div></div>
 <div class="card"><h3>📌 Atendimentos de ${new Date(selectedDate+'T12:00:00').toLocaleDateString('pt-BR')}</h3>
 ${dayItems.length?`<div class="rc-agenda-list">${dayItems.map(x=>{let c=cs.find(z=>Number(z.id)===Number(x.clienteId)),e=es.find(z=>Number(z.id)===Number(x.equipId));return `<div class="rc-agenda-item"><div><strong>${esc(x.hora||'')}</strong> · ${esc(x.tipo||'')} <span class="badge">${esc(x.status||'')}</span><br><b>${esc(c?.nome||'')}</b>${e?` — ${esc(e.marca||'')} ${esc(e.modelo||'')}`:''}<br><span class="muted">${esc(x.local||c?.end||'')}${x.obs?` · ${esc(x.obs)}`:''}</span></div><div class="actions"><button class="secondary" onclick="rcAbrirAtendimentoAgenda(${x.id})">Abrir</button><button class="secondary" onclick="rcWhatsAgenda(${x.id})">WhatsApp</button><button class="danger" onclick="delAgenda(${x.id})">Excluir</button></div></div>`}).join('')}</div>`:'<p class="muted">Nenhum atendimento neste dia.</p>'}</div>
 <div class="card"><h3>Todos os agendamentos</h3>${list.length?`<table><tr><th>Data</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Local</th><th>Ações</th></tr>${list.map(x=>{let c=cs.find(z=>Number(z.id)===Number(x.clienteId));return `<tr><td>${esc(x.data||'')}<br>${esc(x.hora||'')}</td><td>${esc(c?.nome||'')}</td><td>${esc(x.tipo||'')}</td><td><select onchange="alterarStatusAgenda(${x.id},this.value)">${['Agendado','Confirmado','Em andamento','Concluído','Cancelado'].map(st=>`<option ${x.status===st?'selected':''}>${st}</option>`).join('')}</select></td><td>${esc(x.local||c?.end||'')}</td><td><button class="secondary" onclick="rcAbrirAtendimentoAgenda(${x.id})">Abrir</button> <button class="danger" onclick="delAgenda(${x.id})">Excluir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum agendamento cadastrado.</p>'}</div>`;
}
window.selecionarDataAgenda=d=>{window.__RC_AGENDA_DATE=d||today();agenda()};
window.rcMudarMesAgenda=delta=>{const d=new Date((window.__RC_AGENDA_DATE||today())+'T12:00:00');d.setMonth(d.getMonth()+delta);window.__RC_AGENDA_DATE=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;agenda()};
window.rcAtualizarEquipAgenda=()=>{const cid=Number(acli.value);Array.from(aequip.options).forEach(o=>{if(!o.value)return;const e=(window.__RC_AGENDA_EQUIPS||[]).find(x=>Number(x.id)===Number(o.value));o.hidden=!!(e&&cid&&Number(e.clienteId)!==cid)})};
window.saveAgenda=async()=>{await ready;const clienteId=Number(acli.value)||null,equipId=Number(aequip.value)||null;let local=alocal.value.trim();if(!local&&clienteId){const c=(await all('clientes')).find(x=>Number(x.id)===clienteId);local=c?.end||''}if(!adata.value||!ahora.value||!clienteId)return alert('Informe data, horário e cliente.');await put('agenda',{data:adata.value,hora:ahora.value,clienteId,equipId,tipo:atipo.value,status:astatus.value,duracao:Number(aduracao.value)||60,local,obs:aobs.value,criadoEm:new Date().toISOString()});window.__RC_AGENDA_DATE=adata.value;agenda()};
window.alterarStatusAgenda=async(id,status)=>{const a=await all('agenda'),x=a.find(z=>Number(z.id)===Number(id));if(x){x.status=status;await put('agenda',x);agenda()}};
window.delAgenda=async id=>{if(confirm('Excluir este agendamento?')){await del('agenda',id);agenda()}};
window.rcAbrirAtendimentoAgenda=async id=>{const a=(await all('agenda')).find(x=>Number(x.id)===Number(id));if(!a)return;window.__RC_AGENDA_DATE=a.data;const e=a.equipId;if(e&&typeof abrirDiagnosticoEquip==='function'){abrirDiagnosticoEquip(e)}else{show('os')}};
window.rcWhatsAgenda=async id=>{const a=(await all('agenda')).find(x=>Number(x.id)===Number(id));if(!a)return;const c=(await all('clientes')).find(x=>Number(x.id)===Number(a.clienteId));const tel=String(c?.tel||'').replace(/\D/g,'');if(!tel)return alert('Este cliente não possui telefone cadastrado.');const msg=`Olá, ${c?.nome||''}! Confirmamos seu atendimento da RC Serviços para ${a.data||''} às ${a.hora||''}, referente a ${a.tipo||'serviço técnico'}.`;window.open('https://wa.me/55'+tel+'?text='+encodeURIComponent(msg),'_blank')};
window.__RC_AGENDA_EQUIPS=[]; all('equip').then(x=>window.__RC_AGENDA_EQUIPS=x).catch(()=>{});

async function financeiro(){
 try{await ready}catch(e){console.error(e)}
 try{await sincronizarServicosFinanceiro()}catch(e){console.error('Sincronização financeira:',e)}
 let f=[];
 try{f=await all('financeiro')}catch(e){console.error('Leitura financeira:',e);app.innerHTML='<div class="card"><h2>Financeiro</h2><p>O módulo abriu, mas o banco financeiro não pôde ser lido.</p><p class="muted">'+esc(e?.message||String(e))+'</p><button class="primary" onclick="location.reload()">Recarregar</button></div>';return}let totalIn=f.filter(x=>x.tipo==='Entrada').reduce((s,x)=>s+Number(x.valor),0),totalOut=f.filter(x=>x.tipo==='Saída').reduce((s,x)=>s+Number(x.valor),0),totalServ=f.filter(x=>x.origem==='OS').reduce((s,x)=>s+Number(x.valor),0);app.innerHTML=`
<div class="grid"><div class="card"><div class="muted">Entradas</div><div class="stat">${money(totalIn)}</div></div><div class="card"><div class="muted">Serviços</div><div class="stat">${money(totalServ)}</div></div><div class="card"><div class="muted">Saídas</div><div class="stat">${money(totalOut)}</div></div><div class="card"><div class="muted">Saldo</div><div class="stat">${money(totalIn-totalOut)}</div></div></div>
<div class="card"><h2>💰 Lançamento financeiro</h2><div class="grid"><div><label>Data</label><input id="fdata" type="date" value="${today()}"></div><div><label>Tipo</label><select id="ftipo"><option>Entrada</option><option>Saída</option></select></div><div><label>Categoria</label><select id="fcat"><option>Serviço</option><option>Material</option><option>Combustível</option><option>Ferramenta</option><option>Despesa fixa</option><option>Outros</option></select></div><div><label>Valor</label><input id="fvalor" type="number" step="0.01"></div><div><label>Descrição</label><input id="fdesc"></div></div><div class="actions"><button class="primary" onclick="saveFin()">Lançar</button></div></div>
<div class="card"><h3>📊 Relatório financeiro mensal</h3><p class="muted">Gere um relatório com todas as entradas, saídas, serviços e saldo do mês escolhido.</p><div class="actions"><button class="primary" onclick="relatorioFinanceiro()">📊 Gerar relatório mensal</button></div></div><div class="card"><h3>Movimentações</h3><table><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th></th></tr>${f.slice().reverse().map(x=>`<tr><td>${x.data}</td><td>${x.tipo}</td><td>${esc(x.cat)}</td><td>${esc(x.desc)}</td><td>${money(x.valor)}</td><td><button class="danger" onclick="delFin(${x.id})">Excluir</button></td></tr>`).join('')}</table></div>`}
window.saveFin=async()=>{await ready;await put('financeiro',{data:fdata.value,tipo:ftipo.value,cat:fcat.value,valor:Number(fvalor.value),desc:fdesc.value});financeiro()};window.delFin=async id=>{if(confirm('Excluir lançamento?')){await del('financeiro',id);financeiro()}};

window.relatorioFinanceiro=async function relatorioFinanceiro(){
 try{
  await ready;
  const f=await all('financeiro');
  const agora=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const mesAtual=`${agora.getFullYear()}-${pad(agora.getMonth()+1)}`;
  const escolhido=prompt('Digite o mês do relatório no formato AAAA-MM:',mesAtual);
  if(!escolhido)return;
  if(!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(escolhido)){
    alert('Mês inválido. Use o formato AAAA-MM. Exemplo: 2026-09.');
    return;
  }
  const itens=f.filter(x=>String(x.data||'').slice(0,7)===escolhido)
    .sort((a,b)=>String(a.data||'').localeCompare(String(b.data||'')));
  const entradas=itens.filter(x=>x.tipo==='Entrada').reduce((s,x)=>s+Number(x.valor||0),0);
  const saidas=itens.filter(x=>x.tipo==='Saída').reduce((s,x)=>s+Number(x.valor||0),0);
  const servicos=itens.filter(x=>x.origem==='OS').reduce((s,x)=>s+Number(x.valor||0),0);
  const saldo=entradas-saidas;
  const [ano,mes]=escolhido.split('-');
  const nomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes=nomes[Number(mes)-1];
  const fmt=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const dataBR=d=>{if(!d)return '';const z=String(d).split('-');return z.length===3?`${z[2]}/${z[1]}/${z[0]}`:String(d)};
  const empresa=typeof getEmpresa==='function'?(getEmpresa()||{}):{};
  const linhas=itens.map(x=>`<tr><td>${dataBR(x.data)}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.cat||'')}</td><td>${esc(x.desc||('Serviço / OS #'+(x.osId||'')))}</td><td class="valor">${fmt(x.valor)}</td></tr>`).join('');
  app.innerHTML=`<div class="card relatorio-financeiro">
   <div class="no-print actions" style="justify-content:space-between;align-items:center">
    <button class="secondary" onclick="financeiro()">← Voltar ao Financeiro</button>
    <button class="primary" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
   </div>
   <div class="rf-cabecalho"><div class="rf-identidade"><img class="rf-logo" src="${newLogoUri()}" alt="RC Serviços"><div class="rf-titulo"><h1>RELATÓRIO FINANCEIRO MENSAL</h1><h2>${nomeMes} de ${ano}</h2><p><strong>${esc(empresa.nome||'RC Serviços')}</strong></p><p>${esc(empresa.cnpj||'')}</p><p>${esc(empresa.endereco||'')}${empresa.cidade?' — '+esc(empresa.cidade):''}</p></div></div><div class="rf-gerado">Gerado em: ${new Date().toLocaleString('pt-BR')}</div></div>
   <div class="rf-resumo"><div><small>Total de Entradas</small><strong>${fmt(entradas)}</strong></div><div><small>Total de Serviços</small><strong>${fmt(servicos)}</strong></div><div><small>Total de Saídas</small><strong>${fmt(saidas)}</strong></div><div><small>Saldo do Mês</small><strong>${fmt(saldo)}</strong></div></div>
   <h3>Movimentações do mês</h3>
   ${linhas?`<div class="rf-tabela"><table><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${linhas}</tbody></table></div>`:'<div class="card"><p>Nenhum lançamento financeiro encontrado neste mês.</p></div>'}
   <p class="muted" style="margin-top:20px">Relatório gerado automaticamente a partir dos lançamentos registrados no sistema RC Serviços.</p>
  </div>`;
 }catch(e){
  console.error('Erro ao gerar relatório financeiro:',e);
  app.innerHTML=`<div class="card"><h2>Erro ao gerar relatório financeiro</h2><p>Ocorreu um problema ao montar o relatório.</p><p class="muted">${esc(e?.message||String(e))}</p><div class="actions"><button class="secondary" onclick="financeiro()">Voltar ao Financeiro</button></div></div>`;
 }
}

async function estoque(){await ready;let s=await all('estoque');app.innerHTML=`<div class="card"><h2>🧰 Estoque de materiais e peças</h2><div class="grid"><div><label>Item</label><input id="snome"></div><div><label>Código</label><input id="scod"></div><div><label>Quantidade</label><input id="sqtd" type="number" step="0.01"></div><div><label>Estoque mínimo</label><input id="smin" type="number" step="0.01"></div><div><label>Custo unitário</label><input id="scusto" type="number" step="0.01"></div><div><label>Localização</label><input id="slocal"></div></div><div class="actions"><button class="primary" onclick="saveStock()">Cadastrar item</button></div></div><div class="card"><table><tr><th>Item</th><th>Código</th><th>Qtd.</th><th>Mínimo</th><th>Custo</th><th>Status</th><th></th></tr>${s.map(x=>`<tr><td><b>${esc(x.nome)}</b><br><span class="muted">${esc(x.local||'')}</span></td><td>${esc(x.cod||'')}</td><td>${x.qtd}</td><td>${x.min}</td><td>${money(x.custo)}</td><td>${Number(x.qtd)<=Number(x.min)?'<span class="badge">REPOR</span>':'<span class="badge">OK</span>'}</td><td><button class="danger" onclick="delStock(${x.id})">Excluir</button></td></tr>`).join('')}</table></div>`}
window.saveStock=async()=>{await ready;await put('estoque',{nome:snome.value,cod:scod.value,qtd:Number(sqtd.value),min:Number(smin.value),custo:Number(scusto.value),local:slocal.value});estoque()};window.delStock=async id=>{if(confirm('Excluir item?')){await del('estoque',id);estoque()}};

async function contratos(){await ready;let ct=await all('contratos'),cs=await all('clientes');app.innerHTML=`<div class="card"><h2>📄 Contratos de manutenção</h2><div class="grid"><div><label>Cliente</label><select id="tcli">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div><div><label>Início</label><input id="tinicio" type="date" value="${today()}"></div><div><label>Vigência</label><input id="tvigencia" placeholder="12 meses"></div><div><label>Periodicidade</label><select id="tper"><option>Mensal</option><option>Bimestral</option><option>Trimestral</option><option>Semestral</option></select></div><div><label>Valor mensal</label><input id="tvalor" type="number" step="0.01"></div><div><label>Qtd. equipamentos</label><input id="tqtd" type="number"></div><div><label>Status</label><select id="tstatus"><option>Ativo</option><option>Em negociação</option><option>Suspenso</option><option>Encerrado</option></select></div></div><label>Serviços incluídos</label><textarea id="tserv">Manutenção preventiva e higienização dos equipamentos; inspeção de drenagem; verificação elétrica; testes de funcionamento; registro das intervenções.</textarea><div class="actions"><button class="primary" onclick="saveContrato()">Salvar contrato</button></div></div><div class="card"><table><tr><th>Cliente</th><th>Período</th><th>Equip.</th><th>Valor</th><th>Status</th><th></th></tr>${ct.map(x=>{let c=cs.find(z=>z.id==x.clienteId);return `<tr><td>${esc(c?.nome||'')}</td><td>${x.inicio}<br>${esc(x.vigencia)}</td><td>${x.qtd}</td><td>${money(x.valor)}</td><td>${esc(x.status)}</td><td><button class="danger" onclick="delContrato(${x.id})">Excluir</button></td></tr>`}).join('')}</table></div>`}
window.saveContrato=async()=>{await ready;await put('contratos',{clienteId:+tcli.value,inicio:tinicio.value,vigencia:tvigencia.value,per:tper.value,valor:Number(tvalor.value),qtd:Number(tqtd.value),status:tstatus.value,serv:tserv.value});contratos()};window.delContrato=async id=>{if(confirm('Excluir contrato?')){await del('contratos',id);contratos()}};

// Melhora o painel inicial com indicadores extras sem apagar os módulos existentes.
const oldHome=home;
home=async function(){await ready;let f=await all('financeiro'),a=await all('agenda'),s=await all('estoque'),ct=await all('contratos');await oldHome();
 const box=document.createElement('div');box.className='card';box.innerHTML=`<h3>Indicadores de gestão</h3><div class="grid"><div><span class="muted">Saldo financeiro</span><div class="stat">${money(f.filter(x=>x.tipo==='Entrada').reduce((z,x)=>z+Number(x.valor),0)-f.filter(x=>x.tipo==='Saída').reduce((z,x)=>z+Number(x.valor),0))}</div></div><div><span class="muted">Agendamentos</span><div class="stat">${a.filter(x=>x.data>=today()).length}</div></div><div><span class="muted">Contratos ativos</span><div class="stat">${ct.filter(x=>x.status==='Ativo').length}</div></div><div><span class="muted">Itens para repor</span><div class="stat">${s.filter(x=>Number(x.qtd)<=Number(x.min)).length}</div></div></div>`;app.appendChild(box)};
})();


/* ===== RC SERVIÇOS 2.0 — CAMADA DE TESTE ===== */
(function(){
  const oldClientes = clientes;
  const oldEquip = equip;
  function safe(v){ return typeof esc==='function'?esc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function money2(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function dateBR(v){if(!v)return '-';const a=String(v).split('-');return a.length===3?a.reverse().join('/'):v}

  window.home = async function(){
    const [c,e,o,q]=await Promise.all([all('clientes'),all('equip'),all('os'),all('orc')]);
    let agendaN=0, finIn=0, finOut=0, contratosN=0;
    try { const a=await all('agenda'); agendaN=a.filter(x=>x.data>=new Date().toISOString().slice(0,10) && x.status!=='Cancelado').length; } catch(_){ }
    try { const f=await all('financeiro'); finIn=f.filter(x=>x.tipo==='Entrada').reduce((s,x)=>s+Number(x.valor||0),0); finOut=f.filter(x=>x.tipo==='Saída').reduce((s,x)=>s+Number(x.valor||0),0); } catch(_){ }
    try { const ct=await all('contratos'); contratosN=ct.filter(x=>x.status==='Ativo').length; } catch(_){ }
    const abertas=o.filter(x=>!['Concluída','Cancelada'].includes(x.status||'')).length;
    const pend=q.filter(x=>!['Aprovado','Recusado','Cancelado'].includes(x.status||'')).length;
    app.innerHTML=`
      <div class="card" style="background:linear-gradient(135deg,#111827,#374151);color:#fff">
        <h2 style="margin:0 0 5px">Painel RC Serviços</h2><p style="margin:0;opacity:.82">Gestão técnica, clientes, equipamentos e serviços.</p>
        <div class="actions"><button class="primary" style="background:#fff;color:#111827" onclick="show('os')">➕ Nova OS</button><button class="secondary" onclick="show('clientes')">👤 Novo cliente</button><button class="secondary" onclick="show('equip')">❄️ Equipamento</button><button class="secondary" onclick="show('orc')">💰 Orçamento</button></div>
      </div>
      <div class="grid">
        <div class="card"><div class="muted">Clientes</div><div class="stat">${c.length}</div></div>
        <div class="card"><div class="muted">Equipamentos</div><div class="stat">${e.length}</div></div>
        <div class="card"><div class="muted">OS em aberto</div><div class="stat">${abertas}</div></div>
        <div class="card"><div class="muted">Orçamentos pendentes</div><div class="stat">${pend}</div></div>
        <div class="card"><div class="muted">Agenda futura</div><div class="stat">${agendaN}</div></div>
        <div class="card"><div class="muted">Contratos ativos</div><div class="stat">${contratosN}</div></div>
        <div class="card"><div class="muted">Entradas</div><div class="stat">${money2(finIn)}</div></div>
        <div class="card"><div class="muted">Saldo</div><div class="stat">${money2(finIn-finOut)}</div></div>
      </div>
      <div class="card"><h3>Atalhos de trabalho</h3><div class="grid">
        <button class="secondary" onclick="show('agenda')">📅 Agenda de serviços</button><button class="secondary" onclick="show('financeiro')">💵 Financeiro</button><button class="secondary" onclick="show('estoque')">📦 Estoque</button><button class="secondary" onclick="show('contratos')">📄 Contratos</button>
      </div></div>
      <div class="card"><h3>Próxima evolução</h3><p class="muted">A base desta versão já está preparada para histórico por cliente/equipamento, diagnóstico técnico, códigos de erro e manutenção preventiva.</p></div>`;
  };

  window.clientes = async function(){
    const cs=await all('clientes'), es=await all('equip'), osx=await all('os');
    app.innerHTML=`<div class="card"><h2>👤 Novo cliente</h2><div class="grid">
      <div><label>Nome / Empresa</label><input id="cnome"></div><div><label>CPF/CNPJ</label><input id="ccpf"></div>
      <div><label>Telefone/WhatsApp</label><input id="ctel" type="tel"></div><div><label>E-mail</label><input id="cemail" type="email"></div>
      <div><label>Endereço</label><input id="cend"></div><div><label>Responsável</label><input id="cres"></div>
    </div><div class="actions"><button class="primary" onclick="saveCliente()">Salvar cliente</button></div></div>
    <div class="card"><h2>Clientes cadastrados</h2>${cs.length?`<div style="overflow:auto"><table><tr><th>Cliente</th><th>Contato</th><th>Equip.</th><th>OS</th><th>Ações</th></tr>${cs.map(c=>{const ne=es.filter(x=>x.clienteId==c.id).length,no=osx.filter(x=>x.clienteId==c.id).length;return `<tr><td><b>${safe(c.nome)}</b><br><span class="muted">${safe(c.cpf||'')}</span></td><td>${safe(c.tel||'')}<br>${safe(c.email||'')}</td><td>${ne}</td><td>${no}</td><td><div class="actions"><button class="secondary" onclick="verCliente(${c.id})">📋 Ficha</button><button class="danger" onclick="removeCliente(${c.id})">Excluir</button></div></td></tr>`}).join('')}</table></div>`:'<p class="muted">Nenhum cliente cadastrado.</p>'}</div>`;
  };

  window.verCliente = async function(id){
    const [cs,es,osx,qs]=await Promise.all([all('clientes'),all('equip'),all('os'),all('orc')]); const c=cs.find(x=>x.id==id); if(!c){return clientes()}
    const ce=es.filter(x=>x.clienteId==id), co=osx.filter(x=>x.clienteId==id), cq=qs.filter(x=>x.clienteId==id);
    app.innerHTML=`<div class="card"><div class="actions"><button class="secondary" onclick="show('clientes')">← Clientes</button><button class="primary" onclick="show('os')">➕ Nova OS</button></div><h2>📋 Ficha do cliente</h2><div class="grid"><div><b>Cliente</b><br>${safe(c.nome)}</div><div><b>CPF/CNPJ</b><br>${safe(c.cpf||'-')}</div><div><b>Telefone</b><br>${safe(c.tel||'-')}</div><div><b>E-mail</b><br>${safe(c.email||'-')}</div><div><b>Endereço</b><br>${safe(c.end||'-')}</div><div><b>Responsável</b><br>${safe(c.res||'-')}</div></div></div>
    <div class="card"><h3>❄️ Equipamentos (${ce.length})</h3>${ce.length?`<table><tr><th>Equipamento</th><th>Local</th><th>Dados</th></tr>${ce.map(e=>`<tr><td><b>${safe(e.marca)} ${safe(e.modelo)}</b></td><td>${safe(e.local||'-')}</td><td>${safe(e.btu||'-')} BTU/h • ${safe(e.gas||'-')} • ${safe(e.tensao||'-')}</td></tr>`).join('')}</table>`:'<p class="muted">Nenhum equipamento vinculado.</p>'}</div>
    <div class="card"><h3>📋 Histórico de OS (${co.length})</h3>${co.length?`<table><tr><th>Data</th><th>Serviço</th><th>Status</th><th>Valor</th></tr>${co.slice().reverse().map(x=>`<tr><td>${dateBR(x.data)}</td><td>${safe(x.tipo||x.servico||'-')}</td><td>${safe(x.status||'Concluída')}</td><td>${money2((Number(x.mao)||0)+(Number(x.mat)||0)-(Number(x.desc)||0))}</td></tr>`).join('')}</table>`:'<p class="muted">Nenhuma OS registrada.</p>'}</div>
    <div class="card"><h3>💰 Orçamentos (${cq.length})</h3>${cq.length?`<table><tr><th>Data</th><th>Status</th><th>Total</th></tr>${cq.slice().reverse().map(x=>`<tr><td>${dateBR(x.data)}</td><td>${safe(x.status||'-')}</td><td>${money2(x.total||x.valor||0)}</td></tr>`).join('')}</table>`:'<p class="muted">Nenhum orçamento registrado.</p>'}</div>`;
  };

  window.equip = async function(){
    const es=await all('equip'),cs=await all('clientes'); app.innerHTML=`<div class="card"><h2>❄️ Novo equipamento</h2><div class="grid">
      <div><label>Cliente</label><select id="ecli">${cs.map(c=>`<option value="${c.id}">${safe(c.nome)}</option>`).join('')}</select></div><div><label>Local</label><input id="elocal"></div>
      <div><label>Marca</label><input id="emarca"></div><div><label>Modelo</label><input id="emodelo" type="text"></div><div><label>Potência / BTU/h</label><input id="ebtu" type="text" inputmode="numeric"></div>
      <div><label>Refrigerante</label><select id="egas"><option>R32</option><option>R410A</option><option>R22</option><option>Outro</option></select></div><div><label>Tensão</label><input id="etensao"></div><div><label>Tipo</label><select id="etipo"><option>Split Hi-Wall</option><option>Split Cassete</option><option>Split Piso-Teto</option><option>Janela</option><option>Outro</option></select></div><div><label>Nº patrimônio/identificação</label><input id="epat"></div>
      <div><label>Data da instalação</label><input id="edataInst" type="date"></div><div><label>Última manutenção</label><input id="eultMan" type="date"></div><div><label>Próxima manutenção</label><input id="eproxMan" type="date"></div><div><label>Corrente nominal (A)</label><input id="ecorrNom" inputmode="decimal"></div>
    </div><div class="actions"><button class="primary" onclick="saveEquipV2()">Salvar equipamento</button></div></div>
    <div class="card"><h2>Equipamentos cadastrados</h2>${es.length?`<div style="overflow:auto"><table><tr><th>Cliente</th><th>Equipamento</th><th>Especificações</th><th>Manutenção</th><th>Ações</th></tr>${es.map(e=>{let c=cs.find(x=>x.id==e.clienteId);return `<tr><td>${safe(c?.nome||'-')}</td><td><b>${safe(e.marca)} ${safe(e.modelo)}</b><br>${safe(e.local||'')}</td><td>${safe(e.btu||'-')} BTU/h<br>${safe(e.gas||'-')} • ${safe(e.tensao||'-')} • ${safe(e.tipo||'-')}</td><td>${dateBR(e.proxMan||'-')}</td><td><button class="secondary" onclick="verEquip(${e.id})">📋 Ficha</button></td></tr>`}).join('')}</table></div>`:'<p class="muted">Nenhum equipamento cadastrado.</p>'}</div>`;
  };
  window.saveEquipV2=async function(){await put('equip',{clienteId:+ecli.value,local:elocal.value,marca:emarca.value,modelo:emodelo.value,btu:ebtu.value,gas:egas.value,tensao:etensao.value,tipo:etipo.value,pat:epat.value,dataInst:edataInst.value,ultMan:eultMan.value,proxMan:eproxMan.value,corrNom:ecorrNom.value});show('equip')};
  window.verEquip=async function(id){
    const [es,cs,osx]=await Promise.all([all('equip'),all('clientes'),all('os')]);
    const e=es.find(x=>Number(x.id)===Number(id)),c=cs.find(x=>Number(x.id)===Number(e?.clienteId));
    if(!e)return equip();
    const hist=osx.filter(x=>Number(x.equipId||x.equipamentoId)===Number(id));
    const diags=rcDiagHistorico().filter(x=>Number(x.equipId)===Number(id));
    const hoje=new Date(); hoje.setHours(0,0,0,0);
    const prox=e.proxMan?new Date(e.proxMan+'T00:00:00'):null;
    let manut='Não informada', classe='';
    if(prox){const diff=Math.ceil((prox-hoje)/86400000); if(diff<0){manut='⚠️ Manutenção vencida';classe='color:#b91c1c;font-weight:700'} else if(diff<=30){manut='🔔 Próxima em '+diff+' dia(s)';classe='color:#b45309;font-weight:700'} else manut='Agendada para '+dateBR(e.proxMan)}
    const ultima=hist.slice().sort((a,b)=>String(b.data||'').localeCompare(String(a.data||'')))[0];
    const ultimoDiag=diags[0];
    app.innerHTML=`<div class="card"><div class="actions"><button class="secondary" onclick="show('equip')">← Equipamentos</button><button class="primary" onclick="abrirDiagnosticoEquip(${e.id})">🧠 Novo diagnóstico</button><button class="secondary" onclick="abrirOSComEquipamento(${e.id})">📋 Nova OS</button></div><h2>📋 Prontuário técnico</h2><div class="grid">
      <div><b>Cliente</b><br>${esc(c?.nome||'-')}</div><div><b>Local</b><br>${esc(e.local||'-')}</div><div><b>Marca / Modelo</b><br>${esc(e.marca||'-')} / ${esc(e.modelo||'-')}</div><div><b>Potência</b><br>${esc(e.btu||'-')} BTU/h</div><div><b>Refrigerante</b><br>${esc(e.gas||'-')}</div><div><b>Tensão</b><br>${esc(e.tensao||'-')}</div><div><b>Tipo</b><br>${esc(e.tipo||'-')}</div><div><b>Patrimônio</b><br>${esc(e.pat||'-')}</div><div><b>Corrente nominal</b><br>${esc(e.corrNom||'-')} A</div><div><b>Instalação</b><br>${dateBR(e.dataInst)}</div><div><b>Última manutenção</b><br>${dateBR(e.ultMan)}</div><div><b>Próxima manutenção</b><br><span style="${classe}">${esc(manut)}</span><br><small>${dateBR(e.proxMan)}</small></div>
    </div></div>
    <div class="card"><h3>🔔 Controle de manutenção preventiva</h3><div class="grid"><div><b>Status</b><br><span style="font-size:18px;${classe}">${esc(manut)}</span></div><div><b>Última OS</b><br>${ultima?dateBR(ultima.data)+' — '+esc(ultima.tipo||ultima.servico||'-'):'Nenhuma registrada'}</div><div><b>Diagnósticos</b><br>${diags.length}</div><div><b>Ordens de serviço</b><br>${hist.length}</div></div><div class="actions"><button class="primary" onclick="rcProgramarManutencao(${e.id})">📅 Programar manutenção</button><button class="secondary" onclick="rcHistoricoEquipamento(${e.id})">📚 Histórico técnico</button></div></div>
    <div class="card"><h3>🧠 Último diagnóstico</h3>${ultimoDiag?`<p><b>${esc(ultimoDiag.data||'')}</b><br>${esc(ultimoDiag.sintoma||'Sem sintoma informado')}<br><span class="muted">${esc(rcResumoDiag(ultimoDiag)||'Sem hipótese registrada')}</span></p><div class="actions"><button class="secondary" onclick='rcGerarRelatorioHistorico(${JSON.stringify(JSON.stringify(ultimoDiag))})'>📄 Relatório técnico</button></div>`:'<p class="muted">Nenhum diagnóstico registrado.</p>'}</div>
    <div class="card"><h3>📋 Histórico de serviços (${hist.length})</h3>${hist.length?`<div style="overflow:auto"><table><tr><th>Data</th><th>Serviço</th><th>Status</th><th>Valor</th></tr>${hist.slice().reverse().map(x=>`<tr><td>${dateBR(x.data)}</td><td>${esc(x.tipo||x.servico||'-')}</td><td>${esc(x.status||'-')}</td><td>${money2((Number(x.mao||x.materiaisValor)||0)+(Number(x.mat)||0)-(Number(x.desc||x.desconto)||0))}</td></tr>`).join('')}</table></div>`:'<p class="muted">Nenhum serviço registrado para este equipamento.</p>'}</div>`;
  };
  window.rcProgramarManutencao=async function(id){
    const es=await all('equip'); const e=es.find(x=>Number(x.id)===Number(id)); if(!e)return;
    const base=new Date(); base.setHours(0,0,0,0); const sugerida=e.proxMan||`${base.getFullYear()}-${String(base.getMonth()+2).padStart(2,'0')}-01`;
    const data=prompt('Informe a data da próxima manutenção (AAAA-MM-DD):',sugerida); if(data===null)return;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(data))return alert('Informe uma data válida no formato AAAA-MM-DD.');
    e.proxMan=data; await put('equip',e); verEquip(id);
  };
})();



/* === RC SERVIÇOS 2.6 — INTEGRAÇÃO DIAGNÓSTICO ↔ EQUIPAMENTO ↔ OS === */
window.__RC_DIAG_CTX=window.__RC_DIAG_CTX||{clienteId:null,equipId:null,osId:null};
function rcDiagHistorico(){try{return JSON.parse(localStorage.getItem('rc_diagnosticos')||'[]')}catch(e){return []}}
function rcSalvarHistorico(h){localStorage.setItem('rc_diagnosticos',JSON.stringify(h.slice(0,100)))}
function rcResumoDiag(d){return (d.hipoteses||[]).slice(0,3).join(' | ')}
async function abrirDiagnosticoEquip(id){
  const es=await all('equip'), cs=await all('clientes'); const e=es.find(x=>Number(x.id)===Number(id));
  if(!e)return alert('Equipamento não encontrado.');
  window.__RC_DIAG_CTX={clienteId:e.clienteId||null,equipId:e.id,osId:null};
  await show('ia');
  const set=(id,v)=>{const x=document.getElementById(id);if(x&&v!=null)x.value=String(v)};
  set('iaMarca',e.marca||'Não informada'); set('iaModelo',e.modelo||''); set('iabtu',e.btu||''); set('iagas',e.gas||'');
  const tipo=String(e.tipo||''); const sel=document.getElementById('iaTipo'); if(sel){const op=[...sel.options].find(o=>o.text.toLowerCase().includes(tipo.toLowerCase())||tipo.toLowerCase().includes(o.text.toLowerCase())); if(op)sel.value=op.value;}
  const banner=document.getElementById('rcContextoDiagnostico'); if(banner)banner.innerHTML='🔗 <b>Equipamento vinculado:</b> '+esc((cs.find(c=>c.id==e.clienteId)?.nome||''))+' — '+esc(e.marca||'')+' '+esc(e.modelo||'')+' — '+esc(e.local||'');
}
async function abrirOSComEquipamento(id){
  const e=(await all('equip')).find(x=>Number(x.id)===Number(id)); if(!e)return;
  window.__RC_OS_CTX={clienteId:e.clienteId,equipId:e.id}; await show('os');
  setTimeout(()=>{const c=document.getElementById('ocliente'),q=document.getElementById('oequip');if(c){c.value=String(e.clienteId);filterEquip()}if(q)q.value=String(e.id)},50);
}
async function rcHistoricoEquipamento(id){
  const es=await all('equip'),cs=await all('clientes'); const e=es.find(x=>Number(x.id)===Number(id)); if(!e)return;
  const h=rcDiagHistorico().filter(d=>Number(d.equipId)===Number(id)); const c=cs.find(x=>Number(x.id)===Number(e.clienteId)); window.__RC_HISTORICO_EQUIP=h;
  app.innerHTML='<div class="card"><h2>📚 Histórico técnico</h2><p><b>Cliente:</b> '+esc(c?.nome||'')+'<br><b>Equipamento:</b> '+esc(e.marca||'')+' '+esc(e.modelo||'')+' — '+esc(e.local||'')+'</p><div class="actions"><button class="primary" onclick="abrirDiagnosticoEquip('+id+')">🧠 Novo diagnóstico</button><button class="secondary" onclick="abrirOSComEquipamento('+id+')">📋 Nova OS</button><button class="secondary" onclick="show(\'equip\')">Voltar</button></div></div>'+(h.length?h.map((d,i)=>'<div class="card"><h3>Diagnóstico '+(h.length-i)+' — '+esc(d.data||'')+'</h3><p><b>Sintoma:</b> '+esc(d.sintoma||'')+'<br><b>Código:</b> '+esc(d.erro||'Não informado')+'</p><p><b>Resumo:</b> '+esc(rcResumoDiag(d)||'Sem conclusão específica.')+'</p><p><b>Checklist:</b> '+esc((d.verificacoes||[]).join(', ')||'Nenhum')+'</p><div class="actions"><button class="secondary" onclick="rcImprimirHistorico('+i+','+JSON.stringify(h).replace(/</g,'\\u003c')+')">🖨️ Imprimir</button><button class="secondary" onclick="rcGerarRelatorioHistoricoIndex('+i+')">📄 Relatório técnico</button><button class="danger" onclick="rcExcluirHistoricoEquip('+JSON.stringify(d).replace(/</g,'\\u003c')+')">Excluir</button></div></div>').join(''):'<div class="card"><p class="muted">Nenhum diagnóstico registrado para este equipamento.</p></div>');
}
function rcImprimirHistorico(i,h){const d=h[i];if(!d)return;const w=window.open('','_blank');if(!w)return;w.document.write('<html><head><title>Histórico técnico</title><style>body{font-family:Arial;padding:24px}li{margin:5px 0}.box{border:1px solid #222;padding:12px;margin:10px 0}</style></head><body><h1>HISTÓRICO TÉCNICO — RC SERVIÇOS</h1><div class="box"><b>Data:</b> '+esc(d.data||'')+'<br><b>Marca:</b> '+esc(d.marca||'')+'<br><b>Modelo:</b> '+esc(d.modelo||'')+'<br><b>Potência:</b> '+esc(d.btu||'')+'<br><b>Refrigerante:</b> '+esc(d.gas||'')+'<br><b>Sintoma:</b> '+esc(d.sintoma||'')+'<br><b>Código:</b> '+esc(d.erro||'Não informado')+'</div><h2>Achados / hipóteses</h2><ul>'+(d.hipoteses||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h2>Próximos testes</h2><ol>'+(d.testes||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><p><b>Checklist:</b> '+esc((d.verificacoes||[]).join(' • '))+'</p></body></html>');w.document.close();setTimeout(()=>w.print(),400)}
function rcGerarRelatorioHistorico(d){
 try{ if(typeof d==='string') d=JSON.parse(decodeURIComponent(d)); window.__RC_ULTIMO_DIAG=d; gerarRelatorioTecnicoRC(); }catch(e){alert('Não foi possível abrir este relatório histórico.');}
}
function rcGerarRelatorioHistoricoIndex(i){const h=window.__RC_HISTORICO_EQUIP||[];const d=h[i];if(!d)return alert('Diagnóstico histórico não encontrado.');rcGerarRelatorioHistorico(d)}

async function rcExcluirHistoricoEquip(d){if(!confirm('Excluir este diagnóstico do histórico?'))return;const h=rcDiagHistorico().filter(x=>!(x.data===d.data&&x.equipId===d.equipId&&x.sintoma===d.sintoma));rcSalvarHistorico(h);rcHistoricoEquipamento(d.equipId)}
const __rcAssistenciaBase=assistenciaIABase;
async function assistenciaIA(){await __rcAssistenciaBase();const c=document.createElement('div');c.className='card';c.id='rcContextoDiagnostico';const ctx=window.__RC_DIAG_CTX||{};if(ctx.equipId){const e=(await all('equip')).find(x=>Number(x.id)===Number(ctx.equipId));const cs=await all('clientes');const cl=e&&cs.find(x=>Number(x.id)===Number(e.clienteId));c.innerHTML='🔗 <b>Equipamento vinculado:</b> '+esc(cl?.nome||'')+' — '+esc(e?.marca||'')+' '+esc(e?.modelo||'')+' — '+esc(e?.local||'')+'<div class="actions"><button class="secondary" onclick="rcHistoricoEquipamento('+ctx.equipId+')">📚 Ver histórico técnico</button><button class="secondary" onclick="abrirOSComEquipamento('+ctx.equipId+')">📋 Abrir OS</button></div>'}else{c.innerHTML='💡 <b>Dica:</b> abra um equipamento cadastrado para iniciar um diagnóstico já vinculado a ele.'}const first=app.firstElementChild;app.insertBefore(c,first)}
async function equip(){let es=await all('equip'),cs=await all('clientes');app.innerHTML=`
<div class="card"><h2>Novo equipamento</h2><div class="grid"><div><label>Cliente</label><select id="ecli">${cs.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select></div><div><label>Local</label><input id="elocal" placeholder="Sala, quarto, loja..."></div><div><label>Marca</label><input id="emarca"></div><div><label>Modelo</label><input id="emodelo" type="text" inputmode="text"></div><div><label>Potência / BTU/h</label><input id="ebtu" type="text" inputmode="numeric"></div><div><label>Refrigerante</label><select id="egas"><option>R32</option><option>R410A</option><option>R22</option><option>Outro</option></select></div><div><label>Tensão</label><input id="etensao" placeholder="220 V"></div><div><label>Tipo</label><select id="etipo"><option>Split Hi-Wall</option><option>Split Cassete</option><option>Split Piso-Teto</option><option>Janela</option><option>Outro</option></select></div><div><label>Nº patrimônio/identificação</label><input id="epat"></div></div><div class="actions"><button class="primary" onclick="saveEquip()">Salvar equipamento</button></div></div>
<div class="card"><h2>Equipamentos</h2>${es.length?`<table><tr><th>Cliente</th><th>Equipamento</th><th>Dados</th><th>Ações</th></tr>${es.map(e=>{let c=cs.find(x=>x.id==e.clienteId),n=rcDiagHistorico().filter(d=>Number(d.equipId)===Number(e.id)).length;return `<tr><td>${esc(c?.nome||'')}</td><td><b>${esc(e.marca||'')} ${esc(e.modelo||'')}</b><br>${esc(e.local||'')}</td><td>${esc(e.btu||'')} BTU • ${esc(e.gas||'')} • ${esc(e.tensao||'')}</td><td><button class="primary" onclick="abrirDiagnosticoEquip(${e.id})">🧠 Diagnóstico</button> <button class="secondary" onclick="rcHistoricoEquipamento(${e.id})">📚 Histórico (${n})</button> <button class="secondary" onclick="abrirOSComEquipamento(${e.id})">📋 OS</button> <button class="danger" onclick="removeEquip(${e.id})">Excluir</button></td></tr>`}).join('')}</table>`:'<p class="muted">Nenhum equipamento.</p>'}</div>`}
function salvarDiagnosticoRC(){const d=window.__RC_ULTIMO_DIAG;if(!d)return alert('Faça uma análise primeiro.');const ctx=window.__RC_DIAG_CTX||{};d.clienteId=ctx.clienteId||null;d.equipId=ctx.equipId||null;d.osId=ctx.osId||null;d.data=d.data||new Date().toLocaleString('pt-BR');d.fotos=Array.isArray(d.fotos)?d.fotos.slice(0,4):[];const h=rcDiagHistorico();h.unshift(d);rcSalvarHistorico(h);alert('Diagnóstico salvo no histórico'+(d.equipId?' do equipamento.':'.'));}

function gerarRelatorioTecnicoRC(d=null){
 const diag=d||window.__RC_ULTIMO_DIAG;
 if(!diag)return alert('Faça ou selecione um diagnóstico primeiro.');
 const ctx=window.__RC_DIAG_CTX||{};
 rcMontarRelatorioTecnico(diag,ctx.osId||diag.osId||null);
}
async function rcMontarRelatorioTecnico(d,osId){
 const cs=await all('clientes'),es=await all('equip'),osx=await all('os');
 const ctx=window.__RC_DIAG_CTX||{};
 const e=es.find(x=>Number(x.id)===Number(d.equipId||ctx.equipId));
 const c=cs.find(x=>Number(x.id)===Number(d.clienteId||ctx.clienteId||e?.clienteId));
 const o=osx.find(x=>Number(x.id)===Number(osId));
 const emp=getEmpresa();
 const fotos=[...(d.fotos||[]),...(o?.photos||[]).map(p=>p.data)].map(src=>'<img src="'+src+'" style="width:220px;height:160px;object-fit:cover;margin:5px;border:1px solid #222">').join('');
 const med=d.medicoes||{};
 const checks=(d.verificacoes||[]).map(x=>'<li>☑ '+esc(x)+'</li>').join('');
 const perguntas=(d.perguntas||[]).map(x=>'<li>☑ '+esc(x)+'</li>').join('');
 const html='<!doctype html><html><head><meta charset="utf-8"><title>Relatório Técnico - RC Serviços</title><style>body{font-family:Arial,sans-serif;padding:25px;color:#111}h1{font-size:22px;text-align:center}h2{font-size:17px;border-bottom:1px solid #222;padding-bottom:5px}.box{border:1px solid #222;padding:12px;margin:10px 0;border-radius:4px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #222;padding:7px;text-align:left}li{margin:5px 0}.logo{max-width:280px;max-height:100px;object-fit:contain}.foto{text-align:center}.muted{font-size:11px;color:#555}@media print{body{padding:10px}}</style></head><body>'+
 '<div style="text-align:left"><img class="logo" src="'+newLogoUri()+'"></div>'+
 '<h1>RELATÓRIO TÉCNICO DE DIAGNÓSTICO</h1><p style="text-align:center">'+esc(emp.responsavel||'RC Serviços')+' • '+esc(emp.telefone||'')+' • '+esc(emp.cidade||'')+'</p>'+
 '<h2>1. Identificação</h2><div class="box"><b>Cliente:</b> '+esc(c?.nome||'-')+'<br><b>Telefone:</b> '+esc(c?.tel||'-')+'<br><b>OS:</b> '+esc(o?.id||d.osId||'-')+'<br><b>Data:</b> '+esc(d.data||'-')+'</div>'+
 '<h2>2. Equipamento</h2><div class="box"><b>Marca:</b> '+esc(d.marca||e?.marca||'-')+'<br><b>Modelo:</b> '+esc(d.modelo||e?.modelo||'-')+'<br><b>Tipo:</b> '+esc(d.tipo||e?.tipo||'-')+'<br><b>Potência:</b> '+esc(d.btu||e?.btu||'-')+' BTU/h<br><b>Refrigerante:</b> '+esc(d.gas||e?.gas||'-')+'<br><b>Local:</b> '+esc(e?.local||'-')+'</div>'+
 '<h2>3. Atendimento</h2><div class="box"><b>Status:</b> '+esc(d.status||'Não informado')+'<br><b>Sintoma:</b> '+esc(d.sintoma||'-')+'<br><b>Código de erro:</b> '+esc(d.erro||'Não informado')+'<br><b>Observações:</b> '+esc(d.obs||'-')+'</div>'+
 '<h2>4. Medições</h2><table><tr><th>Pressão</th><th>Corrente</th><th>Tensão</th><th>Temp. entrada</th><th>Temp. saída</th><th>Ambiente</th></tr><tr><td>'+esc(med.p??'-')+'</td><td>'+esc(med.a??'-')+' A</td><td>'+esc(med.v??'-')+' V</td><td>'+esc(med.te??'-')+' °C</td><td>'+esc(med.ts??'-')+' °C</td><td>'+esc(med.ta??'-')+' °C</td></tr></table><p><b>Superaquecimento:</b> '+esc(med.sup??'-')+' °C &nbsp; <b>Sub-resfriamento:</b> '+esc(med.sub??'-')+' °C &nbsp; <b>Capacitor:</b> '+esc(med.cap??'-')+'</p>'+
 '<h2>5. Achados / possíveis causas</h2><ul>'+(d.hipoteses||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
 '<h2>6. Próximos testes / recomendações</h2><ol>'+(d.testes||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>'+
 '<h2>7. Checklist</h2><ul>'+(checks||'<li>Nenhum item marcado.</li>')+'</ul>'+
 '<h2>8. Conclusão e recomendação</h2><div class="box"><b>Conclusão técnica:</b> '+esc(d.conclusao||'-')+'<br><b>Recomendação:</b> '+esc(d.recomendacao||'-')+'<br><b>Valor estimado:</b> '+esc(d.valor||'-')+'<br><b>Garantia/prazo:</b> '+esc(d.garantia||'-')+'</div>'+
 '<h2>9. Perguntas confirmadas</h2><ul>'+(perguntas||'<li>Nenhuma.</li>')+'</ul>'+
 (d.alertas?.length?'<h2>9. Alertas</h2><ul>'+d.alertas.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
 (fotos?'<h2>10. Fotos do atendimento</h2><div class="foto">'+fotos+'</div>':'')+
 (d.assinatura?'<h2>12. Assinatura do cliente</h2><div class="box"><img src="'+d.assinatura+'" style="width:100%;max-width:600px;height:160px;object-fit:contain"><br>Assinatura registrada digitalmente.</div>':'')+ '<p class="muted">Este relatório é um registro técnico de apoio ao atendimento. Parâmetros e procedimentos devem ser confirmados conforme o modelo do equipamento e as especificações do fabricante.</p><p style="margin-top:50px">________________________________________<br>'+esc(emp.responsavel||'Ricardo Costa')+'<br>Responsável pelo atendimento</p></body></html>';
 const w=window.open('','_blank');if(!w)return alert('Permita a abertura de pop-ups para gerar o relatório.');w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);
}

async function vincularDiagnosticoAOS(){const d=window.__RC_ULTIMO_DIAG;if(!d)return alert('Faça uma análise primeiro.');const es=await all('equip'),osx=await all('os');const candidatos=osx.filter(o=>!d.equipId||Number(o.equipId)===Number(d.equipId));if(!candidatos.length)return alert('Não encontrei uma OS para este equipamento.');const lista=candidatos.map(o=>o.id+' — '+o.data+' — '+o.tipo).join('\n');const id=prompt('Digite o número da OS para anexar este diagnóstico:\n\n'+lista);if(!id)return;const o=osx.find(x=>Number(x.id)===Number(id));if(!o)return alert('OS não encontrada.');const resumo='\n\n[DIAGNÓSTICO TÉCNICO '+d.data+']\nSintoma: '+d.sintoma+'\nCódigo: '+(d.erro||'Não informado')+'\nAchados: '+(d.hipoteses||[]).join(' | ')+'\nPróximos testes: '+(d.testes||[]).join(' | ');o.desc=(o.desc||'')+resumo;await put('os',o);d.osId=o.id;window.__RC_DIAG_CTX.osId=o.id;alert('Diagnóstico anexado à OS nº '+o.id+'.');}
/* Acrescenta o botão de vínculo ao resultado já gerado. */
const __rcDiagOriginal=diagnosticarIA;
diagnosticarIA=function(){__rcDiagOriginal();setTimeout(()=>{const box=document.getElementById('iaresultado');if(box&&!box.innerHTML.includes('vincularDiagnosticoAOS')){const a=box.querySelector('.actions');if(a)a.insertAdjacentHTML('beforeend','<button class="secondary" onclick="vincularDiagnosticoAOS()">🔗 Anexar à OS</button>')}},0)};
const __rcExportOriginal=exportData;
async function exportData(){let data={version:4,empresa:getEmpresa(),clientes:await all('clientes'),equip:await all('equip'),os:await all('os'),orc:await all('orc'),diagnosticos:rcDiagHistorico()};let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='backup-rc-servicos.json';a.click()}
const __rcImportOriginal=importData;
async function importData(ev){let f=ev.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text());if(d.empresa)localStorage.setItem('rc_empresa',JSON.stringify(d.empresa));for(let x of ['clientes','equip','os','orc'])for(let item of (d[x]||[])){delete item.id;await put(x,item)}if(Array.isArray(d.diagnosticos))rcSalvarHistorico(d.diagnosticos);alert('Backup restaurado, incluindo histórico de diagnósticos.');show('home')}catch(e){alert('Backup inválido: '+e.message)}}
