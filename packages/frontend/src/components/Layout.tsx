import type { ReactNode } from 'react';
import { useTestStore } from '../store/testStore';
import { Activity } from 'lucide-react';

interface LayoutProps { children: ReactNode; activeTab: string; onTabChange: (tab: string) => void; }

const TABS = [
    { id: 'configure', label: 'Configure' },
    { id: 'monitor', label: 'Monitor' },
    { id: 'results', label: 'Results' },
    { id: 'history', label: 'History' },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const { connected, status } = useTestStore();

    return (
        <div className="flex flex-col h-screen bg-[#080808]">
            {/* Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#080808] border-b border-[#1E1E1E]">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#FF6B2B] w-5 h-5" />
                    <span className="text-[#F0F0F0] font-semibold text-[13px] tracking-tight">ApexLoad</span>
                    <span className="text-[#888888] text-[13px]">API Performance Tester</span>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'running' && (
                        <span className="flex items-center gap-1 text-[12px] font-mono text-[#FF2D55] uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse inline-block" />
                            Test Running
                        </span>
                    )}
                    {connected
                        ? <span className="bg-[#00E5A0] rounded-full w-2 h-2" />
                        : <span className="bg-[#FF2D55] rounded-full w-2 h-2" />}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 px-4 py-0 bg-[#0F0F0F] border-b border-[#1E1E1E]">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-2 text-[12px] font-medium tracking-wide transition-colors duration-150 border-b-2 ${activeTab === tab.id
                            ? 'text-[#FF6B2B] border-[#FF6B2B]'
                            : 'text-[#444444] border-transparent hover:text-[#888888]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-[#080808]">{children}</div>
        </div>
    );
}
