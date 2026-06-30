import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [temaEscuro, setTemaEscuro] = useState(false);
  
  const [imovel, setImovel] = useState({
    OverallQual: 5,
    OverallCond: 5,
    LotArea: "",
    GrLivArea: "",
    FullBath: "",
    KitchenAbvGr: "",
    BedroomAbvGr: "",
    GarageCars: "",
    BldgType: 1,
    YearBuilt: ""
  });

  const [preco, setPreco] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  
  // 1. NOVA MENSAGEM DO BOT SEM EMOJIS
  const [chatMensagens, setChatMensagens] = useState([
    { autor: "bot", texto: "Olá, seu assistente imobiliário virtual aqui! Preencha os dados ao lado e eu responderei qualquer dúvida que tenha sobre seu imóvel!" }
  ]);

  useEffect(() => {
    document.body.className = temaEscuro ? 'tema-escuro' : 'tema-claro';
  }, [temaEscuro]);

  const handleChange = (e) => {
    const nomeDoCampo = e.target.name;
    const valorDoCampo = e.target.value;
    setImovel({ ...imovel, [nomeDoCampo]: valorDoCampo === '' ? '' : Number(valorDoCampo) });
  };

  // Função auxiliar para traduzir a nota numérica em texto
  const traduzirNota = (nota) => {
    if (nota <= 3) return "Ruim";
    if (nota <= 6) return "Regular";
    if (nota <= 8) return "Bom";
    return "Excelente";
  };

  const avaliarImovel = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const resposta = await fetch('https://api-imoveis-ia.onrender.com/prever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          OverallQual: imovel.OverallQual || 5,
          OverallCond: imovel.OverallCond || 5,
          LotArea: imovel.LotArea || 0,
          GrLivArea: imovel.GrLivArea || 0,
          FullBath: imovel.FullBath || 0,
          KitchenAbvGr: imovel.KitchenAbvGr || 0,
          BedroomAbvGr: imovel.BedroomAbvGr || 0,
          GarageCars: imovel.GarageCars || 0,
          BldgType: imovel.BldgType || 1,
          YearBuilt: imovel.YearBuilt || 0
        }) 
      });
      
      const dados = await resposta.json();
      setPreco(dados.preco_estimado);
      
      const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.preco_estimado);
      
      setChatMensagens(prev => [...prev, { 
        autor: "bot", 
        texto: `Avaliação concluída. O valor estimado do imóvel é de ${valorFormatado}. Como posso ajudar em relação a este valor?` 
      }]);
    } catch (error) {
      alert("Erro ao conectar com a API.");
    }
    setCarregando(false);
  };

  const perguntarIA = async (e) => {
    e.preventDefault();
    if (!preco) return alert("Avalie o imóvel primeiro.");
    if (pergunta.trim() === "") return;

    const novaPergunta = { autor: "user", texto: pergunta };
    setChatMensagens(prev => [...prev, novaPergunta]);
    setChatMensagens(prev => [...prev, { autor: "bot", texto: "Digitando..." }]);
    
    const perguntaEnviada = pergunta;
    setPergunta(""); 

    try {
      const detalhes = `Área construída de ${imovel.GrLivArea || 0}m², terreno de ${imovel.LotArea || 0}m², construída em ${imovel.YearBuilt || 0}. Tem ${imovel.BedroomAbvGr || 0} quartos, ${imovel.FullBath || 0} banheiros e garagem para ${imovel.GarageCars || 0} carros.`;
      
      const historicoFormatado = chatMensagens.map(msg => 
        msg.autor === 'user' ? `Usuário: ${msg.texto}` : `Corretor: ${msg.texto}`
      ).join('\n');

      const resposta = await fetch('https://api-imoveis-ia.onrender.com/consultar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preco_estimado: preco,
          pergunta: perguntaEnviada,
          detalhes_imovel: detalhes,
          historico: historicoFormatado 
        })
      });

      const dados = await resposta.json();
      
      setChatMensagens(prev => {
        const historico = [...prev];
        historico[historico.length - 1] = { autor: "bot", texto: dados.resposta };
        return historico;
      });
    } catch (error) {
      setChatMensagens(prev => {
        const historico = [...prev];
        historico[historico.length - 1] = { autor: "bot", texto: "Desculpe, ocorreu um erro de conexão." };
        return historico;
      });
    }
  };

  return (
    <div className="container">
      <header className="cabecalho">
        {/* SEM EMOJIS */}
        <h1>Consultoria Imobiliária com IA</h1>
        <button className="btn-tema" onClick={() => setTemaEscuro(!temaEscuro)}>
          {temaEscuro ? "Modo Claro" : "Modo Escuro"}
        </button>
      </header>

      <main className="layout-duplo">
        <section className="card">
          <h2>1. Características do Imóvel</h2>
          <form onSubmit={avaliarImovel} className="grid-form">
            
            <div className="campo-form">
              <label>Tipo de Construção:</label>
              <select name="BldgType" value={imovel.BldgType} onChange={handleChange} required>
                <option value="1">Casa Padrão (1 Família)</option>
                <option value="2">Casa Dividida (2 Famílias)</option>
                <option value="3">Duplex</option>
                <option value="4">Sobrado Geminado (Ponta)</option>
                <option value="5">Sobrado Geminado (Meio)</option>
              </select>
              {/* DICA SOBRE AS CASAS */}
              <small className="dica-texto">
                * Duplex: Casa com 2 pavimentos conectados.<br/>
                * Sobrado Geminado: Casas coladas parede a parede.
              </small>
            </div>

            {/* AVALIAÇÃO COM TEXTO DINÂMICO */}
            <div className="campo-form slider-container">
              <label>
                Qualidade Geral: 
                <span className="badge">{imovel.OverallQual} - {traduzirNota(imovel.OverallQual)}</span>
              </label>
              <input type="range" name="OverallQual" value={imovel.OverallQual} onChange={handleChange} min="1" max="10" />
            </div>

            <div className="campo-form slider-container">
              <label>
                Estado de Conservação: 
                <span className="badge">{imovel.OverallCond} - {traduzirNota(imovel.OverallCond)}</span>
              </label>
              <input type="range" name="OverallCond" value={imovel.OverallCond} onChange={handleChange} min="1" max="10" />
            </div>

            <div className="campo-form">
              <label>Tamanho do Terreno (m²):</label>
              <input type="number" name="LotArea" value={imovel.LotArea} onChange={handleChange} placeholder="Ex: 500" required />
            </div>

            <div className="campo-form">
              <label>Área Construída (m²):</label>
              <input type="number" name="GrLivArea" value={imovel.GrLivArea} onChange={handleChange} placeholder="Ex: 150" required />
            </div>

            <div className="campo-linha">
              <div className="campo-form">
                <label>Quartos:</label>
                <input type="number" name="BedroomAbvGr" value={imovel.BedroomAbvGr} onChange={handleChange} placeholder="Ex: 3" required />
              </div>
              <div className="campo-form">
                <label>Banheiros:</label>
                <input type="number" name="FullBath" value={imovel.FullBath} onChange={handleChange} placeholder="Ex: 2" required />
              </div>
            </div>

            <div className="campo-linha">
              <div className="campo-form">
                <label>Cozinhas:</label>
                <input type="number" name="KitchenAbvGr" value={imovel.KitchenAbvGr} onChange={handleChange} placeholder="Ex: 1" required />
              </div>
              <div className="campo-form">
                <label>Vagas (Carros):</label>
                <input type="number" name="GarageCars" value={imovel.GarageCars} onChange={handleChange} placeholder="Ex: 2" required />
              </div>
            </div>

            <div className="campo-form">
              <label>Ano de Construção:</label>
              <input type="number" name="YearBuilt" value={imovel.YearBuilt} onChange={handleChange} placeholder="Ex: 2010" required />
            </div>

            <button type="submit" disabled={carregando} className="btn-avaliar">
              {carregando ? "Calculando..." : "Avaliar Preço"}
            </button>
          </form>

          {preco && (
            <div className="resultado-preco">
              <h3>Valor Estimado:</h3>
              <p className="valor-destaque">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco)}
              </p>
            </div>
          )}
        </section>

        <section className="card">
          <h2>2. Consultor IA</h2>
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
              placeholder="Digite sua dúvida..." 
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