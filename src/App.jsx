import { useState } from 'react'
import './App.css'

function App() {
  // 1. ESTADOS (useState): Aqui guardamos os valores. É como criar variáveis let no JS puro, 
  // mas quando essas mudam, o React atualiza a tela automaticamente!
  
  const [imovel, setImovel] = useState({
    OverallQual: 7,
    GrLivArea: 1500,
    GarageCars: 2,
    TotalBsmtSF: 0,
    FullBath: 2,
    YearBuilt: 2003
  });

  const [preco, setPreco] = useState(null); // Guarda o preço vindo da API
  const [pergunta, setPergunta] = useState(""); // Guarda a dúvida do usuário pro chat
  const [respostaIA, setRespostaIA] = useState(""); // Guarda a resposta do Gemini
  const [carregando, setCarregando] = useState(false); // Para mostrar "Carregando..."

  // 2. FUNÇÃO PARA ATUALIZAR OS CAMPOS DO FORMULÁRIO
  const handleChange = (e) => {
    const nomeDoCampo = e.target.name;
    const valorDoCampo = e.target.value;
    // Atualiza apenas o campo que o usuário digitou, mantendo os outros iguais
    setImovel({ ...imovel, [nomeDoCampo]: Number(valorDoCampo) });
  };

  // 3. FUNÇÃO: AVALIAR IMÓVEL (Chama o Back-end)
  const avaliarImovel = async (e) => {
    e.preventDefault(); // Impede a página de recarregar (padrão do HTML)
    setCarregando(true);

    try {
      // Fazendo um POST para o seu FastAPI!
      const resposta = await fetch('http://127.0.0.1:8000/prever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imovel) // Transforma o objeto JS em JSON
      });
      
      const dados = await resposta.json();
      setPreco(dados.preco_estimado); // Salva o preço no "Estado", e a tela mostra!
    } catch (error) {
      alert("Erro ao conectar com a API. O FastAPI está rodando?");
    }
    setCarregando(false);
  };

  // 4. FUNÇÃO: CONSULTAR A IA
  const perguntarIA = async (e) => {
    e.preventDefault();
    if (!preco) return alert("Avalie o imóvel primeiro!");
    
    setRespostaIA("A IA está pensando...");

    try {
      const detalhes = `Casa construída em ${imovel.YearBuilt}, ${imovel.FullBath} banheiros, nota ${imovel.OverallQual}, ${imovel.GarageCars} vagas de garagem.`;
      
      const resposta = await fetch('http://127.0.0.1:8000/consultar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preco_estimado: preco,
          pergunta: pergunta,
          detalhes_imovel: detalhes
        })
      });

      const dados = await resposta.json();
      setRespostaIA(dados.resposta);
    } catch (error) {
      setRespostaIA("Erro ao conectar com a IA.");
    }
  };

  // 5. O VISUAL (O HTML DA TELA)
  return (
    <div className="container">
      <header>
        <h1>🏠 Consultoria Imobiliária com IA</h1>
      </header>

      <main className="layout-duplo">
        {/* LADO ESQUERDO: CALCULADORA */}
        <section className="card">
          <h2>1. Avaliar Imóvel</h2>
          <form onSubmit={avaliarImovel}>
            <label>Nota de Qualidade (1 a 10):</label>
            <input type="number" name="OverallQual" value={imovel.OverallQual} onChange={handleChange} min="1" max="10" />

            <label>Área Construída (em pés²):</label>
            <input type="number" name="GrLivArea" value={imovel.GrLivArea} onChange={handleChange} />

            <label>Vagas de Garagem:</label>
            <input type="number" name="GarageCars" value={imovel.GarageCars} onChange={handleChange} />

            <label>Área do Porão (pés²):</label>
            <input type="number" name="TotalBsmtSF" value={imovel.TotalBsmtSF} onChange={handleChange} />

            <label>Banheiros Completos:</label>
            <input type="number" name="FullBath" value={imovel.FullBath} onChange={handleChange} />

            <label>Ano de Construção:</label>
            <input type="number" name="YearBuilt" value={imovel.YearBuilt} onChange={handleChange} />

            <button type="submit" disabled={carregando}>
              {carregando ? "Calculando..." : "💰 Avaliar Preço"}
            </button>
          </form>

          {/* Se o preço existir, mostra na tela */}
          {preco && (
            <div className="resultado-preco">
              <h3>Valor Estimado:</h3>
              <p className="valor-destaque">US$ {preco.toLocaleString('en-US')}</p>
            </div>
          )}
        </section>

        {/* LADO DIREITO: CHAT IA */}
        <section className="card">
          <h2>2. Consultor IA 🤖</h2>
          <div className="chat-box">
            <p><strong>Dica:</strong> Avalie o imóvel primeiro para que o consultor saiba o preço.</p>
            
            {/* Caixa de resposta da IA */}
            {respostaIA && (
              <div className="mensagem-ia">
                <strong>Corretor IA:</strong>
                <p>{respostaIA}</p>
              </div>
            )}
          </div>

          <form onSubmit={perguntarIA} className="form-chat">
            <input 
              type="text" 
              placeholder="Ex: Vale a pena colocar piso de madeira?" 
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              disabled={!preco} // Desativa o campo se não tiver calculado o preço
            />
            <button type="submit" disabled={!preco}>Enviar</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App