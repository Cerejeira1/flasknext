# Código do Vasco 

import pinecone
import os
from flask import Flask, jsonify, request, Response, stream_with_context
from flask_cors import CORS
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Pinecone
import json
from openai import OpenAI
from IPython.display import clear_output

import json
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_env = os.getenv("PINECONE_ENV")
openai_key = os.getenv("OPENAI_API_KEY")

pinecone.init(
    api_key=pinecone_api_key, 
    environment=pinecone_env
)

embeddings = OpenAIEmbeddings()


def queryToTopicPerParty(prompt, convo):
    
    firstRowSystemRole =  "O teu objetivo é identificar os partidos políticos e tópicos gerais (ex: Educação, Saúde, etc) explicitamente mencionados na pergunta do utilizador."
    
    if(convo is not None):
        firstRowSystemRole =  "O teu objetivo é identificar os partidos políticos e os tópicos gerais (ex: Educação, Saúde, etc) explicitamente mencionados só na pergunta atual do utilizador, tendo em conta a lógica das perguntas anteriores. Isto é, a identificação é sobre a pergunta atual do utilizador, mas os tópicos gerais presentes na pergunta atual do utilizador podem só fazer sentido se forem consideradas as perguntas anteriores."
        prompt = "Pergunta atual do utilizador: \n " + prompt + "\n Perguntas anteriores: " + str([x["content"] for x in convo if x["role"] == "user"])            
          
    systemRole = f'''
    ###MISSION###

    {firstRowSystemRole}

    Deves determinar cada trecho exata da pergunta que corresponde a cada tópico geral e os partidos políticos que estão relacionados com o trecho. Ou seja, encontrar um trecho da pergunta para cada tópico geral diferente e para cada partido político mencionado na pergunta.
        
    Por exemplo, se a pergunta mencionar os tópicos gerais 'educação' e 'saúde' e os partidos 'PS (Partido Socialista)' e 'BE (Bloco de Esquerda)', deves identificar trechos da pergunta relacionados a 'educação' para cada partido mencionado e trechos relacionados a 'saúde' para cada partido mencionado.
        
    Por fim, para cada trecho de pergunta, junta ao trecho de pergunta uma lista de sinónimos das palavras mais relevantes do trecho de modo a melhorar uma similarity search. Por exemplo, se um trecho incluir 'educação', acrescenta à frente desse trecho 'escola','aluno', 'professor'.

    Os partidos possíveis são:
     - PSD (Partido Social Democrata)
     - IL (Iniciativa Liberal)
     - PS (Partido Socialista)
     - Chega
     - BE (Bloco de Esquerda, Bloco)
     - CDS (Partido do Centro Democrático Social)
     - PAN (Partido dos Animais e da Natureza)
     - Livre
     - PCP (Partido Comunista Português)
        
    Se a pergunta for dirigida a todos os partidos, identifica apenas 1 partido: 'Todos'.'''

    outPut = (
    "# Output\n"
    " Tu **tens** que responder num json válido no seguinte formato:\n"
    "{\n"
    '    "partido1": [excerto 1 ... excerto n],\n'
    '    "partido2": [excerto 1 ... excerto n]\n'
    "}\n"
    )

    systemRole += outPut    

    #ree, thisCost = gpt(prompt, temp = 0.1, mod = "gpt-3.5-turbo", systemRole = systemRole)
    ree, thisCost = gpt(prompt, temp = 0.1, mod = "gpt-4", systemRole = systemRole)
    
    try:
        js = json.loads(ree)
        js = fixJSPartyNames(js)
        return js, thisCost
    except:
        r = dict()
        r["info"] = ree
        return r, thisCost
    
    
def gpt(text, temp = 1.0, mod = "gpt-3.5-turbo", systemRole = "You are a helpful assistant."):
    
    client = OpenAI()

    response = client.chat.completions.create(
      model= mod,
      temperature = temp,
      messages=[
        {"role": "system", "content": systemRole},

        {"role": "user", "content": text}
      ],
    )
    
    return response.choices[0].message.content, response.usage.prompt_tokens * 0.0010/1000 + response.usage.completion_tokens * 0.0020/1000



def fixJSPartyNames(js):
    
    partidosGlobal = ['PSD', 'IL', 'PS', 'Chega', 'BE', 'PAN', 'Livre']

    for key in js:
        if(key in partidosGlobal):
            continue
        
        
        if("todos" in key.lower() or "diferente" in key.lower()):
            js["Todos"] = js[key]

        elif("iniciativa liberal" in key.lower()):
            js["IL"] = js[key]

        elif("chega" in key.lower()):
            js["Chega"] = js[key]

        elif("social democrata" in key.lower()):
            js["PSD"] = js[key]

        elif("bloco" in key.lower()):
            js["BE"] = js[key]

        elif("socialista" in key.lower()):
            js["PS"] = js[key]

        elif("livre" in key.lower()):
            js["Livre"] = js[key]

        elif("animais" in key.lower() or "natureza" in key.lower()):
            js["PAN"] = js[key]

        else:
            print("\n\nUnrecognized party: " + key)

        del js[key]
    
    return js



def getDocsPineCone(js, k, size):
    docsearch = Pinecone.from_existing_index("bot-politico", embeddings)
    
    docs = list()

    for party in js:
        for topic in js[party]:
            docs += docsearch.max_marginal_relevance_search(topic, k = k, fetch_k = k * 5, lambda_mult = 0.5, filter = {'partido': party.strip(), 'Size': size})
            #docs += dbs[party].similarity_search(topic, k=k) 
            
    return docs





def jsToContext(js):
    
    if("info" in js.keys()):
        return js["info"]

    partidosGlobal = ['PSD', 'IL', 'PS', 'Chega', 'BE', 'PAN', 'Livre']
    
    partidos = list(js.keys())
    context = ""

    # IF -> Se pergunta não é sobre todos os partidos:
    if(not (len(partidos) == len(partidosGlobal) or len([x for x in ["todos","diferente"] if x in "".join(partidos).lower()]) > 0)):

        countContextos = sum([len(x) for x in list(js.values())]) # número de combinações partido/tema presentes na query

        if(countContextos == 1):
            docs = getDocsPineCone(js, 16, 1200) #5714
            context = docsToContext(docs)
        elif(countContextos == 2):
            docs = getDocsPineCone(js, 8, 1200) #5714
            context = docsToContext(docs)
        elif(countContextos == 3):
            docs = getDocsPineCone(js, 5, 1200)
            context = docsToContext(docs)
        elif(countContextos <= 4):
            docs = getDocsPineCone(js, 4, 1200)
            context = docsToContext(docs)

        elif(countContextos >= 5):
            print("Demasiados temas na pergunta")

    #ELSE -> Se pergunta é sobre todos os partidos:
    else:
        # atenção ao caso de ser sobre todos e ainda haver uma pergunta sobre um específico
        partyTodos = [x for x in partidos if len(set(x.lower().split(" ")).intersection(["todos","diferente"])) > 0][0]

        jss = dict()
        for el in partidosGlobal:
            jss[el] = js[partyTodos]
        js = jss

        countContextos = sum([len(x) for x in list(js.values())]) # número de combinações partido/tema presentes na query
        docs = getDocsPineCone(js, 2, 1200)
        #docs = getDocs(dbs = dbsM, js = js, k = 4)
        
        context = docsToContext(docs)
        
    return context


def docsToContext(docs, context = None):
    
    if(context is None):
        context = dict()
    else:
        context = json.loads(context)

    for d in docs:
        party = d.metadata["partido"]
        key = "Extraido do programa eleitoral do partido'" + party + "'"


        if(key not in context):
            context[key] = ""

        context[key] += "\n" + d.page_content

    return json.dumps(context)



def wrapGetResponseFromTopicDirect(prompt, context, convo):
    
    if(convo is None):
        convo = [{"role": "system", "content": "definido mais à frente"}, 
                 {"role": "user", "content": prompt}]
    else:
        convo += [{"role": "user", "content": prompt}]
        
    answer = ""
    for c in getResponseFromTopicDirect(prompt, context, convo):
        if(type(c.choices[0].delta.content) != str):
            break
        answer += c.choices[0].delta.content
        print(answer, end = "\r", flush = True)
        clear_output(wait=True)
    
    convo += [{"role": "assistant", "content": answer}]
    
    return convo





def getResponseFromTopicDirect(query, context, convo):
    #    Caso os excertos não incluam informações relevantes para responder à pergunta, não os utilizes para responder à pergunta.
    
    wholePrompt = f'''

    Human:
    <context>
    {context}
    </context>
    
    ###MISSION###

    Tu és um assistente que consegue ajudar a responder e comparar assuntos presentes no programa eleitoral dos partidos para as eleições legislativas portuguesas de 2024.
    
    Para te ajudar a responder às perguntas dos utilizadores, fornecemos-lhe informações contextuais relevantes para a pergunta do utilizador dentro das tags <context>. Utiliza apenas estas informações para responder à pergunta.
                    
    Eis algumas regras importantes que deve seguir:
    <regras>
    <regra>Caso a pergunta do utilizador não esteja relacionada com as eleições legislativas, responde a dizer que só podes responder a perguntas relacionadas com as eleições legislativas.</regra>
    <regra>Usa apenas informação factual e sê democratico sem tomar qualquer identidade política.</regra>
    <regra>Não menciones teres acesso a excertos dos programas eleitorais.</regra>
    <regra>As respostas devem ser extensas e detalhadas.</regra>
    <regra>As respostas devem estar escritas em português euroepeu. Trate os utilizadores por você.</regra>
    <regra>Responde em bullet points.</regra>
    </regras>
    '''  
    
    convo[0]["content"] = wholePrompt
    
    #Responde à pergunta: {query}
    #Com base **apenas** nos seguintes excertos dos programas eleitorais: {context}

    client = OpenAI()

    for chunk in client.chat.completions.create(
      model= "gpt-3.5-turbo-16k",
      temperature = 0.5,
      max_tokens = 2048,
      messages= convo,
    stream = True):
        yield chunk
        
    return 


def getResponseFromTopicDirectNoStream(query, context, convo):
    #    Caso os excertos não incluam informações relevantes para responder à pergunta, não os utilizes para responder à pergunta.
    
    wholePrompt = f'''

    Human:
    <context>
    {context}
    </context>
    
    ###MISSION###

    Tu és um assistente que consegue ajudar a responder e comparar assuntos presentes no programa eleitoral dos partidos para as eleições legislativas portuguesas de 2024.
    
    Para te ajudar a responder às perguntas dos utilizadores, fornecemos-lhe informações contextuais relevantes para a pergunta do utilizador dentro das tags <context>. Utiliza apenas estas informações para responder à pergunta.
                    
    Eis algumas regras importantes que deve seguir:
    <regras>
    <regra>Caso a pergunta do utilizador não esteja relacionada com as eleições legislativas, responde a dizer que só podes responder a perguntas relacionadas com as eleições legislativas.</regra>
    <regra>Usa apenas informação factual e sê democratico sem tomar qualquer identidade política.</regra>
    <regra>Não menciones teres acesso a excertos dos programas eleitorais.</regra>
    <regra>As respostas devem ser extensas e detalhadas.</regra>
    <regra>As respostas devem estar escritas em português euroepeu. Trate os utilizadores por você.</regra>
    <regra>Responde em bullet points.</regra>
    </regras>
    '''  
    
    convo[0]["content"] = wholePrompt
    
    #Responde à pergunta: {query}
    #Com base **apenas** nos seguintes excertos dos programas eleitorais: {context}

    client = OpenAI()

    ree = client.chat.completions.create(
      model= "gpt-3.5-turbo-16k",
      temperature = 0.5,
      max_tokens = 2048,
      messages= convo,
    stream = False)
        
    answer_content = ree.choices[0].message.content if ree.choices else ""
    
    return answer_content
    #return ree.choices[0].delta.content
    
#{"role": "assistant", "content": "Put here assistant reply"},



# prompt = "como é que se contrastam as poisções do PS e do PSD em relação à educação"
# convo = None
# js, cost = queryToTopicPerParty(prompt, convo)
# context = jsToContext(js)

# convo = wrapGetResponseFromTopicDirect(prompt, context, convo)



# prompt = "e o Chega?"

# js, cost = queryToTopicPerParty(prompt, convo)
# context = jsToContext(js)
# print(js)
# if(convo is None):
        #convo = [{"role": "system", "content": "definido mais à frente"}, 
                 #{"role": "user", "content": prompt}]
# else:
    #convo += [{"role": "user", "content": prompt}]

# answer = getResponseFromTopicDirectNoStream(prompt, context, convo)

# convo += [{"role": "assistant", "content": answer}]


@app.route("/api", methods=["POST"])
def return_home():
    data = request.get_json()
    prompt = data.get('question', "Default question if not provided")
    convo = data.get('convo', [{"role": "system", "content": "definido mais à frente"}])

    convo.append({"role": "user", "content": prompt})
    print(prompt, convo)
    js, cost = queryToTopicPerParty(prompt, convo)
    context = jsToContext(js)

    def generate():
        for chunk in getResponseFromTopicDirect(prompt, context, convo):
            if chunk and chunk.choices[0] and type(chunk.choices[0].delta.content) == str:
                # Assuming chunk.message.content contains the string to be sent
                response_text = chunk.choices[0].delta.content
                yield response_text.encode('utf-8')  # Encode the string to bytes
            else:
                yield b""  # Yield empty bytes if there's no data
    response = Response(stream_with_context(generate()), content_type='application/json')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

if __name__ == "__main__":
    app.run(debug=False, port=8080)
