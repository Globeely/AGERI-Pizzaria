const newrelic = require('newrelic'); //npm install newrelic --save
const express = require('express'); //npm install express
const session = require('express-session'); //npm install express-session
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); //npm install sqlite3
const pino = require('pino'); // npm install pino
const fs = require('fs');
const SQLiteStore = require('connect-sqlite3')(session); // npm install connect-sqlite3

// Instrumentação do Express com New Relic
newrelic.instrumentLoadedModule('express', express);

const app = express();
const port = 3001;
const publicPath = path.join(__dirname, 'public');
const dbPath = path.join(__dirname, 'db'); // Caminho para a pasta que contém os bancos de dados

// Configuração do logger com pino
const logger = pino();

// Middleware para servir arquivos estáticos
app.use(express.static(publicPath));

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: 'ageriMelhordoMundo-Pizza-tecnologia',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Deve ser true em produção com HTTPS
}));
 
// Função para ler o arquivo ingrediente.json
function lerIngredientes() {
    const filePath = path.join(publicPath, 'ingrediente.json');
    // console.log('Lendo arquivo:', filePath); // Verifique o caminho do arquivo
    const data = fs.readFileSync(filePath);
    // console.log('Dados lidos:', data.toString()); // Verifique o conteúdo lido
    return JSON.parse(data);
}

// Conexão com o banco de dados carrinho.db
const dbCarrinho = new sqlite3.Database(path.join(dbPath, 'carrinho.db'), (err) => {
    if (err) {
        logger.error('Erro ao conectar ao banco de dados carrinho.db:', err.message);
    } else {
        logger.info('Conectado ao banco de dados carrinho.db');
    }
});

// Conexão com o banco de dados compra.db
const dbCompra = new sqlite3.Database(path.join(dbPath, 'compra.db'), (err) => {
    if (err) {
        logger.error('Erro ao conectar ao banco de dados compra.db:', err.message);
    } else {
        logger.info('Conectado ao banco de dados compra.db');
    }
});

// Rota para adicionar produto ao carrinho
app.post('/carrinho', (req, res) => {
    const sessionId = req.sessionID; // Obtém o ID da sessão
    const { nome, preco, descricao, imagem } = req.body;

    dbCarrinho.run('INSERT INTO carrinho (session_id, nome, preco, descricao, imagem) VALUES (?, ?, ?, ?, ?)',
        [sessionId, nome, preco, descricao, imagem],
        (err) => {
            if (err) {
                logger.error('Erro ao adicionar produto ao carrinho:', err);
                return res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' });
            }
            logger.info(`Produto ${nome} adicionado ao carrinho`);

            // Adicionando atributos personalizados ao evento enviado ao New Relic
            const attributes = {
                action: 'Carrinho',
                produto: nome,
                preco: preco
            };

            newrelic.addCustomAttributes(attributes);

            res.json({ message: 'Produto adicionado ao carrinho com sucesso' });
        });
});

app.post('/api/carrinho', (req, res) => {
    const { itemId, quantidade } = req.body;
    const carrinho = req.session.carrinho || [];

    const itemExistente = carrinho.find(item => item.itemId === itemId);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({ itemId, quantidade });
    }

    req.session.carrinho = carrinho;
    res.status(200).json({ message: 'Item adicionado ao carrinho' });
});



// Rota para exibir o carrinho em formato JSON
app.get('/api/carrinho', (req, res) => {
    const sessionId = req.sessionID;

    dbCarrinho.all('SELECT * FROM carrinho WHERE session_id = ?', [sessionId], (err, rows) => {
        if (err) {
            logger.error('Erro ao buscar produtos no carrinho:', err);
            return res.status(500).json({ error: 'Erro ao buscar produtos no carrinho' });
        }
        res.json(rows);
    });
});


// Rota para deletar um item específico do carrinho
app.delete('/api/carrinho/:id', (req, res) => {
    const itemId = req.params.id;
    const sessionId = req.sessionID;

    // Primeiro, buscar o nome do item pelo ID para usar no log e na mensagem de resposta
    dbCarrinho.get('SELECT nome FROM carrinho WHERE id = ? AND session_id = ?', [itemId, sessionId], (err, row) => {
        if (err) {
            logger.error('Erro ao buscar item do carrinho:', err);
            return res.status(500).json({ error: 'Erro ao buscar item do carrinho' });
        }

        const nomeItem = row ? row.nome : 'Item Desconhecido'; // Caso não encontre, usar um valor padrão

        // Deletar o item específico do carrinho
        dbCarrinho.run('DELETE FROM carrinho WHERE id = ? AND session_id = ?', [itemId, sessionId], (err) => {
            if (err) {
                logger.error('Erro ao deletar item do carrinho:', err);
                return res.status(500).json({ error: 'Erro ao deletar item do carrinho' });
            }
            logger.info(`Item ${nomeItem} deletado do carrinho`);
            res.json({ message: `Item ${nomeItem} deletado com sucesso` });
        });
    });
});

// Rota para limpar todo o carrinho
app.delete('/api/carrinho', (req, res) => {
    const sessionId = req.sessionID;

    // Deletar todos os itens do carrinho associados à sessão atual no banco de dados
    dbCarrinho.run('DELETE FROM carrinho WHERE session_id = ?', [sessionId], (err) => {
        if (err) {
            logger.error('Erro ao limpar o carrinho no banco de dados:', err);
            return res.status(500).json({ error: 'Erro ao limpar o carrinho' });
        }

        logger.info('Carrinho limpo no banco de dados');
        res.status(200).json({ message: 'Carrinho limpo' });
    });
});





// Função para registrar eventos personalizados na New Relic
function registrarIngredientes(idUser, produto, quantidade) {
    const ingredientesData = lerIngredientes();
    const itemProduto = ingredientesData.Pizza[produto];

    if (itemProduto) {
        if (itemProduto.ingredientes) {
            // Produto com ingredientes
            itemProduto.ingredientes.forEach((ingrediente) => {
                newrelic.recordCustomEvent('ingredientes', {
                    idUser: idUser,
                    produto: produto,
                    quantidade: quantidade,
                    ingrediente: ingrediente.ingrediente,
                    peso: ingrediente.peso
                });
            });
        } else if (itemProduto.peso) {
            // Produto com peso
            newrelic.recordCustomEvent('ingredientes', {
                idUser: idUser,
                produto: produto,
                quantidade: quantidade,
                peso: itemProduto.peso
            });
        }
    } else {
        logger.error(`Produto ${produto} não encontrado no JSON de ingredientes.`);
    }
}

// Rota para salvar a compra
app.post('/api/compra', express.json(), (req, res) => {
    const { idUser, nome, estado, sabor, quantidade, total, metodoPagamento, cupon, precoFinal, custoProducao } = req.body;

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (!nome || !estado || !metodoPagamento || !precoFinal) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    dbCompra.run('INSERT INTO compra (idUser, nome, estado, sabor, quantidade, total, metodoPagamento, cupon, precoFinal, custoProducao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
           [idUser, nome, estado, sabor, quantidade, total, metodoPagamento, cupon, precoFinal, custoProducao],
           (err) => {
               if (err) {
                   logger.error('Erro ao salvar a compra:', err);
                   return res.status(500).json({ error: 'Erro ao processar a compra. Por favor, tente novamente mais tarde.' });
               }
               logger.info(`Compra de ${quantidade} ${sabor}(es) realizada por ${nome}`);

               // Adicionando atributos personalizados ao evento enviado ao New Relic
               const attributes2 = {
                   action: 'Compra Realizada',
                   idUser: idUser,
                   cliente: nome,
                   estado: estado,
                   produto: sabor,
                   quantidade: quantidade,
                   precoProduto: total,
                   metodoPagamento: metodoPagamento,
                   cupon: cupon,
                   precoFinal: precoFinal,
                   custoProducao: custoProducao
               };
               newrelic.addCustomAttributes(attributes2);

               // Registrar os ingredientes
               registrarIngredientes(idUser, sabor, quantidade);
               

               res.json({ message: 'Compra processada com sucesso!' });
           });
});

// Rota para exibir produtos da tabela compra em formato JSON
app.get('/api/compra', (req, res) => {
    dbCompra.all('SELECT * FROM compra', (err, rows) => {
        if (err) {
            logger.error('Erro ao buscar produtos na tabela compra:', err);
            return res.status(500).json({ error: 'Erro ao buscar produtos na tabela compra' });
        }
        res.json(rows); // Retorna os resultados como JSON
    });
});

// Servindo a página da Home
app.get('/', (req, res) => {
    logger.info('[Route] -> +1 User Home');
    return res.sendFile(path.resolve(publicPath, 'index.html'));
});

// Servindo a página do Menu
app.get('/menu', (req, res) => {
    logger.info('[Route] -> +1 User Menu');
    return res.sendFile(path.resolve(publicPath, 'menu.html'));
});

// Servindo a página do Carrinho
app.get('/carrinho', (req, res) => {
    logger.info('[Route] -> +1 User Carrinho');
    return res.sendFile(path.resolve(publicPath, 'carrinho.html'));
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    logger.info('Servidor Iniciado');
});

// Rota "catch-all" para URLs não encontradas
app.use((req, res, next) => {
    logger.error(`Rota nao encontrada: ${req.originalUrl}`);

    newrelic.noticeError(err);

    res.status(404).json({ error: 'Rota nao encontrada' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    logger.error(`Erro no servidor`);
    newrelic.noticeError(err);

    res.status(500).json({ error: 'Erro interno do servidor' });
});
