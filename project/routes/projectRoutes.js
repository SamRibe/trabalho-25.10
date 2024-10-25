const express = require('express');
const router = express.Router();

// Simulação de banco de dados
let users = [{ username: 'admin', password: '123456' }];
let projects = [];
let tasks = [];

// Tela de Login
router.get('/', (req, res) => {
    res.render('login');
});

// Tela de Cadastro
router.get('/register', (req, res) => {
    res.render('register');
});

// Processar Cadastro
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.render('register', { error: 'Usuário já existe.' });
    }

    // Adiciona o novo usuário
    users.push({ username, password });
    res.redirect('/');
});

// Autenticação de Usuário
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Usuário ou senha inválidos.' });
    }
});

// Tela do Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('dashboard', { projects, username: req.session.user.username });
});

// Cadastro de Projeto
router.post('/create-project', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { projectName, projectDescription } = req.body;
    projects.push({ name: projectName, description: projectDescription });
    res.redirect('/dashboard');
});

// Exclusão de Projeto
router.post('/delete-project', (req, res) => {
    const { projectName } = req.body;
    projects = projects.filter(p => p.name !== projectName);
    res.redirect('/dashboard');
});

// Tela de Tarefas do Projeto
router.get('/project-tasks/:projectName', (req, res) => {
    const projectName = req.params.projectName;
    const projectTasks = tasks.filter(t => t.projectName === projectName);
    res.render('projectTasks', { projectName, projectTasks });
});

// Cadastro de Tarefa com data de início, prazo final e descrição
router.post('/create-task', (req, res) => {
    const { projectName, taskName, startDate, endDate, description } = req.body;

    // Verificação de datas
    if (new Date(endDate) < new Date(startDate)) {
        return res.render('projectTasks', { 
            projectName, 
            projectTasks: tasks.filter(t => t.projectName === projectName),
            error: 'O prazo final não pode ser anterior à data de início.' 
        });
    }

    tasks.push({ projectName, name: taskName, startDate, endDate, description });
    res.redirect(`/project-tasks/${projectName}`);
});

// Exclusão de Tarefa
router.post('/delete-task', (req, res) => {
    const { taskName, projectName } = req.body;
    tasks = tasks.filter(t => t.name !== taskName);
    res.redirect(`/project-tasks/${projectName}`);
});

// Tela de Edição de Tarefa
router.get('/edit-task/:taskName', (req, res) => {
    const taskName = req.params.taskName;
    const task = tasks.find(t => t.name === taskName);
    if (!task) return res.redirect('/dashboard');
    res.render('editTask', { task });
});

// Atualizar Tarefa com campos de nome, data de início, prazo final e descrição
router.post('/update-task', (req, res) => {
    const { oldTaskName, newTaskName, startDate, endDate, description } = req.body;
    const taskIndex = tasks.findIndex(t => t.name === oldTaskName);

    // Verificação de datas
    if (new Date(endDate) < new Date(startDate)) {
        const projectName = tasks[taskIndex].projectName;
        return res.render('editTask', { 
            task: tasks[taskIndex],
            error: 'O prazo final não pode ser anterior à data de início.' 
        });
    }

    if (taskIndex !== -1) {
        const projectName = tasks[taskIndex].projectName;
        tasks[taskIndex].name = newTaskName;
        tasks[taskIndex].startDate = startDate;
        tasks[taskIndex].endDate = endDate;
        tasks[taskIndex].description = description;
        res.redirect(`/project-tasks/${projectName}`);
    } else {
        res.redirect('/dashboard');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
