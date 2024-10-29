
# 🍕 AGERI Pizzaria - Observabilidade para o Seu Negócio

**Bem-vindo(a) ao repositório da AGERI Pizzaria!** Este projeto foi desenvolvido para demonstrar como a **observabilidade** pode transformar a gestão de negócios, trazendo **inteligência aplicada** e **dados em tempo real** para cada tomada de decisão.

> 💡 **AGERI Pizzaria** é um exemplo prático de como monitoramento avançado e análise de dados podem impulsionar a eficiência operacional e antecipar problemas e impactos em qualquer tipo de negócio.

## 🌟 Sobre o Projeto

AGERI Pizzaria é uma aplicação fictícia construída com o objetivo de apresentar um sistema de monitoramento e observabilidade completo para o seu negócio. Aqui, utilizamos a plataforma **New Relic** para agregar dados valiosos de cada etapa do processo.

### 🎯 Funcionalidades

1. **Monitoramento Real-Time**: Obtenha insights contínuos do desempenho do site, tempo de resposta e comportamento do usuário.
2. **Correlacionamento de Dados**: Integração de dados de tecnologia e negócios para entender o impacto de cada aspecto do processo.
3. **Visualização End-to-End**: Um panorama completo da operação da pizzaria, da página inicial ao pedido finalizado.

## 📊 Integração com New Relic

Para este projeto, utilizamos o **New Relic** como ferramenta de observabilidade. A integração oferece visibilidade completa em relação a:

- **Tempo de resposta** e latência de diferentes endpoints e serviços.
- **Comportamento do usuário**: Mapeamento de interações, identificando padrões de navegação e possíveis pontos de abandono.
- **Saúde do sistema**: Monitoramento de erros, exceções e performance do servidor.

Essa camada de monitoramento contínuo é um diferencial que permite um acompanhamento detalhado de cada fase do processo, ajudando a ajustar e otimizar as operações para uma melhor experiência ao cliente.

## 🛠️ Tecnologias Utilizadas

- **New Relic**: Plataforma de monitoramento e observabilidade.
- **HTML, CSS, JavaScript**: Estrutura, estilo e interatividade da interface da aplicação.
- **Express**: Framework para criação de APIs e rotas do servidor Node.js.
- **SQLite3**: Banco de dados leve, utilizado para armazenar pedidos e histórico de transações.

## 🚀 Como Executar o Projeto

1. Clone este repositório em sua máquina:
   ```bash
   git clone https://github.com/Globeely/AGERI-Pizzaria.git
   ```
2. Acesse o diretório do projeto:
   ```bash
   cd AGERI-Pizzaria
   ```
3. Instale as dependências necessárias:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente para conexão com o New Relic:
   - Acesse o arquivo `newrelic.js` e adicione a Key de acesso para instrumentação.

5. Execute a aplicação:
   ```bash
   node server.js
   ```
6. Acesse a aplicação no navegador através do endereço:
   ```plaintext
   http://localhost:3001
   ```

## 🤝 Contribuições

Contribuições são muito bem-vindas! Sinta-se à vontade para sugerir melhorias, abrir **issues** ou enviar **pull requests**. Cada ideia ajuda a enriquecer o projeto e tornar esta demonstração ainda mais completa.
