
import React, { useState, useEffect, useCallback } from 'react';
import { TopologyType, TopologyData, AIInsight } from './types';
import { generateTopology } from './utils/topologyGenerators';
import { getAIInsights } from './services/geminiService';
import TopologyCanvas from './components/TopologyCanvas';

const App: React.FC = () => {
  const [topologyType, setTopologyType] = useState<TopologyType>(TopologyType.STAR);
  const [nodeCount, setNodeCount] = useState<number>(6);
  const [data, setData] = useState<TopologyData>(generateTopology(TopologyType.STAR, 6));
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTopology = useCallback((type: TopologyType, count: number) => {
    setData(generateTopology(type, count));
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TopologyType;
    setTopologyType(newType);
    
    // Auto-adjust node count for specific protocols
    let adjustedCount = nodeCount;
    if (newType === TopologyType.USART) adjustedCount = 2;
    if (newType === TopologyType.SPI && nodeCount < 2) adjustedCount = 2;
    if (newType === TopologyType.IIC && nodeCount < 2) adjustedCount = 2;
    
    setNodeCount(adjustedCount);
    updateTopology(newType, adjustedCount);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value);
    setNodeCount(newCount);
    updateTopology(topologyType, newCount);
  };

  const fetchAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const insight = await getAIInsights(topologyType, nodeCount);
      setAiInsights(insight);
    } catch (err: any) {
      console.error(err);
      setError("AI 分析请求失败。这可能是由于暂时性的 API 限制或网络问题。请尝试手动点击 '获取 AI 技术分析' 重新加载。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, [topologyType]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">EmbeddedTopology AI</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">通信协议拓扑自动化专家</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAIAnalysis}
            disabled={loading}
            className="group relative px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 transition-all rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在解析协议...
              </span>
            ) : "获取 AI 深度技术分析"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-72 bg-slate-900/40 p-5 border-r border-slate-800/50 flex flex-col">
          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              通信协议/拓扑
            </label>
            <div className="space-y-1">
              <select 
                value={topologyType}
                onChange={handleTypeChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
              >
                <optgroup label="基础拓扑">
                  <option value={TopologyType.STAR}>Star (星型)</option>
                  <option value={TopologyType.RING}>Ring (环型)</option>
                  <option value={TopologyType.BUS}>Bus (总线型)</option>
                  <option value={TopologyType.TREE}>Tree (树型)</option>
                </optgroup>
                <optgroup label="嵌入式协议">
                  <option value={TopologyType.CAN}>CAN Bus</option>
                  <option value={TopologyType.SPI}>SPI (串行外设接口)</option>
                  <option value={TopologyType.IIC}>I2C/IIC (双线总线)</option>
                  <option value={TopologyType.USART}>USART (串口)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                节点规模
              </label>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-black border border-indigo-500/20">
                {nodeCount} NODES
              </span>
            </div>
            <input 
              type="range" 
              min={topologyType === TopologyType.USART ? "2" : "2"} 
              max={topologyType === TopologyType.USART ? "2" : "30"} 
              value={nodeCount}
              disabled={topologyType === TopologyType.USART}
              onChange={handleCountChange}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
              <span>Min: {topologyType === TopologyType.USART ? '2' : '2'}</span>
              <span>Max: {topologyType === TopologyType.USART ? '2' : '30'}</span>
            </div>
          </div>

          <div className="flex-1 mt-auto">
            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <h4 className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                <span className="p-1 bg-indigo-500/10 rounded">?</span> 协议百科
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                {topologyType === TopologyType.IIC && "I2C 是一种半双工总线，通常用于短距离板级通信。需要上拉电阻。"}
                {topologyType === TopologyType.SPI && "SPI 是全双工通信，速度极快，但引脚占用较多（MOSI, MISO, SCK, CS）。"}
                {topologyType === TopologyType.CAN && "CAN 是差分信号总线，常用于汽车工业，抗干扰能力极强。"}
                {topologyType === TopologyType.USART && "USART 常见于设备调试，TX 连 RX，RX 连 TX。"}
                {(![TopologyType.IIC, TopologyType.SPI, TopologyType.CAN, TopologyType.USART].includes(topologyType)) && "您可以动态调整节点数量来观察不同拓扑结构的连通性差异。"}
              </p>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 relative p-4 bg-slate-950 flex flex-col">
          <div className="flex-1">
             <TopologyCanvas data={data} />
          </div>
        </div>

        {/* AI Insight Panel */}
        <aside className="w-[420px] bg-slate-900/60 border-l border-slate-800/50 flex flex-col overflow-hidden backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
            <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.243a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM6.364 14.95a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" />
              </svg>
              {topologyType} 技术档案
            </h3>
            {loading && <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/4 animate-pulse"></div>
                  <div className="h-20 bg-slate-800/40 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-800/20 rounded animate-pulse"></div>
                  <div className="h-32 bg-slate-800/20 rounded animate-pulse"></div>
                </div>
                <div className="h-24 bg-slate-800/30 rounded animate-pulse"></div>
              </div>
            ) : aiInsights ? (
              <>
                <section>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> 核心概述
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiInsights.summary}</p>
                </section>

                <div className="grid grid-cols-2 gap-5">
                  <section>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">关键优势</h4>
                    <ul className="space-y-2.5">
                      {aiInsights.advantages.map((adv, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex gap-2 leading-tight">
                          <span className="text-emerald-500 font-bold">✓</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">局限性</h4>
                    <ul className="space-y-2.5">
                      {aiInsights.disadvantages.map((dis, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex gap-2 leading-tight">
                          <span className="text-rose-500 font-bold">×</span> {dis}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">典型工业应用</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.scenarios.map((scene, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-md text-[10px] font-bold border border-indigo-500/20">
                        {scene}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-lg">
                  <h4 className="text-[10px] font-black text-white mb-2 uppercase tracking-widest">可靠性与鲁棒性</h4>
                  <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                    "{aiInsights.reliability}"
                  </p>
                </section>

                {aiInsights.technicalDetails && (
                  <section className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <h4 className="text-[10px] font-black text-amber-500 mb-2 uppercase tracking-widest">进阶技术细节</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {aiInsights.technicalDetails}
                    </p>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">选择协议以开始深度分析</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex gap-3 items-start">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span className="text-indigo-500">拓扑生成器 v2.0</span>
          <span className="opacity-50">Support: CAN / SPI / I2C / USART</span>
        </div>
        <div className="flex gap-6">
          <span>Simulation: Force-Directed (D3)</span>
          <span>Analysis: Gemini 3 Flash</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
