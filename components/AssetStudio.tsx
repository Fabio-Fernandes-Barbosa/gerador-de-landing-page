import React, { useState } from 'react';
import { generateHighQualityImage, generateVeoVideo } from '../services/geminiService';
import { GeneratedAsset, LoadingState } from '../types';

const AssetStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(LoadingState.LOADING);

    try {
      let url = '';
      if (mode === 'image') {
        url = await generateHighQualityImage(prompt, imgSize, aspectRatio);
      } else {
        // Veo Check for Key Selection
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
             await window.aistudio.openSelectKey();
             // We proceed assuming user selected it
        }
        // Veo only supports 16:9 or 9:16
        const veoAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
        url = await generateVeoVideo(prompt, veoAspect);
      }

      setAssets(prev => [{ type: mode, url, prompt }, ...prev]);
      setLoading(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setLoading(LoadingState.ERROR);
      if (mode === 'video' && (e as any).message?.includes("Requested entity was not found")) {
         if(window.aistudio) window.aistudio.openSelectKey();
      }
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
        <div className="bg-dark-800 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-brand-500">
                    {mode === 'image' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    )}
                </span>
                Estúdio de Ativos
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <button onClick={() => setMode('image')} className={`p-3 rounded-lg border text-sm font-medium ${mode === 'image' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-900 border-white/10 text-slate-400 hover:bg-dark-700'}`}>
                    Imagem (Imagen 3 / Pro)
                </button>
                <button onClick={() => setMode('video')} className={`p-3 rounded-lg border text-sm font-medium ${mode === 'video' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-900 border-white/10 text-slate-400 hover:bg-dark-700'}`}>
                    Vídeo (Veo)
                </button>
            </div>

            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'image' ? "Descreva a imagem (ex: 'Dashboard SaaS moderno na tela de um laptop, 4k, fotorealista')" : "Descreva o vídeo (ex: 'Drone cinematográfico sobrevoando cidade futurista, pôr do sol')"}
                className="w-full bg-dark-950 border border-white/10 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[100px] mb-4"
            />

            <div className="flex gap-4 mb-4">
                 <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="bg-dark-950 border border-white/10 rounded-lg p-2 text-sm text-slate-300">
                    <option value="16:9">16:9 (Paisagem)</option>
                    <option value="9:16">9:16 (Retrato)</option>
                    <option value="1:1">1:1 (Quadrado)</option>
                    <option value="4:3">4:3</option>
                 </select>

                 {mode === 'image' && (
                     <select value={imgSize} onChange={(e) => setImgSize(e.target.value as any)} className="bg-dark-950 border border-white/10 rounded-lg p-2 text-sm text-slate-300">
                        <option value="1K">Res 1K</option>
                        <option value="2K">Res 2K</option>
                        <option value="4K">Res 4K</option>
                     </select>
                 )}
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading === LoadingState.LOADING || !prompt}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
            >
                {loading === LoadingState.LOADING ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Gerando... {mode === 'video' ? '(Aguarde até 1min)' : ''}
                    </span>
                ) : 'Gerar Ativo'}
            </button>
            
            {loading === LoadingState.ERROR && <p className="text-red-400 text-sm mt-2">Falha na geração. Tente novamente.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset, i) => (
                <div key={i} className="bg-dark-800 rounded-lg overflow-hidden border border-white/10 group relative">
                    {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.prompt} className="w-full h-auto object-cover" />
                    ) : (
                        <video src={asset.url} controls className="w-full h-auto" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-xs text-white line-clamp-2">{asset.prompt}</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white uppercase font-bold backdrop-blur-sm">
                        {asset.type === 'image' ? 'IMAGEM' : 'VÍDEO'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AssetStudio;