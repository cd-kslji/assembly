from flask import Flask, request, jsonify
import assemblyai as aai

aai.settings.api_key = "81fe67d2461b426694a8cc7d68bd355a"
transcriber = aai.Transcriber()

app = Flask(__name__)

@app.route("/user", methods=["PUT"])
def getUserAudio():
    try:
        data = request.get_json()
        if data is None or 'user' not in data:
            return jsonify({"error": "Invalid JSON or missing 'user' field"}), 400
        
        transcript = transcriber.transcribe(data.get('user'))
        return jsonify({"transcript": transcript.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)