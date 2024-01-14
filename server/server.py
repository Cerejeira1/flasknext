from flask import Flask, jsonify
from flask_cors import CORS
from langchain.document_loaders import YoutubeLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import OpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.vectorstores import FAISS 
from dotenv import load_dotenv

load_dotenv()

embeddings = OpenAIEmbeddings()


def create_vector_db_from_youtube_url(video_url: str) -> FAISS:
    loader = YoutubeLoader.from_youtube_url(video_url)
    transcript = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(transcript)
    
    db = FAISS.from_documents(docs, embeddings)
    return db

def get_response_from_query(db, query, k=4):
    # 4097
    
    docs = db.similarity_search(query, k=k)
    docs_page_content = " ".join([d.page_content for d in docs])
    
    llm = OpenAI(model="text-davinci-003")
    prompt = PromptTemplate(
        input_variables=["question", "docs"],
        template="""You are a helpful YouTube assistant that can awnser questions about videos based on the video's transcript.input_types=
        
        Answer the following question: {question}
        By searching the following video transcript: {docs}
        
        Only use the factual information from the transcript to awnser the question. 
        
        If you feel like you don't have enough information to awnser the question, say "I don't have sufficient information on that topic in order to awnser that with confidence". 
        
        Your awnsers should be detailed. 
        
        """)
    chain = LLMChain(llm = llm, prompt=prompt)
    response = chain.run(question = query, docs = docs_page_content)
    response = response.replace("\n", "")
    return response

app = Flask(__name__)
CORS(app)

@app.route("/api/home", methods=["GET"])
def return_home():
    return jsonify({
        "message": "Hello Everyone!",
        "people": ["Tiago", "João", "Dingle"]
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)
