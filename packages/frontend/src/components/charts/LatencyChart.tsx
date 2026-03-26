import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TimelinePoint } from '../../types';

interface Props { data: TimelinePoint[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#161616] border border-[#2C2C2C] rounded-md p-3 text-[12px] font-mono text-[#F0F0F0]">
            <p className="text-[#888888] font-sans text-[11px] mb-1">t+{label}s</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}ms</p>
            ))}
        </div>
    );
};

export function LatencyChart({ data }: Props) {
    const chartData = data.map((p, i) => ({
        t: i + 1,
        p50: p.latencyP50,
        p95: p.latencyP95,
    }));

    return (
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#2C2C2C] transition-colors duration-150">
            <h3 className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-3">Latency Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1E1E1E" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: '#444444', fontSize: 11 }} tickFormatter={v => `${v}s`} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#444444', fontSize: 11 }} tickFormatter={v => `${v}ms`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#888888', fontSize: 12 }} />
                    <Line type="monotone" dataKey="p50" stroke="#F0F0F0" strokeWidth={1.5} dot={false} name="P50" isAnimationActive={false} />
                    <Line type="monotone" dataKey="p95" stroke="#FFD60A" strokeWidth={2} dot={false} name="P95" isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
