const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DE CAMINHOS ---
const rootPath = process.cwd(); 
const publicPath = path.resolve(rootPath, 'public');

// Servir arquivos estáticos (CSS, JS, Imagens)
app.use('/public', express.static(publicPath));

const JWT_SECRET = 'CHAVE_ATLAS_CONNECT_2026';

async function startServer() {
    try {
        // Banco de dados na raiz do projeto
        const db = await open({
            filename: path.join(rootPath, 'database.db'),
            driver: sqlite3.Database
        });

        // --- ESTRUTURA DO BANCO ---
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                tipo TEXT DEFAULT 'cliente'
            );

            CREATE TABLE IF NOT EXISTS professional_details (
                user_id INTEGER PRIMARY KEY,
                especialidade TEXT,
                curriculo_url TEXT,
                certificado_nome TEXT,
                status TEXT DEFAULT 'pendente',
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS solicitacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                aluno_id INTEGER,
                mentor_id INTEGER,
                status TEXT DEFAULT 'pendente',
                data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (aluno_id) REFERENCES users(id),
                FOREIGN KEY (mentor_id) REFERENCES users(id)
            );
        `);

        console.log("✅ Banco de dados Atlas Connect pronto.");

        // --- ROTAS DE AUTENTICAÇÃO ---

        app.post('/register', async (req, res) => {
            const { nome, email, password } = req.body;
            try {
                const hash = await bcrypt.hash(password, 10);
                await db.run('INSERT INTO users (nome, email, password, tipo) VALUES (?, ?, ?, ?)', [nome, email, hash, 'cliente']);
                res.status(201).json({ success: true });
            } catch (e) {
                res.status(400).json({ error: "E-mail já cadastrado." });
            }
        });

        app.post('/register-professional', async (req, res) => {
            const { nome, email, password, especialidade, curriculo, certificado } = req.body;
            try {
                const hash = await bcrypt.hash(password, 10);
                const result = await db.run(
                    'INSERT INTO users (nome, email, password, tipo) VALUES (?, ?, ?, ?)',
                    [nome, email, hash, 'profissional']
                );
                await db.run(
                    'INSERT INTO professional_details (user_id, especialidade, curriculo_url, certificado_nome) VALUES (?, ?, ?, ?)',
                    [result.lastID, especialidade, curriculo, certificado]
                );
                res.status(201).json({ success: true });
            } catch (e) {
                res.status(500).json({ error: "Erro ao registrar profissional." });
            }
        });

        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
                if (user && await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, JWT_SECRET, { expiresIn: '2h' });
                    return res.json({ 
                        success: true, 
                        token, 
                        id: user.id,
                        nome: user.nome,
                        tipo: user.tipo 
                    });
                }
                res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
            } catch (err) {
                res.status(500).json({ error: "Erro no servidor." });
            }
        });

        // --- ROTAS DE API ---

        app.get('/api/mentores/:pais', async (req, res) => {
            const { pais } = req.params;
            try {
                const mentores = await db.all(`
                    SELECT users.id, users.nome, pd.especialidade, pd.certificado_nome
                    FROM users 
                    JOIN professional_details pd ON users.id = pd.user_id
                    WHERE pd.especialidade LIKE ? AND users.tipo = 'profissional'
                `, [`%${pais}%`]);
                res.json(mentores);
            } catch (err) {
                res.status(500).json({ error: "Erro ao buscar mentores." });
            }
        });

        app.post('/api/solicitar-mentoria', async (req, res) => {
            const { aluno_id, mentor_id } = req.body;
            try {
                await db.run(
                    'INSERT INTO solicitacoes (aluno_id, mentor_id) VALUES (?, ?)',
                    [aluno_id, mentor_id]
                );
                res.json({ success: true, message: "Solicitação enviada com sucesso!" });
            } catch (err) {
                res.status(500).json({ error: "Erro ao enviar solicitação." });
            }
        });

        app.get('/api/minhas-solicitacoes/:mentor_id', async (req, res) => {
            const { mentor_id } = req.params;
            try {
                const pedidos = await db.all(`
                    SELECT s.id, u.nome as aluno_nome, s.status 
                    FROM solicitacoes s
                    JOIN users u ON s.aluno_id = u.id 
                    WHERE s.mentor_id = ? AND s.status = 'pendente'
                `, [mentor_id]);
                res.json(pedidos);
            } catch (err) {
                res.status(500).json({ error: "Erro ao buscar pedidos." });
            }
        });

        app.get('/api/solicitacoes-aluno/:alunoId', async (req, res) => {
            const { alunoId } = req.params;
            try {
                const result = await db.all(`
                    SELECT s.id, s.status, u.nome AS mentor_nome, pd.especialidade 
                    FROM solicitacoes s
                    JOIN users u ON s.mentor_id = u.id
                    JOIN professional_details pd ON u.id = pd.user_id
                    WHERE s.aluno_id = ?`, 
                    [alunoId]
                );
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "Erro ao buscar dados." });
            }
        });

        app.put('/api/solicitacoes/:id', async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            try {
                await db.run('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, id]);
                res.json({ success: true, message: `Solicitação ${status} com sucesso!` });
            } catch (err) {
                res.status(500).json({ error: "Erro ao atualizar status." });
            }
        });

        // --- ROTAS DE NAVEGAÇÃO (PÁGINAS HTML) ---

        // Rota para a raiz
        app.get('/', (req, res) => {
            res.sendFile(path.join(rootPath, 'index.html'));
        });

        // ADICIONE ESTA AQUI: Rota específica para quem digitar /index.html
        app.get('/index.html', (req, res) => {
            res.redirect('/'); // Redireciona para a raiz para manter a URL limpa
        });

        // Páginas dentro de public/pages
        app.get('/paises', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'paises.html'));
        });

        app.get('/sobre', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'sobre.html'));
        });

        app.get('/contato', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'contato.html'));
        });

        app.get('/cadastro', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'cadastro.html'));
        });

        app.get('/cadastro-profissional', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'cadastro-profissional.html'));
        });

        app.get('/dashboard', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'dashboard-mentor.html'));
        });

        app.get('/minhas-mentorias', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'dashboard-aluno.html'));
        });

        app.get('/listagem-mentores', (req, res) => {
            res.sendFile(path.join(publicPath, 'pages', 'listagem-mentores.html'));
        });


        // Captura qualquer tentativa de acessar .html diretamente e limpa a URL
        app.use((req, res, next) => {
            if (req.path.endsWith('.html')) {
                const newPath = req.path.replace('.html', '');
        // Se for index.html, vai para a raiz, senão vai para a rota sem .html
            if (newPath === '/index') {
                res.redirect(301, '/');
            } else {
                res.redirect(301, newPath);
            }
            }else {
            next();
                    }
});


        // Inicialização do Servidor
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`--- Atlas Connect System ---`);
            console.log(`🚀 Rodando em: http://localhost:${PORT}`);
            console.log(`📂 Pasta Pública: ${publicPath}`);
        });

    } catch (error) {
        console.error("❌ Erro fatal ao iniciar o servidor:", error);
    }
}

startServer();