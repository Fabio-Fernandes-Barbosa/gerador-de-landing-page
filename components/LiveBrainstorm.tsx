import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Audio util functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  // Custom simple blob structure for the SDK
  let binary = '';
  const len = int16.buffer.byteLength;
  const bytes = new Uint8Array(int16.buffer);
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}


const LiveBrainstorm: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Clique em Iniciar para brainstorm de ideias por voz");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const startSession = async () => {
    setActive(true);
    setStatus("Conectando...");

    try {
      const apiKey = process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      let nextStartTime = 0;
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                setStatus("Conectado! Pode falar.");
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    if(!activeRef.current) {
                        scriptProcessor.disconnect();
                        source.disconnect();
                        return;
                    }
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };

                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                     nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                     const audioBuffer = await decodeAudioData(
                         decode(base64Audio),
                         outputAudioContext,
                         24000,
                         1
                     );
                     const source = outputAudioContext.createBufferSource();
                     source.buffer = audioBuffer;
                     source.connect(outputNode);
                     source.start(nextStartTime);
                     nextStartTime = nextStartTime + audioBuffer.duration;
                }
            },
            onclose: () => setStatus("Sessão encerrada"),
            onerror: (err) => setStatus("Erro: " + err),
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "Você é um consultor web especialista ajudando um usuário a ter ideias para landing pages. Seja conciso, entusiasmado e fale sempre em Português do Brasil."
        }
      });
      
    } catch (e) {
        console.error(e);
        setStatus("Falha ao conectar. Verifique as permissões de microfone.");
        setActive(false);
    }
  };

  const stopSession = () => {
      setActive(false);
      setStatus("Sessão finalizada.");
      // In a real app we would properly close the session object, 
      // but simplistic state toggle stops the input stream processing here.
      window.location.reload(); // Hard reset for demo stability
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${active ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-brand-600'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Brainstorm ao Vivo</h2>
      <p className="text-slate-400 mb-8 text-center max-w-md">{status}</p>

      {!active ? (
        <button 
            onClick={startSession}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
            Iniciar Conversa
        </button>
      ) : (
        <button 
            onClick={stopSession}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
        >
            Encerrar Sessão
        </button>
      )}
    </div>
  );
};

export default LiveBrainstorm;