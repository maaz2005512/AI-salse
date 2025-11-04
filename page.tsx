'use client';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const startTranscription = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const ws = new WebSocket('/api/stream');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.text) setTranscript((t) => t + ' ' + data.text);
    };

    ws.onopen = () => {
      source.connect(processor);
      processor.connect(audioContext.destination);
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) int16[i] = input[i] * 0x7fff;
        ws.send(int16);
      };
    };
  };

  return (
    <main className='p-10 text-center'>
      <h1 className='text-2xl font-bold mb-4'>Deepgram Live Transcriber</h1>
      <button onClick={startTranscription} className='bg-blue-500 text-white px-4 py-2 rounded'>
        Start Transcription
      </button>
      <p className='mt-6 whitespace-pre-wrap text-left'>{transcript}</p>
    </main>
  );
}