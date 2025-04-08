// Configuração da API do ChatGPT
const API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Elementos do DOM
document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyze');
  const resultDiv = document.getElementById('result');
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading-spinner';
  loadingSpinner.style.display = 'none';
  document.body.appendChild(loadingSpinner);

  analyzeButton.addEventListener('click', async () => {
    const analysisData = document.getElementById('analysisData').value;

    if (!analysisData.trim()) {
      showError('Por favor, insira os dados para análise.');
      return;
    }

    try {
      setLoading(true);
      const analysis = await performAnalysis(analysisData);
      displayResult(analysis);
    } catch (error) {
      console.error('Erro:', error);
      showError(`Erro na análise: ${error.message}`);
    } finally {
      setLoading(false);
    }
  });
});

function setLoading(isLoading) {
  const analyzeButton = document.getElementById('analyze');
  const loadingSpinner = document.querySelector('.loading-spinner');
  
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? 'Analisando...' : 'Analisar';
  loadingSpinner.style.display = isLoading ? 'block' : 'none';
}

function showError(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="error-message">
      <p style="color: red;">${message}</p>
      <p>Por favor, verifique sua conexão com a internet e tente novamente.</p>
    </div>
  `;
  resultDiv.style.display = 'block';
}

async function performAnalysis(analysisData) {
  try {
    console.log('Iniciando análise...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Você é um analista de AML especializado com certificações ACAMS, PQO Compliance, PQO Cadastro e CPA 20. 
            Sua análise deve ser técnica, precisa e baseada em regulamentações vigentes.
            
            Forneça uma análise estruturada com:
            1. Nível de Risco (ALTO, MÉDIO ou BAIXO)
            2. Indicadores de Risco identificados
            3. Recomendação clara (MANTER ou DESCREDENCIAR)
            4. Justificativa técnica detalhada
            5. Medidas de mitigação sugeridas
            6. Indicação sobre necessidade de reporte ao COAF
            
            Considere especialmente:
            - Incompatibilidade entre renda declarada e movimentações
            - Transações em horários atípicos
            - Histórico de sanções
            - Conexões com empresas de apostas
            - Concentração de transações
            - Documentação inconsistente ou incompleta
            
            Formate sua resposta de forma clara e objetiva, destacando as informações mais importantes.`
          },
          {
            role: "user",
            content: analysisData
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    console.log('Resposta recebida:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API:', errorData);
      
      if (errorData.error?.message.includes('quota')) {
        throw new Error('Limite de uso da API atingido. Por favor, tente novamente mais tarde.');
      } else if (errorData.error?.message.includes('model')) {
        throw new Error('Modelo de IA não disponível. Por favor, tente novamente mais tarde.');
      } else {
        throw new Error(errorData.error?.message || 'Erro na comunicação com a API');
      }
    }

    const data = await response.json();
    console.log('Análise concluída com sucesso');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  }
}

function displayResult(analysis) {
  const resultDiv = document.getElementById('result');
  const formattedAnalysis = analysis.split('\n').map(line => {
    // Adiciona estilo especial para recomendações importantes
    if (line.toLowerCase().includes('recomendação:') || 
        line.toLowerCase().includes('coaf:') || 
        line.toLowerCase().includes('veredicto:') ||
        line.toLowerCase().includes('nível de risco:')) {
      return `<p style="font-weight: bold; color: #2c5282;">${line}</p>`;
    }
    return `<p>${line}</p>`;
  }).join('');
  
  resultDiv.innerHTML = formattedAnalysis;
  resultDiv.style.display = 'block';
} 