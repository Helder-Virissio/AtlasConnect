document.addEventListener('DOMContentLoaded', () => {
    const formProf = document.getElementById('form-cadastro-profissional');

    if (formProf) {
        formProf.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capturar os valores dos inputs
            const nome = document.getElementById('nome-prof').value;
            const email = document.getElementById('email-prof').value;
            const senha = document.getElementById('senha-prof').value;
            const especialidade = document.getElementById('especialidade').value;
            const curriculo = document.getElementById('curriculo').value;
            const certificadoFile = document.getElementById('certificado').files[0];

            // Validação básica de senha (conforme o padrão que usaste no outro cadastro)
            if (senha.length < 6) {
                return alert("A senha deve ter pelo menos 6 caracteres!");
            }

            try {
                // 2. Preparar os dados para envio
                // Como temos um ficheiro, poderíamos usar FormData, 
                // mas para simplificar o teu backend atual, vamos enviar como JSON
                // e tratar o ficheiro como uma string ou simulação nesta fase inicial.
                
                const dados = {
                    nome: nome,
                    email: email,
                    password: senha,
                    especialidade: especialidade,
                    curriculo: curriculo,
                    // Aqui guardamos apenas o nome do ficheiro para registo, 
                    // a menos que implementes upload real com multer no node
                    certificado: certificadoFile ? certificadoFile.name : ''
                };

                // 3. Chamada para o servidor (Rota exclusiva de profissionais)
                const response = await fetch('/register-professional', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`Solicitação enviada com sucesso, ${nome}!\nOs seus dados serão analisados pela equipa Atlas Connect.`);
                    // Redireciona para o login/home
                    window.location.href = '/'; 
                } else {
                    alert("Erro ao solicitar cadastro: " + (data.error || "Verifique os dados."));
                }

            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("O servidor está offline ou houve um erro de conexão.");
            }
        });
    }
});

// Lógica visual para mostrar o nome do ficheiro selecionado no label
const fileInput = document.getElementById('certificado');
const fileNameDisplay = document.getElementById('file-name');

if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function() {
        const name = this.files[0] ? this.files[0].name : "Nenhum ficheiro selecionado";
        fileNameDisplay.textContent = name;
    });
}