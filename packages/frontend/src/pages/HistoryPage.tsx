import { useEffect, useState } from 'react';
import { Clock, FileDown, Bot } from 'lucide-react';

export function HistoryPage() {
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/results')
            .then(r => r.json())
            .then(data => setResults(data.results || []))
            .catch(() => { });
    }, []);

    const handleExportHTML = async (config: any, stats: any) => {
        if (!config || !stats) return;
        const response = await fetch('http://localhost:3000/report', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ config, stats })
        });
        const { html } = await response.json();

        // Use web fallback since we are in the browser
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apexload-report-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportAI = (aiAnalysisText: string | null) => {
        if (!aiAnalysisText) return;

        // Export the raw AI text or JSON analysis as a text file
        const blob = new Blob([aiAnalysisText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apexload-ai-analysis-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!results.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-[#475569]">
                <Clock className="w-10 h-10" />
                <p className="text-sm">No test history yet</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col">
            <h2 className="text-[13px] font-semibold text-[#F0F0F0] mb-4">Test History</h2>

            <div className="flex flex-col">
                <div className="grid grid-cols-12 px-4 py-3 bg-[#080808] text-[#444444] text-[11px] tracking-widest uppercase border-b border-[#1E1E1E] items-center">
                    <div className="col-span-3">Test Name & URL</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-center">Reqs</div>
                    <div className="col-span-1 text-center">RPS</div>
                    <div className="col-span-1 text-center">P99</div>
                    <div className="col-span-1 text-center">Errors</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="flex flex-col">
                    {results.map((r: any) => {
                        const stats = r.statsJson ? JSON.parse(r.statsJson) : null;
                        const config = r.config?.configJson ? JSON.parse(r.config.configJson) : null;
                        const errorCount = stats?.errorRate ? (stats.errorRate * 100) : 0;
                        const errorColor = errorCount > 0 ? "text-[#FF2D55]" : "text-[#444444]";

                        return (
                            <div key={r.id} className="grid grid-cols-12 px-4 py-3 bg-transparent border-b border-[#111111] hover:bg-[#0F0F0F] transition-colors duration-100 items-center">
                                <div className="col-span-3 flex flex-col">
                                    <p className="font-semibold text-[13px] text-[#F0F0F0]">{r.config?.name || 'Unknown'}</p>
                                    <p className="text-[11px] text-[#888888] mt-0.5 max-w-[200px] truncate">{config?.url}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[13px] text-[#888888]">{new Date(r.startedAt).toLocaleString()}</p>
                                </div>
                                <div className="col-span-1">
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${r.status === 'completed' ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#FF2D55]/10 text-[#FF2D55]'}`}>
                                        {r.status}
                                    </span>
                                </div>

                                <div className="col-span-1 text-center text-[13px] font-mono text-[#F0F0F0]">
                                    {stats?.totalRequests || 0}
                                </div>
                                <div className="col-span-1 text-center text-[13px] font-mono text-[#F0F0F0]">
                                    {(stats?.throughput || 0).toFixed(1)}
                                </div>
                                <div className="col-span-1 text-center text-[13px] font-mono text-[#F0F0F0]">
                                    {stats?.latency?.p99 || 0}
                                </div>
                                <div className={`col-span-1 text-center text-[13px] font-mono ${errorColor}`}>
                                    {errorCount.toFixed(1)}%
                                </div>

                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    {stats && (
                                        <>
                                            <button
                                                onClick={() => handleExportHTML(config, stats)}
                                                className="flex justify-center items-center p-1.5 border border-[#222222] hover:border-[#2C2C2C] bg-transparent hover:bg-[#1E1E1E] text-[#888888] hover:text-[#F0F0F0] rounded-md transition-colors duration-150 cursor-pointer"
                                                title="HTML Report"
                                            >
                                                <FileDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleExportAI(r.ai_analysis || JSON.stringify(stats, null, 2))}
                                                className="flex justify-center items-center p-1.5 border border-[#00D4FF]/30 hover:border-[#00D4FF]/60 bg-transparent hover:bg-[#00D4FF]/10 text-[#00D4FF] rounded-md transition-colors duration-150 cursor-pointer"
                                                title="AI Analysis"
                                            >
                                                <Bot className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
