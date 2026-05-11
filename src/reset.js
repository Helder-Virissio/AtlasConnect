const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Isso garante que ele pegue o arquivo 'database.db' na mesma pasta deste script
const dbPath = path.join(__dirname, 'database.db');

// Verificação extra: o arquivo realmente existe fisicamente?
if (!fs.existsSync(dbPath)) {
    console.error(`\n❌ ERRO CRÍTICO: O arquivo 'database.db' não foi encontrado em: ${dbPath}`);
    console.log("DICA: Verifique se o arquivo está dentro de alguma pasta como 'src' ou 'data'.");
    process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log(`\n📂 Conectado ao banco: ${dbPath}`);

db.serialize(() => {
    // 1. Limpa a tabela
    db.run("DELETE FROM solicitacoes", function(err) {
        if (err) {
            console.error("❌ Erro ao limpar tabela:", err.message);
        } else {
            console.log(`✅ Sucesso: ${this.changes} registros antigos removidos.`);
        }
    });

    // 2. Reseta o contador
    db.run("DELETE FROM sqlite_sequence WHERE name='solicitacoes'", (err) => {
        if (!err) console.log("✅ Contador de IDs resetado.");
    });
});

db.close((err) => {
    if (err) return console.error(err.message);
    console.log("🔒 Conexão fechada.\n");
});