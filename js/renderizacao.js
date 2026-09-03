export function renderizarTarefas(tarefas) {
  const listaFazer = document.getElementById('lista-fazer');
  const listaAndamento = document.getElementById('lista-andamento');
  const listaRevisao = document.getElementById('lista-revisao');
  const listaConcluido = document.getElementById('lista-concluido');

  if (listaFazer) listaFazer.innerHTML = '';
  if (listaAndamento) listaAndamento.innerHTML = '';
  if (listaRevisao) listaRevisao.innerHTML = '';
  if (listaConcluido) listaConcluido.innerHTML = '';

  tarefas.forEach(tarefa => {
    const li = document.createElement('li');
    li.innerHTML = `
      <article>
        <h4>${tarefa.titulo}</h4>
        <p><strong>Projeto:</strong> ${tarefa.projeto || 'N/A'}</p>
        <p><strong>Responsável:</strong> ${tarefa.responsavel || 'N/A'}</p>
        <p><strong>Prazo:</strong> <time datetime="${tarefa.prazo}">${tarefa.prazo}</time></p>
        <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
      </article>
    `;

    if (tarefa.status === 'a-fazer' && listaFazer) listaFazer.appendChild(li);
    else if (tarefa.status === 'em-andamento' && listaAndamento) listaAndamento.appendChild(li);
    else if (tarefa.status === 'em-revisao' && listaRevisao) listaRevisao.appendChild(li);
    else if (tarefa.status === 'concluido' && listaConcluido) listaConcluido.appendChild(li);
  });
}