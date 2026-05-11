document.addEventListener('DOMContentLoaded', async () => {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioTipo = localStorage.getItem('usuarioTipo');
    const token = localStorage.getItem('token');
    const mentorId = localStorage.getItem('usuarioId');

    // --- 1. PROTEÇÃO DE ROTA ---
    if (!token || usuarioTipo !== 'profissional') {
        alert("Acesso restrito a Mentores!");
        window.location.href = '/';
        return;
    }

    // --- 2. INTERFACE BÁSICA ---
    const greeting = document.getElementById('user-greeting');
    if (greeting && usuarioNome) {
        greeting.innerText = `Olá, ${usuarioNome.split(' ')[0]}`;
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }

    // --- 3. CARREGAR DADOS REAIS ---
    await carregarDadosIniciais(mentorId);
});

async function carregarDadosIniciais(mentorId) {
    const listaContainer = document.getElementById('lista-pedidos');
    
    if (!listaContainer) return;

    try {
        const response = await fetch(`/api/minhas-solicitacoes/${mentorId}`);
        const pedidos = await response.json();

        listaContainer.innerHTML = '';

        if (pedidos.length === 0) {
            listaContainer.innerHTML = '<p style="padding: 20px; color: #64748B;">Você não tem solicitações pendentes no momento.</p>';
            atualizarContadoresInterface(0, false);
            return;
        }

        pedidos.forEach(p => {
            listaContainer.innerHTML += `
                <div class="request-card" id="card-pedido-${p.id}" style="transition: all 0.3s ease;">
                    <div class="student-info">
                        <strong>${p.aluno_nome}</strong>
                        <p style="font-size: 13px; color: #64748B; margin-top: 5px;">
                            Solicitou mentoria de intercâmbio.
                        </p>
                    </div>
                    <div class="actions">
                        <button class="btn-accept" onclick="responderPedido(${p.id}, 'aceito')">Aceitar</button>
                        <button class="btn-reject" onclick="responderPedido(${p.id}, 'recusado')">Recusar</button>
                    </div>
                </div>
            `;
        });

        // Atualiza o contador de pendentes inicial
        atualizarContadoresInterface(pedidos.length, false);

    } catch (err) {
        console.error("Erro ao carregar solicitações:", err);
    }
}

// --- 4. LÓGICA DE ATUALIZAÇÃO EM TEMPO REAL ---

window.responderPedido = async function(pedidoId, novoStatus) {
    // Feedback visual desativando botões para evitar cliques duplos
    const card = document.getElementById(`card-pedido-${pedidoId}`);
    const botoes = card.querySelectorAll('button');
    botoes.forEach(b => b.disabled = true);

    try {
        const response = await fetch(`/api/solicitacoes/${pedidoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        const result = await response.json();

        if (result.success) {
            // Animação de saída
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';

            setTimeout(() => {
                card.remove();
                
                // Atualiza os números no topo (Pendentes -- e Ativas ++)
                atualizarContadoresInterface(-1, novoStatus === 'aceito');

                // Verifica se a lista ficou vazia
                const listaContainer = document.getElementById('lista-pedidos');
                if (listaContainer.children.length === 0) {
                    listaContainer.innerHTML = '<p style="padding: 20px; color: #64748B;">Você não tem solicitações pendentes no momento.</p>';
                }
            }, 300);
        } else {
            alert("Erro ao processar.");
            botoes.forEach(b => b.disabled = false);
        }
    } catch (err) {
        console.error("Erro na conexão:", err);
        botoes.forEach(b => b.disabled = false);
    }
};

function atualizarContadoresInterface(valor, incrementaAtiva) {
    const pendeEl = document.getElementById('stats-pendentes');
    const ativasEl = document.getElementById('stats-ativas');

    if (pendeEl) {
        // Se 'valor' for -1 (clique no botão), subtrai. Se for um número positivo (carga inicial), define.
        let atual = parseInt(pendeEl.innerText) || 0;
        let novoValor = valor === -1 ? atual - 1 : valor;
        pendeEl.innerText = novoValor.toString().padStart(2, '0');
    }

    if (incrementaAtiva && ativasEl) {
        let atualAtivas = parseInt(ativasEl.innerText) || 0;
        ativasEl.innerText = (atualAtivas + 1).toString().padStart(2, '0');
    }
}