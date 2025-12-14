import React, { useState, useEffect } from 'react';
import { buildDetailedPrompt, generateLandingPageHtml } from './services/geminiService';
import { LandingPageConfig, LoadingState, Tab } from './types';
import AssetStudio from './components/AssetStudio';
import LiveBrainstorm from './components/LiveBrainstorm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERATOR);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [darkMode, setDarkMode] = useState(true);

  // Form State
  const [config, setConfig] = useState<LandingPageConfig>({
    niche: 'Academia & Fitness',
    businessName: '',
    targetAudience: '',
    goal: 'Geração de Leads',
    offer: '',
    differentiators: '',
    cta: 'Começar Teste Grátis',
  });

  // Generation State
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.add('bg-dark-950');
      document.body.classList.remove('bg-gray-50');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('bg-dark-950');
      document.body.classList.add('bg-gray-50');
    }
  }, [darkMode]);

  const handleInputChange = (field: keyof LandingPageConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePrompt = () => {
    const prompt = buildDetailedPrompt(config);
    setGeneratedPrompt(prompt);
    setActiveTab(Tab.PROMPT_REVIEW);
  };

  const handleGenerateCode = async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      // Use the prompt currently in the textarea (in case user edited it)
      const code = await generateLandingPageHtml(generatedPrompt);
      setGeneratedCode(code);
      setLoadingState(LoadingState.SUCCESS);
      setActiveTab(Tab.PREVIEW);
    } catch (e) {
      console.error(e);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.GENERATOR:
        return (
          <div className="max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Defina Sua Landing Page</h1>
                <p className="text-gray-500 dark:text-slate-400">Preencha os detalhes estratégicos para gerar uma página de alta conversão.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nicho de Atuação</label>
                    <select 
                      value={config.niche}
                      onChange={(e) => handleInputChange('niche', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option>Academia & Fitness</option>
                      <option>Clínica Médica</option>
                      <option>Restaurante / Bistrô</option>
                      <option>Imobiliária</option>
                      <option>Serviços Jurídicos</option>
                      <option>SaaS / Tech</option>
                      <option>E-commerce</option>
                      <option>Consultoria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome do Negócio</label>
                    <input 
                      type="text" 
                      value={config.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="ex: Academia IronLift"
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Público-Alvo</label>
                    <input 
                      type="text" 
                      value={config.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      placeholder="ex: Profissionais ocupados entre 25-40 anos"
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Objetivo da Página</label>
                    <select 
                      value={config.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option>Geração de Leads (Formulário)</option>
                      <option>Venda Direta (Checkout)</option>
                      <option>Agendamento</option>
                      <option>Download de App</option>
                      <option>Reconhecimento de Marca</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Oferta Principal</label>
                    <textarea 
                      value={config.offer}
                      onChange={(e) => handleInputChange('offer', e.target.value)}
                      placeholder="ex: Passe Livre de 7 Dias + Sessão com Personal Trainer"
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Diferenciais Chave</label>
                    <textarea 
                      value={config.differentiators}
                      onChange={(e) => handleInputChange('differentiators', e.target.value)}
                      placeholder="ex: Aberto 24h, Nutricionistas Certificados, Sauna"
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Texto do Botão (CTA)</label>
                    <input 
                      type="text" 
                      value={config.cta}
                      onChange={(e) => handleInputChange('cta', e.target.value)}
                      placeholder="ex: Começar Agora"
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
                <button 
                  onClick={handleGeneratePrompt}
                  disabled={!config.businessName}
                  className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo: Gerar Prompt 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        );

      case Tab.PROMPT_REVIEW:
        return (
          <div className="max-w-4xl mx-auto p-4 h-full flex flex-col">
             <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revisar Prompt Gerado</h2>
                  <div className="flex gap-2">
                     <button onClick={() => setActiveTab(Tab.GENERATOR)} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-3 py-1">Voltar e Editar</button>
                     <button onClick={() => copyToClipboard(generatedPrompt)} className="px-3 py-1 bg-gray-100 dark:bg-dark-900 rounded border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-dark-700">Copiar Prompt</button>
                  </div>
                </div>
                
                <div className="flex-1 relative mb-6">
                  <textarea 
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-full bg-gray-50 dark:bg-dark-950 border border-gray-300 dark:border-white/10 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-4">
                   <button 
                      onClick={handleGenerateCode}
                      disabled={loadingState === LoadingState.LOADING}
                      className="w-full md:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loadingState === LoadingState.LOADING ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Gerando Código...
                        </>
                      ) : (
                        <>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                           Gerar Código & Preview
                        </>
                      )}
                    </button>
                </div>
             </div>
          </div>
        );

      case Tab.PREVIEW:
        return (
          <div className="h-full flex flex-col">
             <div className="px-6 py-3 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                   <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Modo Preview</div>
                   <div className="h-4 w-px bg-gray-300 dark:bg-white/10"></div>
                   <button 
                     onClick={() => setShowCode(!showCode)}
                     className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${showCode ? 'bg-brand-100 dark:bg-brand-900/30 border-brand-500 text-brand-600 dark:text-brand-400' : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-slate-400'}`}
                   >
                     {showCode ? 'Ocultar Código' : 'Ver Código Fonte'}
                   </button>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setActiveTab(Tab.GENERATOR)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Nova Página</button>
                   <button onClick={() => setActiveTab(Tab.PROMPT_REVIEW)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Refinar Prompt</button>
                </div>
             </div>

             <div className="flex-1 relative flex overflow-hidden bg-gray-100 dark:bg-black">
                {showCode ? (
                   <div className="w-full h-full p-4 overflow-auto">
                      <pre className="bg-dark-950 text-slate-300 p-6 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto shadow-inner h-full">
                        {generatedCode}
                      </pre>
                   </div>
                ) : (
                   <div className="w-full h-full flex items-center justify-center p-4">
                      <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-white/5">
                        <iframe 
                          srcDoc={generatedCode}
                          title="Preview"
                          className="w-full h-full"
                          sandbox="allow-scripts"
                        />
                      </div>
                   </div>
                )}
             </div>
          </div>
        );

      case Tab.ASSETS:
        return <div className="p-8"><AssetStudio /></div>;
      
      case Tab.VOICE:
        return <div className="p-8"><LiveBrainstorm /></div>;

      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen font-sans selection:bg-brand-500/30 ${darkMode ? 'dark text-slate-200' : 'text-gray-900'}`}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-dark-900 flex flex-col hidden md:flex z-20 transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-lg text-white">L</span>
                    </div>
                    LandoGen
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                <button 
                    onClick={() => setActiveTab(Tab.GENERATOR)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.GENERATOR || activeTab === Tab.PROMPT_REVIEW || activeTab === Tab.PREVIEW ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Gerador de Páginas
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.ASSETS)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.ASSETS ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Estúdio de Ativos
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.VOICE)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.VOICE ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    Brainstorm ao Vivo
                </button>
            </nav>

             <div className="p-4 border-t border-gray-200 dark:border-white/5">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <span>{darkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
                  {darkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  )}
                </button>
            </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/5 z-20 p-4 flex justify-between items-center">
             <div className="font-bold text-gray-900 dark:text-white">LandoGen</div>
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-100 dark:bg-white/5 rounded">
                {darkMode ? '🌙' : '☀️'}
             </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden flex flex-col pt-16 md:pt-0 bg-gray-50 dark:bg-dark-950 transition-colors duration-300">
             <div className="flex-1 overflow-auto relative">
                 {renderContent()}
             </div>
        </main>
    </div>
  );
};

export default App;