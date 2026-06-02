require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Para JWT (JSON Web Tokens)
const bcrypt = require('bcryptjs'); // Para hash de senhas
const fs = require('fs'); // Módulo para trabalhar com o sistema de arquivos
const path = require('path'); // Módulo para resolver caminhos de arquivos

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_muito_seguro'; // Use uma variável de ambiente para o segredo!

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (importante para frontend React)
app.use(bodyParser.json()); // Analisa o corpo das requisições como JSON

// --- Caminhos para os arquivos de "Banco de Dados" (simulados) ---
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const requestsFilePath = path.join(__dirname, 'data', 'requests.json');
const ociRequestsFilePath = path.join(__dirname, 'data', 'ociRequests.json'); // Novo caminho para requisições OCI

// --- Funções Auxiliares para ler/escrever arquivos JSON ---
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            // Se o arquivo não existe, cria um array vazio e o retorna
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        // Garante que o diretório 'data' exista
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
    }
};

// --- Middleware de Autenticação JWT ---
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro na verificação do token:', err);
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = user; // Adiciona as informações do usuário decodificadas à requisição
        next();
    });
};

// --- Rotas de Autenticação e Registro ---

// Rota de Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(usersFilePath);

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado.' });
    }
    if (user.status !== 'approved') {
        return res.status(403).json({ message: 'Sua conta ainda não foi aprovada ou está inativa.' });
    }

    // Compara a senha fornecida com o hash armazenado
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            console.error('Erro ao comparar senhas:', err);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        // Se o usuário e a senha estiverem corretos, gera um token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.json({ message: 'Login bem-sucedido!', token, user: { username: user.username, role: user.role } });
    });
});

// Rota de Solicitação de Novo Acesso (Registro)
app.post('/api/register-request', async (req, res) => {
    const { username, password, email, company, role } = req.body;
    const requests = readJsonFile(requestsFilePath);
    const users = readJsonFile(usersFilePath);

    // Validação básica
    if (!username || !password || !email || !company || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Verifica se o username já existe em usuários aprovados ou em requisições pendentes
    if (users.some(u => u.username === username) || requests.some(r => r.username === username && r.status === 'pending')) {
        return res.status(409).json({ message: 'Nome de usuário já existe ou está em análise.' });
    }

    // Hashear a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o salt rounds

    const newRequest = {
        id: Date.now().toString(), // ID único baseado no timestamp
        username,
        password: hashedPassword, // Armazena a senha hash
        email,
        company,
        role,
        status: 'pending', // Status inicial
        createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    writeJsonFile(requestsFilePath, requests);

    res.status(201).json({ message: 'Sua solicitação de acesso foi enviada e está aguardando aprovação.' });
});

// --- Rotas de Gerenciamento de Usuários (Protegidas) ---

// Rota para obter todas as solicitações de acesso (apenas Admin/Manager)
app.get('/api/admin/requests', authenticateJWT, (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar solicitações.' });
    }
    const requests = readJsonFile(requestsFilePath);
    res.json(requests);
});

// Rota para aprovar/rejeitar uma solicitação (apenas Admin/Manager)
app.post('/api/admin/requests/:id/action', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
    }

    const requestId = req.params.id;
    const { action } = req.body; // 'approve' ou 'reject'

    let requests = readJsonFile(requestsFilePath);
    let users = readJsonFile(usersFilePath);

    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
        return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    const targetRequest = requests[requestIndex];

    if (targetRequest.status !== 'pending') {
        return res.status(400).json({ message: `Esta solicitação já foi ${targetRequest.status}.` });
    }

    if (action === 'approve') {
        // Move a solicitação para a lista de usuários aprovados
        const newUser = {
            id: targetRequest.id,
            username: targetRequest.username,
            password: targetRequest.password, // Senha já hash
            email: targetRequest.email,
            company: targetRequest.company,
            role: targetRequest.role,
            status: 'approved',
            createdAt: targetRequest.createdAt,
            approvedAt: new Date().toISOString(),
            approvedBy: req.user.username
        };
        users.push(newUser);
        writeJsonFile(usersFilePath, users);

        // Atualiza o status da solicitação
        requests[requestIndex].status = 'approved';
        requests[requestIndex].approvedAt = new Date().toISOString();
        requests[requestIndex].approvedBy = req.user.username;

        writeJsonFile(requestsFilePath, requests);
        res.json({ message: 'Solicitação aprovada e usuário adicionado!' });

    } else if (action === 'reject') {
        // Atualiza o status da solicitação para rejeitado
        requests[requestIndex].status = 'rejected';
        requests[requestIndex].rejectedAt = new Date().toISOString();
        requests[requestIndex].rejectedBy = req.user.username;

        writeJsonFile(requestsFilePath, requests);
        res.json({ message: 'Solicitação rejeitada.' });
    } else {
        res.status(400).json({ message: 'Ação inválida. Use "approve" ou "reject".' });
    }
});

// --- Rota para o Dashboard (Protegida) ---
app.get('/api/dashboard', authenticateJWT, (req, res) => {
    // Retorna dados simulados para o dashboard
    const users = readJsonFile(usersFilePath);
    const pendingRequests = readJsonFile(requestsFilePath).filter(req => req.status === 'pending').length;
    const ociRequests = readJsonFile(ociRequestsFilePath).length;

    res.json({
        message: `Bem-vindo, ${req.user.username}!`,
        userRole: req.user.role,
        dashboardData: {
            totalUsers: users.length,
            pendingAccessRequests: pendingRequests,
            ociRequestsSent: ociRequests,
            // Adicione mais dados conforme necessário
        }
    });
});

// --- Rota para Enviar JSON para OCI (Simulado) ---
app.post('/api/oci/send', authenticateJWT, (req, res) => {
    // Apenas 'Admin' e 'Operator' podem enviar JSON para OCI
    if (req.user.role !== 'Admin' && req.user.role !== 'Operator') {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para enviar JSON OCI.' });
    }

    const { ociJson } = req.body;

    if (!ociJson) {
        return res.status(400).json({ message: 'JSON OCI não fornecido.' });
    }

    console.log('JSON OCI recebido:', ociJson);

    // Simulação de envio para a OCI
    // Em um cenário real, aqui você usaria o SDK da OCI para interagir com os serviços.
    // Ex: const oci = require('oci-sdk');
    // oci.compute.createInstance(ociJson);

    const ociRequests = readJsonFile(ociRequestsFilePath);
    const newOciRequest = {
        id: Date.now().toString(),
        username: req.user.username,
        json_payload: ociJson,
        timestamp: new Date().toISOString(),
        status: 'Success', // Ou 'Failed' dependendo da validação/simulação
        message: 'Requisição OCI processada com sucesso (simulado).',
        oci_response: { // Simulação de resposta da OCI
            requestId: `ocid1.request.${Date.now()}`,
            status: 'COMPLETED',
            details: 'Recurso criado/atualizado com sucesso.'
        }
    };

    // Exemplo de erro simulado (descomente para testar)
    // if (Math.random() < 0.3) { // 30% de chance de falha
    //     newOciRequest.status = 'Failed';
    //     newOciRequest.message = 'Falha ao processar a requisição OCI (simulado).';
    //     newOciRequest.oci_response = { error: 'Invalid parameter', code: '400' };
    // }

    ociRequests.push(newOciRequest);
    writeJsonFile(ociRequestsFilePath, ociRequests);

    res.json({
        message: 'JSON OCI recebido e processado com sucesso (simulado)!',
        status: newOciRequest.status
    });
});


// Rota para listar requisições OCI (novo endpoint para o histórico)
app.get('/api/oci/requests', authenticateJWT, (req, res) => {
    // Permissão: Admin, Operator ou Manager podem ver o histórico
    if (req.user.role !== 'Admin' && req.user.role !== 'Operator' && req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para listar requisições OCI.' });
    }

    const ociRequestsPath = path.join(__dirname, 'data', 'ociRequests.json');
    if (fs.existsSync(ociRequestsPath)) {
        const ociRequests = JSON.parse(fs.readFileSync(ociRequestsPath, 'utf8'));
        // Retorna as requisições mais recentes primeiro
        res.json(ociRequests.reverse()); // .reverse() para mostrar os mais recentes primeiro
    } else {
        res.json([]); // Retorna array vazio se o arquivo não existir
    }
});


// --- Rota de Verificação de Token (para manter o usuário logado) ---
app.get('/api/check-token', authenticateJWT, (req, res) => {
    // Se o middleware authenticateJWT passou, o token é válido
    // Retorna as informações do usuário do token
    res.json({ isValid: true, user: { username: req.user.username, role: req.user.role } });
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);

    // Cria o diretório 'data' se ele não existir
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
        console.log('Diretório "data" criado.');
    }

    // Inicializa arquivos JSON vazios se não existirem
    [usersFilePath, requestsFilePath, ociRequestsFilePath].forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf8');
            console.log(`Arquivo ${path.basename(filePath)} criado.`);
        }
    });

    // Garante que o usuário admin padrão exista
    const users = readJsonFile(usersFilePath);
    const adminUserExists = users.some(u => u.username === 'admin' && u.role === 'Admin');

    if (!adminUserExists) {
        bcrypt.hash('admin123', 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erro ao gerar hash para senha do admin:', err);
                return;
            }
            const adminUser = {
                id: 'admin-1',
                username: 'admin',
                password: hashedPassword,
                email: 'admin@portal.com',
                company: 'KNAPP',
                role: 'Admin',
                status: 'approved',
                createdAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                approvedBy: 'system'
            };
            users.push(adminUser);
            writeJsonFile(usersFilePath, users);
            console.log('Usuário admin padrão criado: admin/admin123');
        });
    }
});