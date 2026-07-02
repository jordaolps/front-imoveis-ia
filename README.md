# Front-end: Interface de Consultoria Imobiliária IA

Este é o Front-end do projeto de Consultoria Imobiliária com Inteligência Artificial, construído com **React** e **Vite**. 

A aplicação oferece uma interface moderna dividida em duas funcionalidades principais: uma **Calculadora de Avaliação de Imóveis** (integrada a um modelo de Machine Learning) e um **Chat com Corretor Virtual** (integrado ao Google Gemini), com um design responsivo e inspirado em aplicativos de mensagens.

![Demonstração do Projeto](cole_aqui_o_link_de_um_print_da_sua_tela.png)

## ✨ Funcionalidades
* **Formulário Dinâmico:** Inputs preparados para evitar erros de digitação (mobile-friendly).
* **Consumo de API REST:** Integração com Back-end em FastAPI.
* **Chat Estilo WhatsApp:** Histórico de mensagens persistente na tela com balões de conversa justificados e interface intuitiva.
* **Dark Mode Dinâmico:** Alternância entre Tema Claro e Tema Escuro baseada em variáveis de CSS, melhorando a acessibilidade e UX.
* **Totalmente Responsivo:** Layout se adapta perfeitamente a dispositivos móveis e desktops.

## 🛠️ Tecnologias Utilizadas
* **React (Hooks: useState, useEffect)**
* **Vite** (Build tool)
* **JavaScript (ES6+)**
* **CSS3** (Variáveis CSS para Temas, Flexbox)
* **Fetch API** (Requisições HTTP)

## 🚀 Como rodar o projeto localmente

**Pré-requisitos:** Você precisará ter o [Node.js](https://nodejs.org/) instalado em sua máquina e a [API do Back-end](link_para_seu_outro_repositorio) rodando em segundo plano.

1. Clone o repositório:
   
    ```git clone https://github.com/jordaolps/front-imoveis-ia.git```

    ```cd front-imoveis-ia```

2. Instale as dependências:

    ```npm install```

3. Verifique a URL da API:
Abra o arquivo src/App.jsx e garanta que os links do fetch estejam apontando para a sua API (ex: http://127.0.0.1:8000 se for local, ou o link do Render se estiver em produção).

4. Rode o servidor de desenvolvimento:

    ```npm run dev```

Acesse o link gerado no terminal (geralmente http://localhost:5173) para usar a aplicação.


## Autor

Desenvolvido por [Jordão](https://linkedin/in/jordaolps) como projeto de portfólio para demonstrar habilidades em Front-end, integração de APIs e UX/UI Design.
