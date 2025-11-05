"use client";
import { useState } from "react";

export default function HomePage() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    setIsListening(true);

    // 1️⃣ Get temporary Deepgram session token
    const res = await fetch("/api/token");
    const { key } = await res.json();

    // 2️⃣ Connect to Deepgram WebSocket
    const ws = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=general&smart_format=true`,
      ["token", key]
    );

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      const text = data?.channel?.alternatives?.[0]?.transcript;
      if (text) setTranscript((t) => t + " " + text);
    };

    // 3️⃣ Capture mic and send audio chunks
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const buffer = new ArrayBuffer(input.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      ws.send(buffer);
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Deepgram Live Transcriber</h1>
      {!isListening ? (
        <button
          onClick={startListening}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Transcription
        </button>
      ) : (
        <p className="text-green-600">🎙 Listening...</p>
      )}
      <p className="mt-6 text-left whitespace-pre-wrap">{transcript}</p>
    </main>
  );
}
