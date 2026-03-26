import type { AggregatedStats } from '../types';

interface StatCardProps { label: string; value: string | number; unit?: string; highlight?: 'good' | 'warn' | 'error' | 'info' | 'throughput' | 'p95' | 'p99' | 'max'; }

function StatCard({ label, value, unit, highlight = 'info' }: StatCardProps) {
    const borders = {
        good: 'border-l-[#00E5A0]',
        warn: 'border-l-[#FFD60A]',
        error: 'border-l-[#FF2D55]',
        info: 'border-l-[#F0F0F0]',
        throughput: 'border-l-[#FF6B2B]',
        p95: 'border-l-[#FFD60A]',
        p99: 'border-l-[#FF2D78]',
        max: 'border-l-[#888888]'
    };
    return (
        <div className={`bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg p-4 flex flex-col gap-1 border-l-2 hover:border-[#2C2C2C] transition-colors duration-150 ${borders[highlight as keyof typeof borders] || 'border-l-[#F0F0F0]'}`}>
            <span className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-2">{label}</span>
            <div>
                <span className="font-mono text-3xl font-semibold text-[#F0F0F0]">{value}</span>
                {unit && <span className="text-[#444444] text-[13px] font-mono ml-1">{unit}</span>}
            </div>
        </div>
    );
}

interface StatsGridProps { stats: AggregatedStats; }

export function StatsGrid({ stats }: StatsGridProps) {
    const errorPct = (stats.errorRate * 100).toFixed(1);
    const errorHighlight = stats.errorRate > 0.05 ? 'error' : stats.errorRate > 0.01 ? 'warn' : 'good';

    return (
        <div className="grid grid-cols-4 gap-3 mb-4">
            <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} highlight="info" />
            <StatCard label="Throughput" value={stats.throughput.toFixed(1)} unit="req/sec" highlight="throughput" />
            <StatCard label="Error Rate" value={`${errorPct}%`} highlight={errorHighlight} />
            <StatCard label="Success" value={stats.successCount.toLocaleString()} highlight="good" />
            <StatCard label="P50 Latency" value={stats.latency.p50} unit="ms" highlight="info" />
            <StatCard label="P95 Latency" value={stats.latency.p95} unit="ms" highlight={stats.latency.p95 > 500 ? 'p95' : 'warn'} />
            <StatCard label="P99 Latency" value={stats.latency.p99} unit="ms" highlight={stats.latency.p99 > 1000 ? 'p99' : 'info'} />
            <StatCard label="Max Latency" value={stats.latency.max} unit="ms" highlight={stats.latency.max > 2000 ? 'max' : 'info'} />
        </div>
    );
}
