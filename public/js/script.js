document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELETORES DE INTERFACE ---
    const btnMobile = document.getElementById('btn-mobile');
    const nav = document.getElementById('nav');
    const btnPaises = document.querySelector('#menu-paises > a');
    const dropPaises = document.getElementById('dropdown-paises');
    const btnLogin = document.querySelector('#menu-login > a');
    const dropLogin = document.getElementById('dropdown-login');
    const menuMinhasMentorias = document.getElementById('menu-minhas-mentorias');

    // --- 2. FUNCIONALIDADE: MENU MOBILE (Recuperada) ---
    if (btnMobile) {
        btnMobile.addEventListener('click', () => {
            nav.classList.toggle('active');
            const active = nav.classList.contains('active');
            btnMobile.setAttribute('aria-expanded', active);
        });
    }

    // --- 3. FUNCIONALIDADE: DROPDOWNS (Navegação e Login) ---
    function configurarDropdown(botao, caixa, outraCaixa) {
        if (!botao || !caixa) return;
        botao.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (outraCaixa) outraCaixa.classList.remove('show');
            caixa.classList.toggle('show');
        });
    }

    configurarDropdown(btnPaises, dropPaises, dropLogin);
    configurarDropdown(btnLogin, dropLogin, dropPaises);

    // Fechar ao clicar fora (Funcionalidade essencial recuperada)
    window.addEventListener('click', (e) => {
        if (nav && !nav.contains(e.target) && !btnMobile?.contains(e.target)) {
            nav.classList.remove('active');
        }
        if (dropPaises && !btnPaises?.contains(e.target) && !dropPaises.contains(e.target)) {
            dropPaises.classList.remove('show');
        }
        if (dropLogin && !btnLogin?.contains(e.target) && !dropLogin.contains(e.target)) {
            dropLogin.classList.remove('show');
        }
    });

    // Impede que cliques dentro do formulário fechem o dropdown
    if (dropLogin) dropLogin.addEventListener('click', (e) => e.stopPropagation());

    // --- 4. LÓGICA DE LOGIN (Autenticação) ---
    const btnEntrar = document.getElementById('btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) return alert("Preencha todos os campos!");

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuarioNome', data.nome);
                    localStorage.setItem('usuarioId', data.id);
                    localStorage.setItem('usuarioTipo', data.tipo); 
                    window.location.reload(); // Recarrega para aplicar as mudanças visuais
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    // --- 5. VERIFICAÇÃO DE SESSÃO ATIVA (Interface Dinâmica) ---
    const token = localStorage.getItem('token');
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioTipo = localStorage.getItem('usuarioTipo');

    if (token && usuarioNome) {
        // Altera o texto do Login para o Nome
        const loginLinkText = document.querySelector('.login-link');
        if (loginLinkText) loginLinkText.innerHTML = `${usuarioNome.split(' ')[0]} ▾`;

        // Ativa o botão de mentorias se for aluno
        if (usuarioTipo === 'aluno' && menuMinhasMentorias) {
            menuMinhasMentorias.style.display = 'block';
        }

        // Reconstrói o Dropdown de Login para o modo "Logado"
        if (dropLogin) {
            let linksExtras = usuarioTipo === 'profissional' 
                ? `<a href="/dashboard" class="drop-link">Painel do Mentor</a>`
                : `<a href="/minhas-mentorias" class="drop-link" style="color:  var(--cool-horizon); font-weight:bold;">Minhas Mentorias</a>`;

            dropLogin.innerHTML = `
                <div class="user-logged-box" style="padding: 15px; text-align: center;">
                    <p>Olá, <strong>${usuarioNome.split(' ')[0]}</strong></p>
                    <small style="color: #64748B;">${usuarioTipo.toUpperCase()}</small>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                    ${linksExtras}
                    <button id="btn-sair" class="btn-sair" style="width:100%; margin-top:10px; background:#EF4444; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Sair</button>
                </div>
            `;

            document.getElementById('btn-sair').addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '/';
            });
        }
    }
});