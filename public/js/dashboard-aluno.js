document.addEventListener('DOMContentLoaded', async () => {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const alunoId = localStorage.getItem('usuarioId');
    const listaContainer = document.getElementById('lista-mentorias-ativas');

    // Identificação do usuário
    if (usuarioNome) {
        document.getElementById('user-greeting').innerText = `Olá, ${usuarioNome.split(' ')[0]}`;
    }

    // Botão Sair
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });

    try {
        // Criaremos uma rota no server.js para buscar pedidos por ALUNO
        const response = await fetch(`/api/solicitacoes-aluno/${alunoId}`);
        const solicitacoes = await response.json();

        const ativas = solicitacoes.filter(s => s.status === 'aceito');
        listaContainer.innerHTML = '';

        if (ativas.length === 0) {
            listaContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #64748B;">Você ainda não tem mentorias ativas.</p>
                    <small>Aguarde um mentor aceitar seu pedido ou solicite novos!</small>
                </div>`;
            return;
        }

        ativas.forEach(a => {
            listaContainer.innerHTML += `
                <div class="request-card" style="border-left: 5px solid #10B981;">
                    <div class="student-info">
                        <strong style="color: #1E3A8A;">Mentor: ${a.mentor_nome}</strong>
                        <p style="font-size: 13px; color: #64748B;">País: ${a.pais} | Especialidade: ${a.especialidade}</p>
                    </div>
                    <div class="actions">
                        <button class="btn-accept" style="background: #1E3A8A;" onclick="abrirMentoria(${a.id})">Acessar Sala</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar mentorias:", err);
        listaContainer.innerHTML = '<p>Erro ao carregar dados.</p>';
    }
});

function abrirMentoria(id) {
    alert("Iniciando conexão com o mentor...");
}