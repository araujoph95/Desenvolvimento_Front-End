import { carregarTarefas } from 'api.js';
import { renderizarEstado } from 'estados.js';

async function inicializarAplicacao() {
  // 1. Aplicado rigorosamente ANTES do await
  renderizarEstado('carregando');

  try {
    const tarefas = await carregarTarefas();

    // 2. Estado Vazio x Estado Sucesso
    if (!tarefas || tarefas.length === 0) {
      renderizarEstado('vazio');
    } else {
      renderizarEstado('sucesso', tarefas);
    }
  } catch (erro) {
    // 3. Estado Erro
    renderizarEstado('erro', null, erro);
  }
}

document.addEventListener('DOMContentLoaded', inicializarAplicacao);