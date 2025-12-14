import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage } from "@google/genai";
import { LandingPageConfig, LandingPageData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Constructs a detailed "Mega Prompt" based on user inputs.
 */
export const buildDetailedPrompt = (config: LandingPageConfig): string => {
  return `
ATUE COMO: Desenvolvedor Web Especialista & Copywriter de Conversão.

TAREFA: Criar uma Landing Page HTML5 de arquivo único (com CSS interno) para um negócio no nicho "${config.niche}".

IDIOMA DO CONTEÚDO: Português do Brasil (PT-BR).

DETALHES DO NEGÓCIO:
- Nome: ${config.businessName}
- Público-Alvo: ${config.targetAudience}
- Objetivo Principal: ${config.goal}
- Oferta Principal: ${config.offer}
- Diferenciais Chave: ${config.differentiators}
- Chamada para Ação (CTA): ${config.cta}

REQUISITOS TÉCNICOS:
1. ESTRUTURA:
   - Cabeçalho (Logo + Navegação)
   - Seção Hero (Título de alto impacto, subtítulo, CTA)
   - Seção de Benefícios/Recursos (Layout em Grid)
   - Prova Social/Depoimentos (Marcadores de confiança)
   - Seção Sobre/Diferenciais
   - Seção FAQ (Perguntas Frequentes)
   - Seção Final de CTA
   - Rodapé (Footer)

2. DESIGN & CÓDIGO:
   - Use HTML5 semântico.
   - Use CSS3 moderno (Flexbox e Grid).
   - Totalmente Responsivo (Abordagem Mobile-first).
   - Estilo Visual: Profissional, limpo e adaptado à estética de "${config.niche}".
   - Inclua estados de hover e comportamento de rolagem suave (smooth scroll).
   - Use fontes do sistema ou importe uma Google Font via CDN.
   - Use FontAwesome (CDN) para ícones.
   - SEM arquivos CSS externos. Coloque todos os estilos dentro de tags <style>.
   - SEM arquivos JS externos a menos que estritamente necessário (mantenha simples).

3. COPYWRITING (TEXTO):
   - Escreva um texto persuasivo e orientado para vendas com base na "Oferta Principal" e "Público-Alvo".
   - Os títulos devem ser impactantes (punchy).
   - Todo o texto deve estar em Português do Brasil.

FORMATO DE SAÍDA:
- Retorne APENAS o código HTML bruto.
- Não envolva em blocos de código markdown (como \`\`\`html).
- Não adicione texto de conversação antes ou depois do código.
`.trim();
};

/**
 * Generates the Raw HTML code for the Landing Page.
 */
export const generateLandingPageHtml = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      // We want raw text/code, not JSON schema this time
      responseMimeType: "text/plain", 
    },
  });

  let text = response.text || "";
  
  // Cleanup markdown if the model adds it despite instructions
  text = text.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
  
  return text;
};

/**
 * Generates a high-quality image using gemini-3-pro-image-preview.
 */
export const generateHighQualityImage = async (prompt: string, size: '1K' | '2K' | '4K', aspectRatio: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio, 
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Nenhuma imagem gerada");
};

/**
 * Generates a video using Veo 3.1.
 */
export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Falha na geração de vídeo");

  const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

/**
 * Live API connection helper
 */
export const connectToLiveSession = async (
    onAudioData: (base64: string) => void,
    onTranscription: (user: string, model: string) => void
  ) => {
  
    return await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => console.log('Live Session Opened'),
        onmessage: (message: LiveServerMessage) => {
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) onAudioData(audioData);
        },
        onclose: () => console.log('Live Session Closed'),
        onerror: (err) => console.error('Live Session Error', err),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: "Você é um diretor criativo e consultor web especialista ajudando um usuário a ter ideias para landing pages. Seja conciso, entusiasmado e fale sempre em Português do Brasil.",
      }
    });
  };