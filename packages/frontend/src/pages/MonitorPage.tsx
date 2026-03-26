import { useTestStore } from '../store/testStore';
import { StatsGrid } from '../components/StatsGrid';
import { LatencyChart } from '../components/charts/LatencyChart';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { PercentileChart } from '../components/charts/PercentileChart';
import { Activity } from 'lucide-react';

export function MonitorPage() {
    const { stats, liveTimeline, status } = useTestStore();

    if (!stats && status === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#444444]">
                <Activity className="w-12 h-12" />
                <p className="text-[13px]">Configure and start a test to see live metrics</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
            {status === 'running' && (
                <div className="flex items-center gap-2 text-[#FF2D55] text-[11px] font-mono tracking-widest uppercase mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" />
                    Live
                    <span className="ml-auto text-[#888888] normal-case tracking-normal">
                        {stats.totalRequests} requests fired
                    </span>
                </div>
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
