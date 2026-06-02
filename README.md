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

O login usa Firebase Authentication com Google no frontend e JWT emitido pela API em `POST /api/master/auth/google`.

Fluxo:

1. Firebase abre o popup Google.
2. O frontend obtém o `idToken`.
3. O `idToken` é enviado para a API.
4. A API valida o token no Firebase, confere se o e-mail pertence a um `AdminUser` ativo e retorna o JWT interno.
5. A sessão é salva em `localStorage` usando `auth_user` e `auth_token`.

Este projeto não cria usuário interno automaticamente. Para liberar o primeiro e-mail interno, rode na pasta da API:

```bash
node scripts/create-master-admin.mjs --email=seu-email-google@dominio.com --name="Seu Nome" --role=super_admin
```

O e-mail informado precisa ser exatamente o mesmo usado no popup do Google.

Roles suportadas:

- `super_admin`
- `admin`
- `support`
- `finance`
# caverna-digital-platform-admin
