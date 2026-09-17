/* =========================================================
   Gerenciador de Tarefas Acadêmicas — lógica da interface
   Carrega dados.json, aplica busca/filtros e monta o quadro.
   ========================================================= */

const COLUNAS = [
  { status: 'a-fazer',      lista: 'lista-fazer',      contador: 'contador-fazer',      nome: 'A fazer' },
  { status: 'em-andamento', lista: 'lista-andamento',  contador: 'contador-andamento',  nome: 'Em andamento' },
  { status: 'em-revisao',   lista: 'lista-revisao',    contador: 'contador-revisao',    nome: 'Em revisão' },
  { status: 'concluido',    lista: 'lista-concluido',  contador: 'contador-concluido',  nome: 'Concluída' }
];

/* Cópia local usada quando o fetch falha — por exemplo ao abrir
   o arquivo direto do disco (file://), onde o navegador bloqueia
   a leitura de dados.json. */
const DADOS_RESERVA = [
  { id: 1, titulo: 'Enviar primeira atividade', projeto: 'Desenvolvimento Front-End', responsavel: 'Pedro Ferreira', prazo: '2026-08-12', prioridade: 'Alta', status: 'a-fazer' },
  { id: 2, titulo: 'Definição do Esquema do Banco de Dados', projeto: 'Banco de Dados Avançado', responsavel: 'Fabio', prazo: '2026-09-16', prioridade: 'Média', status: 'a-fazer' },
  { id: 3, titulo: 'Criar Página em HTML', projeto: 'Desenvolvimento Front-End', responsavel: 'Pedro Ferreira', prazo: '2026-08-12', prioridade: 'Alta', status: 'em-andamento' },
  { id: 4, titulo: 'Estruturação HTML das Telas', projeto: 'TCC - Sistema de Tarefas', responsavel: 'Gabriel', prazo: '2028-05-12', prioridade: 'Baixa', status: 'em-andamento' },
  { id: 5, titulo: 'Analisar página HTML', projeto: 'Desenvolvimento Front-End', responsavel: 'Pedro Ferreira', prazo: '2026-08-12', prioridade: 'Alta', status: 'em-revisao' },
  { id: 6, titulo: 'Modelagem do Diagrama de Classes', projeto: 'Engenharia de Software 2', responsavel: 'Douglas', prazo: '2026-08-30', prioridade: 'Média', status: 'em-revisao' },
  { id: 7, titulo: 'Configuração do Repositório Git', projeto: 'Desenvolvimento Front-End', responsavel: 'Pedro Ferreira', prazo: '2026-08-12', prioridade: 'Média', status: 'concluido' },
  { id: 8, titulo: 'Escolha da Temática do Projeto', projeto: 'Modelagem de Software', responsavel: 'Douglas', prazo: '2026-08-11', prioridade: 'Alta', status: 'concluido' }
];

const estado = {
  tarefas: [],
  busca: '',
  status: 'todos',
  prioridade: 'todos',
  primeiraPintura: true
};

/* ---------- elementos ---------- */
const el = {
  form: document.getElementById('form-filtros'),
  busca: document.getElementById('buscar_tarefa'),
  limpar: document.getElementById('limpar-filtros'),
  quadro: document.getElementById('container-tarefas'),
  mensagem: document.getElementById('mensagem-estado'),
  regiaoStatus: document.getElementById('status-regiao'),
  total: document.getElementById('total-visivel'),
  rotuloTotal: document.getElementById('rotulo-total')
};

/* ---------- utilidades ---------- */

const semAcento = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const iniciais = (nome) =>
  nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

const formatarData = (iso) => {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

/** Diferença em dias inteiros entre o prazo e hoje (negativo = atrasado). */
function diasRestantes(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const prazo = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((prazo - hoje) / 86400000);
}

/** Texto curto sobre o prazo. Retorna null quando não há nada a avisar. */
function avisoDePrazo(tarefa) {
  if (tarefa.status === 'concluido') {
    return { tipo: 'feita', texto: 'Entregue' };
  }

  const dias = diasRestantes(tarefa.prazo);

  if (dias < 0) {
    const atraso = Math.abs(dias);
    return { tipo: 'atrasada', texto: atraso === 1 ? 'Atrasada 1 dia' : `Atrasada ${atraso} dias` };
  }
  if (dias === 0) return { tipo: 'proxima', texto: 'Vence hoje' };
  if (dias <= 7) return { tipo: 'proxima', texto: dias === 1 ? 'Vence amanhã' : `Faltam ${dias} dias` };

  return null;
}

/* ---------- estados da tela ---------- */

function mostrarEstado(titulo, descricao, { carregando = false } = {}) {
  el.quadro.hidden = true;
  el.mensagem.hidden = false;
  el.mensagem.innerHTML = '';

  if (carregando) {
    const rodela = document.createElement('div');
    rodela.className = 'girando';
    el.mensagem.append(rodela);
  }

  const h3 = document.createElement('h3');
  h3.textContent = titulo;

  const p = document.createElement('p');
  p.textContent = descricao;

  el.mensagem.append(h3, p);
}

function mostrarQuadro() {
  el.mensagem.hidden = true;
  el.quadro.hidden = false;
}

function anunciar(texto) {
  el.regiaoStatus.textContent = texto;
}

/* ---------- montagem do cartão ---------- */

function criarCartao(tarefa, ordem) {
  const item = document.createElement('li');

  const cartao = document.createElement('article');
  cartao.className = 'cartao';
  cartao.style.setProperty('--ordem', ordem);

  /* topo: projeto + prioridade */
  const topo = document.createElement('div');
  topo.className = 'cartao-topo';

  const projeto = document.createElement('span');
  projeto.className = 'projeto';
  projeto.textContent = tarefa.projeto;
  projeto.title = tarefa.projeto;

  const prioridade = document.createElement('span');
  prioridade.className = 'prioridade';
  prioridade.dataset.nivel = tarefa.prioridade;
  prioridade.textContent = tarefa.prioridade;

  topo.append(projeto, prioridade);

  /* título */
  const titulo = document.createElement('h4');
  titulo.textContent = tarefa.titulo;

  /* responsável */
  const responsavel = document.createElement('p');
  responsavel.className = 'responsavel';

  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = iniciais(tarefa.responsavel);

  responsavel.append(avatar, document.createTextNode(tarefa.responsavel));

  /* prazo */
  const linhaPrazo = document.createElement('p');
  linhaPrazo.className = 'linha-prazo';

  const data = document.createElement('time');
  data.dateTime = tarefa.prazo;
  data.textContent = `Prazo: ${formatarData(tarefa.prazo)}`;
  linhaPrazo.append(data);

  const aviso = avisoDePrazo(tarefa);
  if (aviso) {
    const marca = document.createElement('span');
    marca.className = 'aviso-prazo';
    marca.dataset.tipo = aviso.tipo;
    marca.textContent = aviso.texto;
    linhaPrazo.append(marca);
  }

  cartao.append(topo, titulo, responsavel, linhaPrazo);
  item.append(cartao);
  return item;
}

/* ---------- filtro e renderização ---------- */

function filtrar() {
  const termo = semAcento(estado.busca);

  return estado.tarefas.filter((tarefa) => {
    const combinaBusca = !termo || semAcento(tarefa.titulo).includes(termo) ||
                          semAcento(tarefa.projeto).includes(termo) ||
                          semAcento(tarefa.responsavel).includes(termo);
    const combinaStatus = estado.status === 'todos' || tarefa.status === estado.status;
    const combinaPrioridade = estado.prioridade === 'todos' || tarefa.prioridade === estado.prioridade;

    return combinaBusca && combinaStatus && combinaPrioridade;
  });
}

function renderizar() {
  const visiveis = filtrar();

  /* Contadores e listas */
  let ordem = 0;

  COLUNAS.forEach((coluna) => {
    const lista = document.getElementById(coluna.lista);
    const contador = document.getElementById(coluna.contador);
    const doStatus = visiveis.filter((t) => t.status === coluna.status);

    lista.replaceChildren();
    doStatus.forEach((tarefa) => lista.append(criarCartao(tarefa, ordem++)));

    contador.textContent = doStatus.length;

    /* coluna vazia ganha um aviso discreto */
    if (doStatus.length === 0) {
      const vazio = document.createElement('li');
      vazio.className = 'projeto';
      vazio.textContent = 'Nenhuma tarefa aqui.';
      lista.append(vazio);
    }
  });

  /* Resumo no cabeçalho */
  el.total.textContent = visiveis.length;
  el.rotuloTotal.textContent = visiveis.length === 1 ? 'tarefa no quadro' : 'tarefas no quadro';

  if (visiveis.length === 0) {
    mostrarEstado(
      'Nenhuma tarefa encontrada',
      'Ajuste a busca ou volte os filtros para "Todos" para ver o quadro completo.'
    );
  } else {
    mostrarQuadro();
  }

  /* Animação só na primeira pintura */
  if (estado.primeiraPintura) {
    el.quadro.classList.add('animar-entrada');
    setTimeout(() => el.quadro.classList.remove('animar-entrada'), 1200);
    estado.primeiraPintura = false;
  }

  anunciar(`${visiveis.length} ${visiveis.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}.`);
}

/* ---------- carregamento dos dados ---------- */

async function carregarTarefas() {
  mostrarEstado('Carregando tarefas', 'Buscando os dados do quadro.', { carregando: true });

  try {
    const resposta = await fetch('dados.json');
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();
    if (!Array.isArray(dados.tarefas)) throw new Error('Formato inesperado');

    estado.tarefas = dados.tarefas;
  } catch (erro) {
    console.warn('Não foi possível ler dados.json, usando a cópia local.', erro);
    estado.tarefas = DADOS_RESERVA;
  }

  if (estado.tarefas.length === 0) {
    mostrarEstado('Quadro vazio', 'Cadastre uma tarefa em dados.json para vê-la aqui.');
    anunciar('Nenhuma tarefa cadastrada.');
    return;
  }

  renderizar();
}

/* ---------- eventos ---------- */

function aguardar(fn, espera = 200) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), espera);
  };
}

el.busca.addEventListener('input', aguardar((evento) => {
  estado.busca = evento.target.value;
  renderizar();
}));

el.form.addEventListener('change', (evento) => {
  if (evento.target.name === 'status') estado.status = evento.target.value;
  if (evento.target.name === 'prioridade') estado.prioridade = evento.target.value;
  renderizar();
});

/* O botão existe para quem prefere confirmar; o filtro já é imediato. */
el.form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  estado.busca = el.busca.value;
  renderizar();
});

el.limpar.addEventListener('click', () => {
  el.form.reset();
  estado.busca = '';
  estado.status = 'todos';
  estado.prioridade = 'todos';
  renderizar();
  el.busca.focus();
});

carregarTarefas();