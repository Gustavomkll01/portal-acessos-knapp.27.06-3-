# Portal de Acessos Knapp

Sistema web para gerenciamento de acessos, usuários e integrações OCI, desenvolvido com React no frontend e Node.js no backend.

## 📋 Funcionalidades

### Autenticação
- Login com JWT
- Controle de sessão
- Validação automática de token
- Controle de permissões por perfil

### Dashboard
- Tela inicial com indicadores
- Navegação intuitiva
- Interface responsiva

### Gerenciamento de Usuários
- Listagem de usuários
- Cadastro de novos usuários
- Alteração de funções
- Redefinição de senha
- Exclusão de usuários
- Controle de permissões

### Integração OCI
- Envio de JSON
- Histórico de requisições
- Armazenamento local das operações

### Administração
- Configurações do sistema
- Gestão de acessos
- Controle administrativo

---

# 🛠 Tecnologias Utilizadas

## Frontend
- React 18
- Material UI (MUI)
- React Hooks
- Fetch API

## Backend
- Node.js
- Express
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

## Armazenamento
- Arquivos JSON

---

# 📁 Estrutura do Projeto

```text
portal-acessos-knapp/
│
├── backend/
│   ├── data/
│   │   ├── users.json
│   │   ├── requests.json
│   │   └── ociRequests.json
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# 🚀 Instalação

## 1. Clonar o projeto

```bash
git clone <url-do-repositorio>
```

ou baixar o ZIP e extrair.

---

## 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

---

## 3. Configurar arquivo .env

Criar o arquivo:

```env
PORT=5000
JWT_SECRET=seu_segredo_jwt
```

---

## 4. Iniciar Backend

```bash
npm start
```

ou

```bash
node server.js
```

Servidor disponível em:

```text
http://localhost:5000
```

---

## 5. Instalar dependências do Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

---

## 6. Iniciar Frontend

```bash
npm start
```

Aplicação disponível em:

```text
http://localhost:3000
```

---

# 🔑 Acesso Inicial

Usuário padrão:

```text
admin
```

Senha padrão:

```text
admin123
```

Caso o administrador não exista, o backend poderá criá-lo automaticamente durante a inicialização.

---

# 📡 API

## Login

```http
POST /api/login
```

Exemplo:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## Validar Token

```http
GET /api/check-token
```

Header:

```http
Authorization: Bearer TOKEN
```

---

# 📦 Deploy

## Frontend

Gerar build:

```bash
npm run build
```

A pasta gerada será:

```text
build/
```

---

## Backend

Executar em produção:

```bash
node server.js
```

ou utilizando PM2:

```bash
pm2 start server.js
```

---

# 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcryptjs
- Controle de acesso por perfil
- Validação de token em rotas protegidas

---

# 📈 Melhorias Futuras

- Banco de dados MongoDB
- Login com Google
- Logs avançados
- Dashboard analítico
- Integração OCI real
- Exportação de relatórios
- Notificações em tempo real
- Backup automático

---

# 👨‍💻 Autor

Desenvolvido por Marcio Gustavo Ananias da Silva.

Projeto criado para estudos, portfólio e evolução profissional na área de desenvolvimento de software.