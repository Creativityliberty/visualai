import React from 'react';
import { LayoutDashboard, MessageSquare, Image, FileText, Settings, Database, Code2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'chat', label: 'Orchestrator', icon: MessageSquare },
    { id: 'images', label: 'Studio Images', icon: Image },
    { id: 'artifacts', label: 'Bibliothèque', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Code2 },
    { id: 'memory', label: 'Mémoire', icon: Database },
  ];

  return (
    <div className="w-20 lg:w-64 flex-shrink-0 bg-surface/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">A</span>
        </div>
        <div className="hidden lg:block">
            <h1 className="font-bold text-lg text-white leading-tight">Agence</h1>
            <p className="text-xs text-slate-400">Visuelle IA</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={20} />
            <span className="hidden lg:block font-medium">Réglages</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;