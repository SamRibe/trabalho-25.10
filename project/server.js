// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const port = 3000;

// Configuração do EJS
app.set('view engine', 'ejs');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'minha-chave-secreta', resave: false, saveUninitialized: true }));

// Rotas
app.use('/', projectRoutes);

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
