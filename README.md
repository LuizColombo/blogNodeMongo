# blogNodeMongo

Aplicação simples de blog usando **Node.js**, **MongoDB** e **Docker**.

---

## 🧾 Sobre

Este projeto é um exemplo de aplicação de blog que permite criar, ler, editar e deletar posts (CRUD). É construída com uma stack básica de backend + template engine para renderização de views no servidor.

Principais objetivos:

- Demonstrar integração do Node.js com MongoDB.  
- Mostrar uso de Docker para facilitar ambiente de desenvolvimento.  
- Utilizar templates (Handlebars) para renderizar as páginas do blog no servidor.

---

## 🛠 Tecnologias usadas
```text
| Tecnologia | Uso no projeto |
|---|---|
| **Node.js** | Servidor backend |
| **Express** | Framework web para rotas e middlewares |
| **MongoDB** | Banco de dados para armazenar posts e dados do blog |
| **Handlebars** | Template engine para renderizar as views |
| **Docker** | Containerização para isolar dependências e ambiente |
| Outras pastas úteis: | `routes`, `models`, `views`, etc. |
```
---
## 📂 Estrutura do Projeto
```text
blogNodeMongo/
├── app.js                # Ponto de entrada da aplicação
├── package.json          # Dependências e scripts
├── config/               # Arquivos de configuração (ex: DB, Docker, etc.)
├── docker/               # Arquivos relacionados ao Docker (Dockerfile, docker-compose etc.)
├── helpers/              # Helpers auxiliares para templates ou demais funções utilitárias
├── models/               # Modelos (Schemas) do MongoDB
├── routes/               # Rotas da aplicação
├── views/                # Templates (Handlebars) para renderização de páginas
└── .gitignore            # Arquivos/pastas ignorados pelo Git
```
🚀 Como executar localmente
Pré-requisitos:

  - Node.js instalado
  - Docker e Docker Compose (se quiser usar container)
  - MongoDB funcionando localmente ou via container
  - Git

Passos
1. Clone este repositório:
  git clone https://github.com/LuizColombo/blogNodeMongo.git
  cd blogNodeMongo

2. Instale as dependências:
  npm install

3. Configure variáveis de ambiente (se houver). Exemplo comum: MONGO_URI, PORT. (Verifique o arquivo config ou config/*)

4.  Iniciar o banco de dados MongoDB:
  - Localmente (se já tiver MongoDB instalado)
  - Ou via Docker:
    docker-compose up -d

5. Iniciar a aplicação:
  npm run dev

6. Iniciar a aplicação:
   Abra no navegador em http://localhost:3000 (ou outra porta configurada) para ver o blog.

📋 Funcionalidades

  - Criar novos posts
  - Editar posts existentes
  - Remover posts
  - Ver lista de posts
  - Página de visualização individual de posts
  - Renderização de páginas usando templates

✅ Melhorias sugeridas

  - Autenticação de usuários (login, registro)
  - Sistema de permissões (quem pode editar ou deletar)
  - Validação mais robusta de entradas de usuário
  - Upload de imagens / media para os posts
  - Paginação / filtros na lista de posts
  - Testes automatizados (unitários / integração)
  - Deploy em ambiente de produção (Heroku, AWS, DigitalOcean, etc.)

👤 Autor

  - Luiz Colombo
  - GitHub: @LuizColombo
  - Email: colombo.devops@gmail.com
