import { useCallback, useState } from 'react';
import { useTestStore } from '../store/testStore';
import type { LoadTestConfig, AggregatedStats } from '../types';
import { BrainCircuit, Loader2, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

interface AIAnalystPanelProps {
    config: LoadTestConfig;
    stats: AggregatedStats;
}

const SEVERITY_CONFIG = {
    healthy: { icon: CheckCircle, color: 'text-[#00E5A0]', border: 'border-l-[#00E5A0]', badge: 'bg-[#00E5A0]/10 text-[#00E5A0]', label: 'Healthy' },
    warning: { icon: AlertTriangle, color: 'text-[#FFD60A]', border: 'border-l-[#FFD60A]', badge: 'bg-[#FFD60A]/10 text-[#FFD60A]', label: 'Warning' },
    critical: { icon: XCircle, color: 'text-[#FF2D55]', border: 'border-l-[#FF2D55]', badge: 'bg-[#FF2D55]/10 text-[#FF2D55]', label: 'Critical' },
};

export function AIAnalystPanel({ config, stats }: AIAnalystPanelProps) {
    const {
        aiAnalysis, setAiAnalysis,
        aiStreaming, setAiStreaming,
        aiStreamText, appendAiStreamText, clearAiStreamText
    } = useTestStore();
    const [expanded, setExpanded] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const runAnalysis = useCallback(async () => {
        setAiStreaming(true);
        clearAiStreamText();
        setAiAnalysis(null);
        setHasStarted(true);

        try {
            const res = await fetch(`${API_BASE}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config, stats })
            });

            if (!res.ok || !res.body) throw new Error('Analysis request failed');

            // Read SSE stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') break;

                    try {
                        const event = JSON.parse(data);
                        if (event.type === 'token') {
                            appendAiStreamText(event.text);
                        } else if (event.type === 'complete') {
                            setAiAnalysis(event.result);
                        } else if (event.type === 'error') {
                            throw new Error(event.message);
                        }
                    } catch {
                        // Skip malformed SSE lines
                    }
                }
            }
        } catch (err: any) {
            appendAiStreamText(`\n\nAnalysis failed: ${err.message}`);
        } finally {
            setAiStreaming(false);
        }
    }, [config, stats, setAiStreaming, clearAiStreamText, setAiAnalysis, appendAiStreamText]);

    const severityConfig = aiAnalysis
        ? SEVERITY_CONFIG[aiAnalysis.severity as keyof typeof SEVERITY_CONFIG]
        : SEVERITY_CONFIG.warning;

    return (
        <div className={`bg-[#0F0F0F] rounded-lg border border-[#1E1E1E] border-l-4 overflow-hidden transition-colors duration-150 ${aiAnalysis ? severityConfig.border : 'border-l-[#00D4FF]'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <BrainCircuit className={`w-5 h-5 ${aiAnalysis ? severityConfig.color : 'text-[#00D4FF]'}`} />
                    <span className="text-[#00D4FF] text-[12px] font-medium tracking-widest uppercase">AI Bottleneck Analyst</span>
                    {aiAnalysis && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${severityConfig.badge}`}>
                            {severityConfig.label}
                        </span>
                    )}
                    {aiStreaming && (
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!aiStreaming && (
                        <button
                            onClick={runAnalysis}
                            className="flex items-center gap-2 bg-transparent hover:bg-[#00D4FF]/10 border border-[#00D4FF]/30 hover:border-[#00D4FF]/60 text-[#00D4FF] text-[13px] font-medium px-4 py-2 rounded-md transition-colors duration-150"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            {hasStarted ? 'Re-Analyze' : 'Analyze'}
                        </button>
                    )}
                    {hasStarted && (
                        <button onClick={() => setExpanded(!expanded)} className="text-[#444444] hover:text-[#888888] px-2 py-2">
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Streaming / Analysis Content */}
            {expanded && hasStarted && (
                <div className="px-4 pb-4">
                    {/* Structured Issues & Suggestions (shown after stream completes) */}
                    {aiAnalysis && aiAnalysis.detectedIssues.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div className="bg-[#161616] border border-[#222222] rounded-lg p-3">
                                <p className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-2">Issues Detected</p>
                                <ul className="flex flex-col gap-1">
                                    {aiAnalysis.detectedIssues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-[13px] text-[#FF2D55]">
                                            <span className="text-[#FF2D55] mt-0.5 shrink-0">•</span>{issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#161616] border border-[#222222] rounded-lg p-3">
                                <p className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-2">Recommended Actions</p>
                                <ul className="flex flex-col gap-1">
                                    {aiAnalysis.suggestions.map((sug, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-[13px] text-[#00E5A0]">
                                            <span className="text-[#00E5A0] mt-0.5 shrink-0">→</span>{sug}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Full streaming markdown text */}
                    <div className="bg-[#161616] border border-[#222222] rounded-md p-4 font-mono text-[12px] text-[#888888] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                        {aiStreamText ? <span className="text-[#F0F0F0]">{aiStreamText}</span> : (aiStreaming ? <span className="text-[#00D4FF] animate-pulse">AI is thinking...</span> : null)}
                        {/* Blinking cursor while streaming */}
                        {aiStreaming && <span className="inline-block w-2 h-3 bg-[#00D4FF] ml-0.5 animate-pulse" />}
                    </div>

                    {aiAnalysis && (
                        <p className="text-[12px] text-[#444444] mt-2">
                            Analysis generated at {new Date(aiAnalysis.generatedAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>
            )}

            {/* Initial CTA (before first analysis) */}
            {!hasStarted && (
                <div className="px-4 pb-4 text-[13px] text-[#888888]">
                    Click "Analyze" to get an AI-powered diagnosis of your test results — AI will identify bottlenecks, explain root causes, and suggest fixes.
                </div>
            )}
        </div>
    );
}
