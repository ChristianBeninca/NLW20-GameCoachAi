const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const askAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    
    let ask = '';

    const askGeneric =
    `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento de jogo, estratégias, builds e dicas.
    
    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual para dar uma resposta coerente.
    - Nunca responda itens dos quais você não tem certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 1000 caracteres.
    - Responda em markdown
    - Não faça saudações ou despedidas 
    
    ## Extrutura de resposta
    - 1º Diga o patch atual e uma frase que defina alguma atualização do mesmo, a fim de confortar o usuário.
    - 2º Responda a pergunta da maneira mais direta e identada possível.

    ---
    Aqui está a pergunta do usuário: ${question}.
    `

        const askOnceHuman =
    `
    ## Especialidade
    Você é um especialista assistente para o jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento de jogo, estratégias, builds e dicas.
    
    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual para dar uma resposta coerente.
    - Nunca responda itens dos quais você não tem certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 1000 caracteres, sendo 200 desses caracteres reservados para informações do patch.
    - Responda em markdown
    - Insira as informações do patch atual de forma destacada, para reixar bem claro que isso não faz parte da pergunta
    - Não faça saudações ou despedidas 
    
    ## Extrutura de resposta
    - 1º Diga o patch atual e um complemento ráido que defina alguma atualização do mesmo, a fim de confortar o usuário.
      ex: O patch atual é a Versão Anual 2.0: Dreamveil, lançada em 2 de julho de 2025, que trouxe o novo cenário PvE "Endless Dream" e o novo sistema de classes.
    - 2º Responda a pergunta da maneira mais direta e identada possível.
      ex: Você tem 2 opções de resposta para a sua pergunta
      - Opção 1: <insira a opção aqui de forma bem identada> 
      - Opção 2: <insira a opção aqui de forma bem identada> 
      
    ---
    Aqui está a pergunta do usuário: ${question}.
    `

    if(game == 'Valorant' || game == 'League of Legends' || game == "Wolrd of Warcraft" || game == 'Counter Strike: Global Offensive 2') {
        ask = askGeneric
    }
    else if(game == 'Once Human'){

    }
    const contents = [{
        role: "user",
        parts: [{
            text: ask
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
            const data = await response.json()
            return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == ''){
        alert('Por favor, preencha todos os campos!')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
        const text = await askAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch(error){
        console.log('Erro: ', error)

    } finally{
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', sendForm)