import React, { useState, useMemo } from 'react';
import { WorkspaceState, ArtifactPayload, ImageJobPayload } from '../types';
import { Image as ImageIcon, FileText, Clock, ExternalLink, Download, Search, Tag, GitCommit } from 'lucide-react';

interface ContextPanelProps {
  workspace: WorkspaceState;
  activeTab: string;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ workspace, activeTab }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic
  const filteredImages = useMemo(() => {
      return workspace.images.filter(img => 
        img.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.prompt_main.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [workspace.images, searchTerm]);

  const filteredArtifacts = useMemo(() => {
      return workspace.artifacts.filter(art => 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [workspace.artifacts, searchTerm]);

  if (activeTab === 'chat') return null;

  return (
    <div className="w-96 bg-surface/50 backdrop-blur-xl border-l border-white/5 overflow-y-auto hidden xl:flex flex-col h-full">
       
       <div className="p-6 pb-2">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight mb-1">{workspace.name}</h2>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        WORKSPACE STABLE
                    </div>
                </div>
            </div>

            {/* Contextual Search */}
            <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrer (tags, nom, contenu)..." 
                    className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>
       </div>

       <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 animate-fade-in custom-scrollbar">
            {activeTab === 'images' && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <ImageIcon size={14} /> Jobs Récents ({filteredImages.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {filteredImages.map((img) => (
                            <div key={img.job_id} className="group bg-background rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/10">
                                    {/* Mock Visualizer */}
                                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                                        <span className="text-slate-600 text-xs font-mono">{img.dimensions}</span>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><ExternalLink size={16}/></button>
                                            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Download size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-sm truncate w-full">{img.filename}</h4>
                                        </div>
                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase mb-2 inline-block">{img.category}</span>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{img.prompt_main}</p>
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2">
                                            <span>WEBP</span>
                                            <span>&lt;200KB</span>
                                        </div>
                                    </div>
                            </div>
                        ))}
                    </div>
                    {filteredImages.length === 0 && (
                        <div className="text-center p-8 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">
                            Aucune image trouvée.
                        </div>
                    )}
                </div>
            )}

            {(activeTab === 'artifacts' || activeTab === 'architecture') && (
                <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={14} /> Artifacts (.md) ({filteredArtifacts.length})
                    </h3>
                    {filteredArtifacts.map((art) => (
                        <div key={art.prompt_id} className="bg-background rounded-2xl p-5 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                                        ${art.artifact_type === 'ADR' ? 'bg-orange-500/20 text-orange-400' : 
                                        art.artifact_type === 'ARCH' ? 'bg-blue-500/20 text-blue-400' :
                                        art.artifact_type === 'PLAN' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-slate-700 text-slate-300'}`}>
                                        {art.artifact_type}
                                    </span>
                                    {art.versioning?.version && (
                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-1 rounded-full">
                                            <GitCommit size={10} /> v{art.versioning.version}
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-white font-medium text-sm group-hover:text-primary transition-colors">{art.title}</h4>
                                
                                {art.tags && art.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {art.tags.map((tag, idx) => (
                                            <span key={idx} className="flex items-center gap-0.5 text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                <Tag size={8} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 border-t border-white/5 pt-2">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>Just now</span>
                                    </div>
                                    <span className="font-mono uppercase">{art.format}</span>
                                </div>
                        </div>
                    ))}
                     {filteredArtifacts.length === 0 && (
                        <div className="text-center p-8 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">
                            Aucun artifact trouvé.
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};

export default ContextPanel;