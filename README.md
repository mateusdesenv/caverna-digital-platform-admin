# Caverna Digital Master Admin

Painel interno da equipe Caverna Digital para gerenciar clientes, usuários, planos, assinaturas, métricas globais e status das contas do SaaS.

## Rodar localmente

```bash
npm install
npm start
```

O projeto lê a API por `MASTER_ADMIN_API_URL` no `.env`.

```env
MASTER_ADMIN_API_URL=http://localhost:3333/api
```

## Autenticação

O login usa JWT emitido pela API em `POST /api/master/auth/login`.

Este projeto não cria usuário interno automaticamente. Para criar o primeiro admin, gere um hash de senha na API:

```bash
node scripts/hash-master-password.mjs "sua-senha"
```

Depois cadastre manualmente um documento em `adminusers` com `name`, `email`, `passwordHash`, `role` e `status`.

Roles suportadas:

- `super_admin`
- `admin`
- `support`
- `finance`
# caverna-digital-platform-admin
