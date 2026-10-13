# 🍕 Sabor da Gente — Painel Administrativo Web

Painel administrativo web da pizzaria **Sabor da Gente**, desenvolvido em **Next.js + React** como projeto da disciplina de **Desenvolvimento Web**.

Este projeto é a parte **web (para administradores/funcionários)** do sistema. O **aplicativo mobile (para clientes)** foi desenvolvido na disciplina de Programação para Dispositivos Móveis:
👉 [PedroSlv7/sabor-da-gente](https://github.com/PedroSlv7/sabor-da-gente)

> *Mais que pizza, é sabor da gente!*

---

## 🎯 Tema

Enquanto o cliente faz pedidos pelo app mobile, a equipe da pizzaria usa este painel web para:

- gerenciar o **cardápio** (produtos);
- acompanhar e atualizar o **status dos pedidos**;
- visualizar **estatísticas** de vendas.

**Entidade principal:** `Produto` (pizzas, bebidas, combos e sobremesas).
**Entidade secundária:** `Pedido`, com atualização de status.

---

## 👥 Perfis de usuário

| Plataforma | Usuário | Funções |
|---|---|---|
| 📱 Mobile | Cliente | Ver cardápio, montar pizza, comprar, acompanhar pedido |
| 💻 Web | Administrador / Atendente | Gerenciar cardápio, pedidos e relatórios |

---

## ✅ Requisitos funcionais

- [ ] **RF01 — CRUD completo** de produtos (adicionar, listar, editar, excluir)
- [ ] **RF02 — Persistência** na nuvem (Supabase)
- [ ] **RF03 — Listagem inteligente:** busca por nome, filtro por categoria e status, ordenação por preço/data
- [ ] **RF04 — Validação** de campos obrigatórios e formatos
- [ ] **RF05 — Navegação:** listagem, formulário e página de detalhe
- [ ] **RF06 — Feedback:** confirmação de exclusão, mensagens de sucesso/erro e indicadores de carregamento

### ⭐ Extras (pontuação bônus)

- [ ] Tema claro/escuro
- [ ] Gráficos e estatísticas (dashboard)
- [ ] Exportação de dados (CSV)

---

## 🗂️ Modelo de dados

### `produtos`

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador (PK) |
| nome | text | Nome do produto (obrigatório) |
| descricao | text | Ingredientes / detalhes |
| categoria | text | Pizza, Bebida, Combo ou Sobremesa |
| preco | numeric | Preço em R$ |
| tamanho | text | Pequena, Média, Grande, Família (quando aplicável) |
| imagem_url | text | Foto do produto |
| disponivel | boolean | Ativo / indisponível no cardápio |
| criado_em | timestamp | Data de cadastro |

### `pedidos`

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador (PK) |
| cliente_nome | text | Nome do cliente |
| itens | jsonb | Itens do pedido |
| total | numeric | Valor total |
| forma_pagamento | text | Dinheiro, Pix, Crédito, Débito |
| status | text | Recebido, Em preparo, Saiu para entrega, Entregue |
| criado_em | timestamp | Data do pedido |

---

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/) (App Router) + React
- TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- React Hook Form + Zod (validação)
- Recharts (gráficos)
- Git e GitHub

### Por que Supabase?

- Banco PostgreSQL na nuvem, com os dados mantidos mesmo após fechar o navegador ou reiniciar o servidor.
- Autenticação e armazenamento de imagens já incluídos.
- Possibilidade de **compartilhar o mesmo banco com o app mobile**, integrando as duas partes do sistema.
- Plano gratuito suficiente para o projeto.

---

## 🧱 Estrutura do projeto

```
sabor-da-gente-web/
├── src/
│   ├── app/                # Páginas (rotas)
│   │   ├── produtos/       # Listagem, formulário e detalhe
│   │   ├── pedidos/
│   │   └── dashboard/
│   ├── components/         # Componentes reutilizáveis
│   ├── lib/                # Cliente Supabase e utilitários
│   ├── services/           # Camada de dados (CRUD)
│   └── types/              # Tipos TypeScript
├── public/
└── README.md
```

---

## 🚀 Como executar

### Pré-requisitos

- Node.js 18+
- Conta no Supabase

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/4rthurhr/sabor--da-gente-web.git
cd sabor--da-gente-web

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Rodar o projeto
npm run dev
```

Acesse: http://localhost:3000

---

## 📸 Telas

> Adicione aqui os prints do sistema.

| Dashboard | Listagem de produtos |
|---|---|
| ![Dashboard](docs/dashboard.png) | ![Produtos](docs/produtos.png) |

| Formulário | Pedidos |
|---|---|
| ![Formulário](docs/formulario.png) | ![Pedidos](docs/pedidos.png) |

---

## 🎨 Identidade visual

| Cor | Hex |
|---|---|
| Vermelho (primária) | `#E63946` |
| Amarelo (secundária) | `#FFB703` |
| Cinza escuro | `#2E2E2E` |
| Bege | `#F7F4EE` |
| Cinza claro | `#E0E0E0` |

---

## 👨‍💻 Equipe

| Nome | GitHub | Responsabilidade |
|---|---|---|
| Arthur | [@4rthurhr](https://github.com/4rthurhr) | A definir |
| Integrante 2 | [@Denilsonrsl](https://github.com/Denilsonrsl) | A definir |
| Integrante 3 | [@PedroSlv](https://github.com/PedroSlv) | A definir |

---

## 📄 Licença

Projeto acadêmico — MIT License.
