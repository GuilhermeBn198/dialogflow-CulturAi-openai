require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

// Endpoint para receber webhooks do Dialogflow
app.post('/webhook', async (req, res) => {
  try {
    const dialogflowRequest = req.body;
    console.log(dialogflowRequest)
    const userInput = dialogflowRequest.queryResult.parameters.text;
    console.log(userInput);

    // Defina a LLM a ser usada (OpenAI ou Gemini)
    const aiChoice = 'openai'; // ou 'gemini', conforme preferir

    let aiResponse;
    if (aiChoice === 'openai') {
      aiResponse = await getResponseFromOpenAI(userInput);
    } else {
      aiResponse = await getResponseFromGemini(userInput);
    }

    const responseToDialogflow = {
      fulfillmentText: aiResponse,
    };

    return res.json(responseToDialogflow);
  } catch (error) {
    console.error('Erro ao processar o webhook:', error);
    return res.status(500).send('Erro ao processar a solicitação.');
  }
});

// Função para obter resposta da OpenAI
async function getResponseFromOpenAI(prompt) {
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';
  const response = await axios.post(
    openaiUrl,
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content;
}

// Função para obter resposta do Gemini (caso disponível)
async function getResponseFromGemini(prompt) {
  // Defina a URL e a lógica do Gemini se houver uma API
  const geminiUrl = 'https://api.gemini.com/v1/...'; // Exemplo de endpoint
  const response = await axios.post(
    geminiUrl,
    { prompt: prompt },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiApiKey}`,
      },
    }
  );
  return response.data.output; // Defina a estrutura correta da resposta
}


// // Configurar as opções HTTPS, incluindo o certificado e a chave privada
// const httpsOptions = {
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert'),
// };

// // Iniciar o servidor HTTPS
// https.createServer(httpsOptions, app).listen(3000, () => {
//   console.log('Servidor rodando em HTTPS na porta 3000');
// });


// Iniciar o servidor HTTP
app.listen(3000, () => {
  console.log('Servidor rodando em HTTP na porta 3000');
});