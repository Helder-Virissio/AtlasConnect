// Seleciona os elementos
const btnPaises = document.querySelector('#menu-paises > a');
const boxPaises = document.querySelector('#dropdown-paises');

const btnLogin = document.querySelector('#menu-login > a');
const boxLogin = document.querySelector('#dropdown-login');

// Função para abrir/fechar
function toggleMenu(btn, box, otherBox) {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        otherBox.classList.remove('show'); // Fecha o outro se estiver aberto
        box.classList.toggle('show');
    });
}

// Ativa os cliques
toggleMenu(btnPaises, boxPaises, boxLogin);
toggleMenu(btnLogin, boxLogin, boxPaises);

// Fecha se clicar fora de qualquer menu
window.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
        boxPaises.classList.remove('show');
        boxLogin.classList.remove('show');
    }
});