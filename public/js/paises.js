document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const nome = localStorage.getItem('usuarioNome');

    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('user-name').innerText = `Olá, ${nome.split(' ')[0]}`;

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    const botoesVer = document.querySelectorAll('.btn-view');

    botoesVer.forEach(botao => {
    botao.addEventListener('click', (e) => {
        // Pega o nome do país que está no h3 acima do botão
        const nomePais = e.target.parentElement.querySelector('h3').innerText;
        
        // Salva o país escolhido para usar na próxima página
        localStorage.setItem('paisSelecionado', nomePais);
        
        // Redireciona para a página de listagem (que vamos criar)
        window.location.href = '/listagem-mentores';
    });
});
});