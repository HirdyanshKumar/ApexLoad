import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TimelinePoint } from '../../types';

interface Props { data: TimelinePoint[]; }

export function ThroughputChart({ data }: Props) {
    const chartData = data.map((p, i) => ({
        t: i + 1,
        rps: parseFloat(p.throughput.toFixed(2)),
        errorRate: parseFloat((p.errorRate * 100).toFixed(2)),
    }));

    return (
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#2C2C2C] transition-colors duration-150">
            <h3 className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-3">Throughput (req/s)</h3>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1E1E1E" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: '#444444', fontSize: 11 }} tickFormatter={v => `${v}s`} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#444444', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ background: '#161616', border: '1px solid #2C2C2C', borderRadius: '6px' }} 
                        labelStyle={{ color: '#888888', fontSize: '11px' }} 
                        itemStyle={{ color: '#F0F0F0', fontSize: '12px', fontFamily: 'monospace' }} 
                    />
                    <Area type="monotone" dataKey="rps" stroke="#00E5A0" fill="#00E5A0" fillOpacity={0.08} strokeWidth={2} dot={false} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
