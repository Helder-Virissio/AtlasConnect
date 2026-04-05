const btnMobile = document.getElementById('btn-mobile');
const nav = document.getElementById('nav');

const btnPaises = document.querySelector('#menu-paises > a');
const dropPaises = document.getElementById('dropdown-paises');

const btnLogin = document.querySelector('#menu-login > a');
const dropLogin = document.getElementById('dropdown-login');

// Abrir/Fechar Menu Mobile
btnMobile.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede o fechamento imediato pelo clique fora
    nav.classList.toggle('active');
});

// Função para Dropdowns
function configurarDropdown(botao, caixa, outraCaixa) {
    if(!botao) return;
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (outraCaixa) outraCaixa.classList.remove('show');
        caixa.classList.toggle('show');
    });
}

configurarDropdown(btnPaises, dropPaises, dropLogin);
configurarDropdown(btnLogin, dropLogin, dropPaises);

// Fechar ao clicar fora (Melhorado)
window.addEventListener('click', (e) => {
    // Se o clique não foi no menu nem nos botões, fecha tudo
    if (!nav.contains(e.target) && !btnMobile.contains(e.target)) {
        nav.classList.remove('active');
        dropPaises.classList.remove('show');
        if (dropLogin) dropLogin.classList.remove('show');
    }
});
