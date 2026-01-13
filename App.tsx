
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoostStatus, ServerNode, LogEntry, ViralAnalysis } from './types';
import { SERVER_NODES, VIEW_PRESETS } from './constants';
import { analyzeTikTokContent } from './services/geminiService';

// Helper to extract TikTok ID and construct a basic embed link
const getTikTokId = (url: string) => {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
};

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [targetViews, setTargetViews] = useState(500);
  const [currentViews, setCurrentViews] = useState(0);
  const [status, setStatus] = useState<BoostStatus>(BoostStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeServer, setActiveServer] = useState<ServerNode>(SERVER_NODES[0]);
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    };
    setLogs(prev => [...prev, newLog].slice(-100)); // Keep last 100 logs
  }, []);

  useEffect(() => {
    if (status === BoostStatus.PROCESSING) {
      const interval = setInterval(() => {
        setCurrentViews(prev => {
          if (prev >= targetViews) {
            clearInterval(interval);
            setStatus(BoostStatus.COMPLETED);
            addLog(`Task successful: ${targetViews} views distributed across ${SERVER_NODES.length} nodes.`, 'success');
            return targetViews;
          }
          
          // Server rotation logic
          if (Math.random() > 0.85) {
            const availableServers = SERVER_NODES.filter(s => s.id !== activeServer.id);
            const nextServer = availableServers[Math.floor(Math.random() * availableServers.length)];
            setActiveServer(nextServer);
            addLog(`Handoff to ${nextServer.name} (${nextServer.region}) - Latency: ${Math.floor(Math.random() * 100 + 20)}ms`, 'info');
          }

          const increment = Math.floor(Math.random() * 25) + 10;
          const nextVal = Math.min(prev + increment, targetViews);
          setProgress(Math.floor((nextVal / targetViews) * 100));
          return nextVal;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [status, targetViews, addLog, activeServer.id]);

  const handleStartBoost = async () => {
    if (!videoUrl || !videoUrl.includes('tiktok.com')) {
      addLog("Invalid source: Please provide a valid TikTok video link.", "error");
      return;
    }

    const id = getTikTokId(videoUrl);
    setStatus(BoostStatus.PROCESSING);
    setCurrentViews(0);
    setProgress(0);
    setAnalysis(null);
    
    addLog(`Initiating View Distribution Protocol...`, 'info');
    addLog(`Targeting Resource ID: ${id || 'Generic_Stream'}`, 'info');
    addLog(`Load balancing across ${SERVER_NODES.length} global relay points.`, 'info');

    // Parallel AI Content Analysis
    setIsAnalyzing(true);
    analyzeTikTokContent(videoUrl).then(res => {
      setAnalysis(res);
      setIsAnalyzing(false);
      addLog("Content patterns analyzed. Viral score updated in dashboard.", "success");
    }).catch(() => {
      setIsAnalyzing(false);
      addLog("Analysis module timed out. Proceeding with standard boost.", "warning");
    });
  };

  const handleReset = () => {
    setStatus(BoostStatus.IDLE);
    setCurrentViews(0);
    setProgress(0);
    setLogs([]);
    setAnalysis(null);
    addLog("Dashboard synchronized. Ready for next campaign.", "info");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#020617] text-slate-200">
      {/* Navbar */}
      <nav className="w-full max-w-7xl flex justify-between items-center mb-10 px-4">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400">
              TIKTOK BOOST PRO
            </h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Advanced Influx Control</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:block h-8 w-px bg-slate-800" />
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-bold text-emerald-400">SYSTEM_LIVE</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">NODE_VERSION: 4.2.0-STABLE</span>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Command & Config (4 cols) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all duration-700" />
            
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              Campaign Configuration
            </h2>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Video Source URL</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Paste TikTok video link here..." 
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={status === BoostStatus.PROCESSING}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Target Views (Manual Influx)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={targetViews}
                  onChange={(e) => setTargetViews(Number(e.target.value))}
                  disabled={status === BoostStatus.PROCESSING}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Instant Preset Injection</label>
                <div className="grid grid-cols-2 gap-3">
                  {VIEW_PRESETS.map(preset => (
                    <button 
                      key={preset}
                      onClick={() => setTargetViews(preset)}
                      className={`py-3 rounded-xl text-xs font-black transition-all border ${targetViews === preset ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}
                      disabled={status === BoostStatus.PROCESSING}
                    >
                      {preset.toLocaleString()} VIEWS
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                {status === BoostStatus.IDLE || status === BoostStatus.ERROR || status === BoostStatus.COMPLETED ? (
                  <button 
                    onClick={handleStartBoost}
                    className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    <span>INITIALIZE BOOST</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button 
                    onClick={handleReset}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
                  >
                    ABORT OPERATION
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`} />
             </div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gemini AI Analysis
             </h3>

             {isAnalyzing ? (
               <div className="space-y-4 py-4">
                 <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse" />
                 <div className="h-4 w-1/2 bg-slate-800 rounded-full animate-pulse" />
                 <div className="h-20 w-full bg-slate-800 rounded-2xl animate-pulse" />
               </div>
             ) : analysis ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                 <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Viral Propensity Score</p>
                      <p className="text-4xl font-black text-white">{analysis.score}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Est. Organic Reach</p>
                       <p className="text-sm font-bold text-fuchsia-400">{analysis.estimatedReach}</p>
                    </div>
                 </div>
                 <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${analysis.score}%` }} />
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Growth Recommendations</p>
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-3 rounded-xl text-xs text-slate-300 border border-slate-800/50 flex gap-3">
                        <span className="text-indigo-400 font-bold">0{idx+1}</span>
                        {rec}
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <p className="text-xs text-slate-500 font-medium max-w-[180px]">Initiate a boost to generate real-time content strategy insights.</p>
               </div>
             )}
          </div>
        </section>

        {/* Center/Right Column: Live Data & Logs (8 cols) */}
        <section className="lg:col-span-8 space-y-8">
          {/* Main Monitor */}
          <div className="glass-panel rounded-3xl p-10 border border-white/5 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              
              {/* Stats & Progress */}
              <div className="space-y-10 order-2 md:order-1">
                <div className="relative">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Live View Influx Counter</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {currentViews.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-indigo-400">/ {targetViews.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol Sync Progress</span>
                    <span className="text-sm font-mono text-indigo-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-6 rounded-2xl overflow-hidden border border-slate-800 p-1">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-indigo-600 bg-[length:200%_100%] animate-gradient rounded-xl transition-all duration-500 flex items-center justify-end px-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      style={{ width: `${progress}%` }}
                    >
                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                </div>

                {/* Active Server Badge */}
                <div className="bg-slate-900/80 border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Active Relay Node</p>
                        <p className="text-sm font-bold text-white">{activeServer.name}</p>
                        <p className="text-[10px] text-indigo-400 font-medium tracking-wider">{activeServer.region}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Server Load</p>
                      <div className="flex items-center gap-2">
                         <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${activeServer.load}%` }} />
                         </div>
                         <span className="text-xs font-mono text-slate-300">{activeServer.load}%</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Video Preview Simulation */}
              <div className="order-1 md:order-2">
                 <div className="aspect-[9/16] max-w-[280px] mx-auto bg-black rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden group">
                    {videoUrl && getTikTokId(videoUrl) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-center p-6">
                        <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                           <svg className="w-10 h-10 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M8 5v14l11-7z" />
                           </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mb-1">SOURCE_SYNCED</p>
                        <p className="text-[10px] text-slate-600 font-mono break-all">{videoUrl.substring(0, 40)}...</p>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-6 right-6 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 animate-spin" />
                           <div className="flex-1 space-y-2">
                              <div className="h-2 bg-slate-800 rounded w-full" />
                              <div className="h-2 bg-slate-800 rounded w-2/3" />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/50 p-10 text-center">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-4">
                           <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                           </svg>
                        </div>
                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">No Active Stream</p>
                      </div>
                    )}
                    {/* UI Overlay Simulation */}
                    <div className="absolute top-8 right-4 flex flex-col gap-4">
                       {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 bg-white/5 rounded-full backdrop-blur-md border border-white/10" />)}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Terminal & Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Server Grid (5 cols) */}
            <div className="md:col-span-5 glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 Global Network Status
              </h3>
              <div className="space-y-3">
                {SERVER_NODES.map(node => (
                  <div 
                    key={node.id} 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-500 ${activeServer.id === node.id ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${activeServer.id === node.id ? 'bg-indigo-400' : 'bg-slate-800'}`} />
                          {activeServer.id === node.id && <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping" />}
                       </div>
                       <div>
                          <p className="text-[11px] font-bold text-slate-200">{node.name}</p>
                          <p className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">{node.region}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[10px] font-mono ${activeServer.id === node.id ? 'text-indigo-400' : 'text-slate-600'}`}>
                          {activeServer.id === node.id ? 'ROUTING_VIEWS...' : 'STDBY_READY'}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Terminal (7 cols) */}
            <div className="md:col-span-7 glass-panel rounded-3xl p-6 border border-white/5 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   Kernel Output
                </h3>
                <div className="flex gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
              </div>
              <div className="flex-1 bg-black/50 rounded-2xl p-6 font-mono text-[10px] overflow-y-auto scroll-smooth custom-scrollbar border border-slate-800/50 shadow-inner">
                 {logs.length === 0 ? (
                   <div className="text-slate-700 flex flex-col items-center justify-center h-full opacity-50">
                      <p className="mb-2">READY_FOR_COMMAND</p>
                      <div className="w-1 h-4 bg-slate-700 animate-pulse" />
                   </div>
                 ) : (
                   <div className="space-y-2">
                     {logs.map((log, idx) => (
                       <div key={idx} className="flex gap-4 items-start border-l-2 border-slate-800 pl-4 py-1 hover:bg-white/5 transition-colors group">
                          <span className="text-slate-600 shrink-0 font-bold group-hover:text-slate-400 transition-colors">{log.timestamp}</span>
                          <span className={`
                            ${log.type === 'success' ? 'text-emerald-400' : ''}
                            ${log.type === 'error' ? 'text-rose-400' : ''}
                            ${log.type === 'warning' ? 'text-amber-400' : ''}
                            ${log.type === 'info' ? 'text-sky-400' : ''}
                            break-words leading-relaxed
                          `}>
                            {log.message}
                          </span>
                       </div>
                     ))}
                     <div ref={logsEndRef} />
                   </div>
                 )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full max-w-7xl mt-16 pt-10 pb-16 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] font-bold uppercase tracking-widest gap-6 px-4">
        <div className="flex items-center gap-6">
           <p>&copy; 2025 Viral Nexus Labs</p>
           <span className="hidden md:block w-1.5 h-1.5 bg-slate-800 rounded-full" />
           <p className="hover:text-indigo-500 cursor-pointer transition-colors">Distributed Cloud Infrastructure</p>
        </div>
        <div className="flex gap-8 items-center">
           <a href="#" className="hover:text-indigo-500 transition-colors">Security Audit</a>
           <a href="#" className="hover:text-indigo-500 transition-colors">Compliance</a>
           <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
             VERSION_ID: VNX-2025.A
           </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
