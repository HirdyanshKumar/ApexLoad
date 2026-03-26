import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import type { AggregatedStats } from '../../types';

interface Props { stats: AggregatedStats; }

export function PercentileChart({ stats }: Props) {
    const data = [
        { name: 'P50', value: stats.latency.p50 },
        { name: 'P75', value: stats.latency.p75 },
        { name: 'P90', value: stats.latency.p90 },
        { name: 'P95', value: stats.latency.p95 },
        { name: 'P99', value: stats.latency.p99 },
        { name: 'P99.9', value: stats.latency.p999 },
    ];

    const colors = ['#F0F0F0', '#FFD60A', '#FF6B2B', '#FF6B2B', '#FF2D55', '#FF2D78'];

    return (
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#2C2C2C] transition-colors duration-150">
            <h3 className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-3">Percentile Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="name" tick={{ fill: '#444444', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#444444', fontSize: 11 }} tickFormatter={v => `${v}ms`} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2C2C2C', borderRadius: '6px' }} itemStyle={{ color: '#F0F0F0', fontSize: '12px', fontFamily: 'monospace' }} formatter={(v) => [`${v}ms`, 'Latency']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
