document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE INTERFACE ---
    const btnMobile = document.getElementById('btn-mobile');
    const nav = document.getElementById('nav');
    const btnPaises = document.querySelector('#menu-paises > a');
    const dropPaises = document.getElementById('dropdown-paises');
    const btnLogin = document.querySelector('#menu-login > a');
    const dropLogin = document.getElementById('dropdown-login');

    // --- 1. LÓGICA DE NAVEGAÇÃO E DROPDOWNS ---

    // Menu Mobile
    if (btnMobile) {
        btnMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
        });
    }

    // Função para gerenciar Dropdowns
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

    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (nav && !nav.contains(e.target) && !btnMobile.contains(e.target)) {
            nav.classList.remove('active');
        }
        if (btnPaises && !btnPaises.contains(e.target) && !dropPaises.contains(e.target)) {
            dropPaises.classList.remove('show');
        }
        if (dropLogin && !btnLogin.contains(e.target) && !dropLogin.contains(e.target)) {
            // Só fecha se o clique não for dentro de um input ou botão da caixa
            dropLogin.classList.remove('show');
        }
    });

    // Impede fechar a caixa de login ao clicar nos inputs dentro dela
    if (dropLogin) {
        dropLogin.addEventListener('click', (e) => e.stopPropagation());
    }

    // --- 2. LÓGICA DE AUTENTICAÇÃO (LOGIN/CADASTRO) ---

    const btnEntrar = document.getElementById('btn-entrar');
    const btnCadastrar = document.getElementById('btn-cadastrar');

    // Função para Login
    if (btnEntrar) {
        btnEntrar.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) return alert("Preencha todos os campos!");

            try {
                const response = await fetch('/login', { // Caminho simplificado
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert("Login realizado! Bem-vindo ao Atlas Connect.");
                    localStorage.setItem('token', data.token);
                    window.location.reload();
                } else {
                    alert("Erro: " + data.message);
                }
            } catch (error) {
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    // Função para Cadastro
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) return alert("Preencha os campos para cadastrar!");

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Usuário cadastrado com sucesso!");
                } else {
                    alert("Erro no cadastro: " + (data.error || "Tente outro e-mail"));
                }
            } catch (e) {
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    // --- 3. VERIFICAÇÃO DE SESSÃO (ESTADO LOGADO) ---

    const token = localStorage.getItem('token');
    const loginLink = document.querySelector('.login-link');
    const loginBox = document.getElementById('dropdown-login');

    if (token && loginLink && loginBox) {
        loginLink.innerHTML = "Minha Conta ▾";
        loginBox.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p class="login-title" style="margin-bottom: 15px;">Bem-vindo ao AtlasConnect!</p>
                <button class="btn btn-primary" id="btn-sair" style="width: 100%">Sair da Conta</button>
            </div>
        `;

        document.getElementById('btn-sair').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });
    }
});
