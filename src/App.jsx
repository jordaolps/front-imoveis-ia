import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 1. ESTADOS DO SISTEMA
  const [temaEscuro, setTemaEscuro] = useState(false);
  
  // Começamos com os valores vazios ("") para evitar o bug do "0" travado no celular
  const [imovel, setImovel] = useState({
    OverallQual: "",
    GrLivArea: "",
    GarageCars: "",
    TotalBsmtSF: "",
    FullBath: "",
    YearBuilt: ""
  });

  const [preco, setPreco] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  
  // 2. ESTADO DO CHAT (Estilo WhatsApp)
  const [chatMensagens, setChatMensagens] = useState([
    { autor: "bot", texto: "Olá! Sou seu corretor virtual. Avalie um imóvel ao lado e depois tire suas dúvidas comigo!" }
  ]);

  // 3. EFEITO DO MODO NOTURNO
  useEffect(() => {
    // Muda a classe do <body> do HTML dependendo do tema escolhido
    document.body.className = temaEscuro ? 'tema-escuro' : 'tema-claro';
  }, [temaEscuro]);

  // 4. FUNÇÕES DE INTERAÇÃO
  const handleChange = (e) => {
    const nomeDoCampo = e.target.name;
    const valorDoCampo = e.target.value;
    // Se o usuário apagar, fica vazio. Se digitar, converte para número, tirando os zeros da frente.
    setImovel({ ...imovel, [nomeDoCampo]: valorDoCampo === '' ? '' : Number(valorDoCampo) });
  };

  const avaliarImovel = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // DICA: Lembre-se de trocar o 127.0.0.1 pelo seu link do Render quando for subir pra internet!
      const resposta = await fetch('https://api-imoveis-ia.onrender.com/prever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Envia os dados. Se algum campo estiver vazio, manda 0 pro back-end não quebrar
        body: JSON.stringify({
          OverallQual: imovel.OverallQual || 0,
          GrLivArea: imovel.GrLivArea || 0,
          GarageCars: imovel.GarageCars || 0,
          TotalBsmtSF: imovel.TotalBsmtSF || 0,
          FullBath: imovel.FullBath || 0,
          YearBuilt: imovel.YearBuilt || 0
        }) 
      });
      
      const dados = await resposta.json();
      setPreco(dados.preco_estimado);
      
      // Adiciona uma mensagem automática do bot avisando o preço
      setChatMensagens(prev => [...prev, { 
        autor: "bot", 
        texto: `Acabei de avaliar! O valor estimado é de US$ ${dados.preco_estimado.toLocaleString('en-US')}. O que você quer saber sobre ele?` 
      }]);
    } catch (error) {
      alert("Erro ao conectar com a API.");
    }
    setCarregando(false);
  };

  const perguntarIA = async (e) => {
    e.preventDefault();
    if (!preco) return alert("Avalie o imóvel primeiro!");
    if (pergunta.trim() === "") return;

    // Adiciona a pergunta do usuário na tela (Balão verde)
    const novaPergunta = { autor: "user", texto: pergunta };
    setChatMensagens(prev => [...prev, novaPergunta]);
    
    // Adiciona uma mensagem temporária de carregamento
    const mensagemCarregando = { autor: "bot", texto: "Digitando..." };
    setChatMensagens(prev => [...prev, mensagemCarregando]);
    
    const perguntaEnviada = pergunta;
    setPergunta(""); // Limpa a caixa de texto

    try {
      const detalhes = `Construída em ${imovel.YearBuilt || 0}, ${imovel.FullBath || 0} banheiros, nota ${imovel.OverallQual || 0}, ${imovel.GarageCars || 0} vagas.`;
      
      const resposta = await fetch('https://api-imoveis-ia.onrender.com/consultar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preco_estimado: preco,
          pergunta: perguntaEnviada,
          detalhes_imovel: detalhes
        })
      });

      const dados = await resposta.json();
      
      // Substitui o "Digitando..." pela resposta real da IA
      setChatMensagens(prev => {
        const historico = [...prev];
        historico[historico.length - 1] = { autor: "bot", texto: dados.resposta };
        return historico;
      });
    } catch (error) {
      setChatMensagens(prev => {
        const historico = [...prev];
        historico[historico.length - 1] = { autor: "bot", texto: "Desculpe, tive um erro de conexão." };
        return historico;
      });
    }
  };

  // 5. O VISUAL DA TELA
  return (
    <div className="container">
      <header className="cabecalho">
        <h1>🏠 Consultoria Imobiliária com IA</h1>
        <button className="btn-tema" onClick={() => setTemaEscuro(!temaEscuro)}>
          {temaEscuro ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
        </button>
      </header>

      <main className="layout-duplo">
        {/* LADO ESQUERDO: CALCULADORA */}
        <section className="card">
          <h2>1. Características do Imóvel</h2>
          <form onSubmit={avaliarImovel}>
            <label>Nota de Qualidade (1 a 10):</label>
            <input type="number" name="OverallQual" value={imovel.OverallQual} onChange={handleChange} min="1" max="10" placeholder="Ex: 7" required />

            <label>Área Construída (em pés²):</label>
            <input type="number" name="GrLivArea" value={imovel.GrLivArea} onChange={handleChange} placeholder="Ex: 1500" required />

            <label>Vagas de Garagem:</label>
            <input type="number" name="GarageCars" value={imovel.GarageCars} onChange={handleChange} placeholder="Ex: 2" required />

            <label>Área do Porão (pés²):</label>
            <input type="number" name="TotalBsmtSF" value={imovel.TotalBsmtSF} onChange={handleChange} placeholder="Ex: 800" required />

            <label>Banheiros Completos:</label>
            <input type="number" name="FullBath" value={imovel.FullBath} onChange={handleChange} placeholder="Ex: 2" required />

            <label>Ano de Construção:</label>
            <input type="number" name="YearBuilt" value={imovel.YearBuilt} onChange={handleChange} placeholder="Ex: 2005" required />

            <button type="submit" disabled={carregando} className="btn-avaliar">
              {carregando ? "Calculando..." : "💰 Avaliar Preço"}
            </button>
          </form>

          {preco && (
            <div className="resultado-preco">
              <h3>Valor Estimado:</h3>
              <p className="valor-destaque">US$ {preco.toLocaleString('en-US')}</p>
            </div>
          )}
        </section>

        {/* LADO DIREITO: CHAT IA (ESTILO WHATSAPP) */}
        <section className="card">
          <h2>2. Consultor IA 🤖</h2>
          
          <div className="chat-box">
            {chatMensagens.map((msg, index) => (
              <div key={index} className={`mensagem ${msg.autor}`}>
                {msg.texto}
              </div>
            ))}
          </div>

          <form onSubmit={perguntarIA} className="form-chat">
            <input 
              type="text" 
              placeholder="Digite sua mensagem..." 
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              disabled={!preco} 
            />
            <button type="submit" disabled={!preco || carregando} className="btn-enviar">
              Enviar
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App