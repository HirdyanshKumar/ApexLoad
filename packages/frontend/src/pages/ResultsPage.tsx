import { useTestStore } from '../store/testStore';
import { StatsGrid } from '../components/StatsGrid';
import { PercentileChart } from '../components/charts/PercentileChart';
import { LatencyChart } from '../components/charts/LatencyChart';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { AIAnalystPanel } from '../components/AIAnalystPanel';
import { FileDown, CheckCircle, Bot } from 'lucide-react';

declare global { interface Window { electronAPI?: any; } }

export function ResultsPage() {
    const { stats, liveTimeline, currentConfig, status, aiAnalysis } = useTestStore();

    if (!stats || status === 'running') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-[#444444]">
                <CheckCircle className="w-10 h-10" />
                <p className="text-[13px]">Results will appear here after a test completes</p>
            </div>
        );
    }

    const handleExportHTML = async () => {
        const response = await fetch('http://localhost:3000/report', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ config: currentConfig, stats })
        });
        const { html } = await response.json();
        if (window.electronAPI) {
            await window.electronAPI.saveReport({ html, filename: `apexload-report-${Date.now()}.html` });
        } else {
            // Fallback for web browser
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `apexload-report-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleExportAI = () => {
        let textContent = '';
        if (aiAnalysis) {
            textContent += `ApexLoad AI Bottleneck Analysis\n`;
            textContent += `Generated: ${new Date(aiAnalysis.generatedAt).toLocaleString()}\n`;
            textContent += `Test: ${currentConfig?.name} (${currentConfig?.method} ${currentConfig?.url})\n`;
            textContent += `Severity: ${aiAnalysis.severity.toUpperCase()}\n\n`;

            if (aiAnalysis.detectedIssues.length > 0) {
                textContent += `ISSUES DETECTED:\n`;
                aiAnalysis.detectedIssues.forEach(issue => textContent += `- ${issue}\n`);
                textContent += `\n`;
            }

            if (aiAnalysis.suggestions.length > 0) {
                textContent += `RECOMMENDED ACTIONS:\n`;
                aiAnalysis.suggestions.forEach(sug => textContent += `- ${sug}\n`);
                textContent += `\n`;
            }

            textContent += `FULL ANALYSIS:\n`;
            textContent += aiAnalysis.analysis;
        } else if (stats) {
            textContent = JSON.stringify(stats, null, 2);
        } else {
            return;
        }

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apexload-ai-analysis-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#F0F0F0]">
                    Test Complete — <span className="text-[#FF6B2B]">{currentConfig?.name}</span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={handleExportHTML}
                        className="flex items-center gap-2 bg-[#FF6B2B] hover:bg-[#E55A1F] text-[#080808] font-semibold px-4 py-2 rounded-md text-[13px] transition-colors duration-150 cursor-pointer">
                        <FileDown className="w-4 h-4" /> Export HTML
                    </button>
                    <button onClick={handleExportAI}
                        className="flex items-center gap-2 bg-transparent hover:bg-[#00D4FF]/10 border border-[#00D4FF]/30 hover:border-[#00D4FF]/60 text-[#00D4FF] text-[13px] font-medium px-4 py-2 rounded-md transition-colors duration-150 cursor-pointer">
                        <Bot className="w-4 h-4" /> Export AI Analysis
                    </button>
                </div>
            </div>

            {/* AI Analyst Panel — shown prominently at top of results */}
            {currentConfig && (
                <AIAnalystPanel config={currentConfig} stats={stats} />
            )}

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-2 gap-4">
                <LatencyChart data={liveTimeline} />
                <ThroughputChart data={liveTimeline} />
            </div>
            <PercentileChart stats={stats} />
        </div>
    );
}
