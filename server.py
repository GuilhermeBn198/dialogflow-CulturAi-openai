from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

OPENAI_API_KEY = 'YOUR_API_KEY'
GPT_API_URL = 'https://api.openai.com/v1/chat/completions'

@app.route('/webhook', methods=['POST'])
def webhook():
    req = request.get_json(silent=True, force=True)
    user_input = req['queryResult']['parameters']['text']
    
    # Montando o payload para a API do GPT
    payload = {
        "model": "gpt-3.5-turbo",  # ou o modelo que você deseja usar
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 2048
    }
    
    # Chamando a API do GPT
    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(GPT_API_URL, json=payload, headers=headers)
        response.raise_for_status()  # Lança um erro para status não 2xx
        gpt_response = response.json()['choices'][0]['message']['content']
        
        # Retornando a resposta ao Dialogflow
        return jsonify({'fulfillmentText': gpt_response})
    
    except Exception as e:
        print(e)
        return jsonify({'fulfillmentText': 'Ocorreu um erro ao processar sua solicitação.'})

if __name__ == '__main__':
    app.run(port=8080)
