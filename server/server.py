from flask import Flask, jsonify
from flask_cors import CORS
from langchain.document_loaders import YoutubeLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import sys
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_transcript_from_youtube_url() -> str:
    loader = YoutubeLoader.from_youtube_url("https://youtu.be/uLsAhwJzQoI?si=G0uzqHhtYxiqWLJS")
    transcript = loader.load()
    return transcript

def get_response_from_transcript(transcript, query):
    llm = OpenAI(temperature=1)
    prompt = PromptTemplate(
        input_variables=["question", "transcript"],
        template="""You are a helpful YouTube assistant that can answer questions about videos based on the video's transcript.

        Answer the following question: {question}
        By searching the following video transcript: {transcript}

        Only use the factual information from the transcript to answer the question. 
        
        If you feel like you don't have enough information to answer the question, say "I don't have sufficient information on that topic in order to answer that with confidence". 
        
        Your answers should be detailed."""
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    response = chain.run(question=query, transcript=transcript)
    response = response.replace("\n", "")
    return response

@app.route("/api/home", methods=["GET"])
def return_home():
    question = "What is capitalism in 1 simple sentence?"
    transcript = get_transcript_from_youtube_url()
    response = get_response_from_transcript(transcript, question)
    print(response)
    return jsonify({
        "message": response
    })
    

if __name__ == "__main__":
    app.run(debug=True, port=8080)
