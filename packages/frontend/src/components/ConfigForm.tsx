import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTestStore } from '../store/testStore';
import { useNLBuilder } from '../hooks/useNLBuilder';
import { v4 as uuidv4 } from 'uuid';
import { Play, StopCircle, RotateCcw, Wand2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Name required'),
    url: z.string().url('Valid URL required'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    headers: z.string().optional(),
    body: z.string().optional(),
    concurrency: z.coerce.number().min(1).max(1000),
    totalRequests: z.coerce.number().min(1).max(100000),
    rampUpSeconds: z.coerce.number().min(0).max(300),
    timeoutMs: z.coerce.number().min(100).max(60000),
    thinkTimeMs: z.coerce.number().min(0).max(10000),
});

type FormValues = z.infer<typeof schema>;

interface ConfigFormProps { onSend: (type: string, payload?: any) => void; }

export function ConfigForm({ onSend }: ConfigFormProps) {
    const { status, reset, setCurrentConfig, nlParsing, nlError, nlPrompt, setNlPrompt } = useTestStore();
    const isRunning = status === 'running';
    const [showNL, setShowNL] = useState(true); // NL panel open by default

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: 'My API Test', url: 'https://httpbin.org/get',
            method: 'GET', concurrency: 10, totalRequests: 100,
            rampUpSeconds: 5, timeoutMs: 5000, thinkTimeMs: 0,
        }
    });

    // Hook that calls /ai/parse-intent and fills form fields
    const { parseIntent } = useNLBuilder(setValue);

    const onSubmit = (data: FormValues) => {
        let headers: Record<string, string> = {};
        try { if (data.headers) headers = JSON.parse(data.headers); } catch { }

        const config = {
            id: uuidv4(), name: data.name, url: data.url,
            method: data.method, headers,
            body: data.body || undefined,
            concurrency: data.concurrency, totalRequests: data.totalRequests,
            rampUpSeconds: data.rampUpSeconds, timeoutMs: data.timeoutMs, thinkTimeMs: data.thinkTimeMs,
        };
        setCurrentConfig(config);
        reset();
        onSend('START_TEST', config);
    };

    const Field = ({ label, name, type = 'text', placeholder, children }: { label: string; name: keyof FormValues; type?: string; placeholder?: string; children?: React.ReactNode }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-1">{label}</label>
            {children || (
                <input type={type} {...register(name)} placeholder={placeholder}
                    className="bg-[#161616] border border-[#222222] rounded-md px-3 py-2 text-[13px] font-mono text-[#F0F0F0] placeholder-[#333333] focus:border-[#FF6B2B]/60 focus:outline-none transition-colors" />
            )}
            {errors[name] && <span className="text-[#FF2D55] text-[12px]">{errors[name]?.message as string}</span>}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-4">

            {/* ─── AI Natural Language Builder Panel ─────────────────────────────── */}
            <div className={`bg-[#0F0F0F] rounded-lg border ${nlParsing ? 'border-[#00D4FF]/50' : 'border-[#00D4FF]/20'} overflow-hidden`}>
                <button
                    type="button"
                    onClick={() => setShowNL(!showNL)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:border-[#2C2C2C] transition-colors duration-150"
                >
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-[#00D4FF]" />
                        <span className="text-[#00D4FF] text-[12px] font-medium tracking-widest uppercase">AI Test Builder</span>
                        <span className="text-xs text-[#888888] ml-1">— describe your test in plain English</span>
                    </div>
                    {showNL ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
                </button>

                {showNL && (
                    <div className="px-4 pb-4 flex flex-col gap-3">
                        <textarea
                            value={nlPrompt}
                            onChange={(e) => setNlPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    parseIntent(nlPrompt);
                                }
                            }}
                            placeholder={`Examples:\n• "stress test https://api.myapp.com/login with 200 concurrent users, POST, ramp up 30 seconds"\n• "quick smoke test on localhost:3000/health"\n• "soak test my checkout endpoint for 5 minutes with 50 users and bearer token auth"`}
                            rows={3}
                            className="w-full bg-[#161616] border border-[#1E1E1E] rounded-md px-3 py-2 text-[13px] font-mono text-[#F0F0F0] placeholder-[#333333] focus:outline-none focus:border-[#FF6B2B]/60 resize-none leading-relaxed transition-colors"
                        />

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={nlParsing || !nlPrompt.trim()}
                                onClick={() => parseIntent(nlPrompt)}
                                className="flex items-center gap-2 bg-transparent hover:bg-[#00D4FF]/10 border border-[#00D4FF]/30 hover:border-[#00D4FF]/60 text-[#00D4FF] text-[13px] font-medium px-4 py-2 rounded-md transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {nlParsing
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing with Claude...</>
                                    : <><Wand2 className="w-4 h-4" /> Auto-fill Form</>
                                }
                            </button>
                            <span className="text-[#888888] text-[13px]">or Cmd/Ctrl+Enter</span>
                        </div>

                        {nlError && (
                            <div className="flex items-start gap-2 bg-[#FF2D55]/10 border border-[#FF2D55]/40 rounded-md px-3 py-2">
                                <span className="text-[#FF2D55] text-[12px]">{nlError}</span>
                            </div>
                        )}

                        {!nlParsing && !nlError && nlPrompt && (
                            <p className="text-[#00E5A0] text-[12px]">
                                Fields auto-filled below — review and adjust before starting
                            </p>
                        )}
                    </div>
                )}
            </div>
            {/* ─────────────────────────────────────────────────────────────────────── */}

            <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#1E1E1E] hover:border-[#2C2C2C] transition-colors duration-150">
                        <h2 className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-4">Endpoint</h2>
                        <div className="flex flex-col gap-3">
                            <Field label="Test Name" name="name" placeholder="My API Load Test" />
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Field label="URL" name="url" placeholder="https://api.example.com/endpoint" />
                                </div>
                                <div className="w-32">
                                    <Field label="Method" name="method">
                                        <select {...register('method')} className="bg-[#161616] border border-[#222222] rounded-md px-3 py-2 text-[13px] font-mono text-[#F0F0F0] w-full focus:outline-none focus:border-[#FF6B2B]/60">
                                            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} className={m !== 'GET' ? 'text-[#FF6B2B]' : ''}>{m}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                            <Field label="Headers (JSON)" name="headers" placeholder='{"Authorization": "Bearer token"}' />
                            <Field label="Body (JSON)" name="body" placeholder='{"key": "value"}' />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#1E1E1E] hover:border-[#2C2C2C] transition-colors duration-150">
                        <h2 className="text-[11px] font-medium tracking-widest uppercase text-[#444444] mb-4">Load Profile</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Concurrency (workers)" name="concurrency" type="number" placeholder="10" />
                            <Field label="Total Requests" name="totalRequests" type="number" placeholder="100" />
                            <Field label="Ramp Up (seconds)" name="rampUpSeconds" type="number" placeholder="5" />
                            <Field label="Timeout (ms)" name="timeoutMs" type="number" placeholder="5000" />
                            <Field label="Think Time (ms)" name="thinkTimeMs" type="number" placeholder="0" />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {!isRunning ? (
                            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B2B] hover:bg-[#E55A1F] text-[#080808] font-semibold text-[13px] px-4 py-2 rounded-md transition-colors duration-150 cursor-pointer">
                                <Play className="w-4 h-4" /> Start Load Test
                            </button>
                        ) : (
                            <button type="button" onClick={() => onSend('STOP_TEST')}
                                className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-[#FF2D55]/10 border border-[#FF2D55]/40 hover:border-[#FF2D55] text-[#FF2D55] text-[13px] font-semibold px-4 py-2 rounded-md transition-colors duration-150">
                                <StopCircle className="w-4 h-4" /> Stop Test
                            </button>
                        )}
                        <button type="button" onClick={() => reset()}
                            className="bg-transparent hover:bg-[#1E1E1E] border border-[#222222] hover:border-[#2C2C2C] text-[#888888] hover:text-[#F0F0F0] text-[13px] font-medium px-4 py-2 rounded-md transition-colors duration-150 cursor-pointer">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
