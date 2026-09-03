import { renderizarTarefas } from 'renderizacao.js';

export function renderizarEstado(estado, dados = null, erro = null) {
  const statusRegiao = document.getElementById('status-regiao');
  const mensagemContainer = document.getElementById('mensagem-estado');
  const containerTarefas = document.getElementById('container-tarefas');

  // Limpa mensagens visuais anteriores
  mensagemContainer.textContent = '';

  if (estado === 'carregando') {
    const texto = 'Carregando tarefas, por favor aguarde...';
    statusRegiao.textContent = texto;
    mensagemContainer.textContent = texto;
    containerTarefas.style.display = 'none';
  } 
  else if (estado === 'sucesso') {
    const total = dados ? dados.length : 0;
    const texto = `Tarefas carregadas com sucesso. Total: ${total} tarefas.`;
    statusRegiao.textContent = texto;
    mensagemContainer.textContent = `Exibindo ${total} tarefas.`;
    containerTarefas.style.display = 'flex';
    
    // Chama a função da E2/Aula 5 sem modificá-la
    renderizarTarefas(dados);
  } 
  else if (estado === 'vazio') {
    const texto = 'Nenhuma tarefa encontrada no momento.';
    statusRegiao.textContent = texto;
    mensagemContainer.textContent = texto;
    containerTarefas.style.display = 'none';
  } 
  else if (estado === 'erro') {
    let mensagemErro = 'Ocorreu um erro ao carregar as tarefas.';

    if (erro) {
      if (erro.name === 'TypeError') {
        mensagemErro = 'Erro de rede: Falha ao conectar ao servidor. Verifique sua conexão ou servidor local.';
      } else if (erro.name === 'SyntaxError') {
        mensagemErro = 'Erro de formato: O arquivo JSON de dados contém erros de sintaxe.';
      } else if (erro.message && erro.message.includes('HTTP')) {
        mensagemErro = `Erro de protocolo: Ocorreu uma falha no servidor (${erro.message}).`;
      }
    }

    statusRegiao.textContent = mensagemErro;
    mensagemContainer.textContent = mensagemErro;
    containerTarefas.style.display = 'none';
  }
}