const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();

// Configurações de Middleware
app.use(express.json());
app.use(cors());

/**
 * --- CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS (CORRIGIDA) ---
 * path.resolve(process.cwd(), 'public') garante que o Node busque a pasta 
 * 'public' na raiz do projeto (AtlasConnect), ignorando onde este script está.
 */
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// Chave secreta para o JWT
const JWT_SECRET = 'CHAVE_ATLAS_CONNECT_2024';

async function startServer() {
    try {
        // Inicialização do Banco de Dados na pasta src
        const db = await open({
            filename: path.join(__dirname, 'database.db'),
            driver: sqlite3.Database
        });

        // Criação da tabela de usuários
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        console.log("✅ Banco de dados SQLite pronto.");

        // --- ROTA DE CADASTRO ---
        app.post('/register', async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Campos obrigatórios faltando." });
            }
            try {
                const hash = await bcrypt.hash(password, 10);
                await db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
                res.status(201).json({ success: true, message: "Usuário cadastrado!" });
            } catch (e) {
                if (e.errno === 19) {
                    return res.status(400).json({ error: "Este e-mail já está cadastrado." });
                }
                res.status(500).json({ error: "Erro interno ao cadastrar." });
            }
        });

        // --- ROTA DE LOGIN ---
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
                if (user && await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
                    return res.json({ success: true, token });
                }
                res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
            } catch (err) {
                res.status(500).json({ error: "Erro no servidor." });
            }
        });

        // --- FALLBACK (Sempre enviar o index.html se não achar a rota) ---
        app.use((req, res) => {
            res.sendFile(path.join(publicPath, 'index.html'));
        });

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`\n🚀 AtlasConnect Online!`);
            console.log(`🔗 Link: http://localhost:${PORT}`);
            console.log(`📂 Servindo arquivos de: ${publicPath}\n`);
        });

    } catch (error) {
        console.error("❌ Falha ao iniciar o servidor:", error);
        process.exit(1);
    }
}

startServer();
