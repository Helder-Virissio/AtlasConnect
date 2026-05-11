document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro-completo');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o reload da página

            // Pegando os valores dos inputs
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            // Validação simples de segurança (exemplo)
            if (password.length < 6) {
                return alert("A senha deve ter pelo menos 6 caracteres!");
            }

            try {
                // Chamada para o seu servidor Node.js
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        nome: nome, // Enviando o nome também (seu banco precisará dessa coluna)
                        email: email, 
                        password: password 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`Parabéns ${nome}, sua conta no Atlas Connect foi criada!`);
                    // Redireciona para a home para o usuário fazer login
                    window.location.href = '/'; 
                } else {
                    // Trata erros como e-mail já cadastrado (Erro 19 no SQLite)
                    alert("Erro ao cadastrar: " + (data.error || "Verifique os dados."));
                }

            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("O servidor está offline ou houve um erro de conexão.");
            }
        });
    }
});
