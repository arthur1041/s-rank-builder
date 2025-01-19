# S-Rank Builder

S-Rank Builder é uma aplicação de linha de comando criada com Node.js e TypeScript para automatizar a seleção de Fundos Imobiliários (FIIs). Ele usa web scraping para obter dados, aplica filtros personalizáveis e gera relatórios detalhados em formatos JSON e Excel.

## Requisitos

- Node.js (versão 20 ou superior).
- Yarn para gerenciar dependências.
- SQLite para cache local.

## Como configurar

- Clone o repositório:
- Instale as dependências executando o comando: `yarn`
- Certifique-se de que a pasta `data/` contém um banco SQLite chamado `cache.db`.

## Como executar

- Para iniciar a aplicação: `yarn startF`

A aplicação exibirá um menu interativo no terminal com opções para buscar dados, limpar o cache ou sair.

- Os resultados são salvos na pasta files/ nos formatos:
  - JSON (dados estruturados).
  - Excel (relatórios para análise manual).
