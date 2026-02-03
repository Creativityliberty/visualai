import React, { useState } from 'react';
import { ChoicePayload } from '../types';
import { Check, ArrowRight } from 'lucide-react';

interface DecisionGateProps {
  payload: ChoicePayload;
  onDecide: (choiceId: string, notes: string) => void;
}

const DecisionGate: React.FC<DecisionGateProps> = ({ payload, onDecide }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (selectedId) {
      onDecide(selectedId, notes);
    }
  };

  return (
    <div className="my-6 bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 animate-slide-up">
      <div className="bg-gradient-to-r from-primary/20 to-surface p-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                Gate Interactif
            </div>
            {payload.required && <span className="text-xs text-red-400 font-medium">*Requis</span>}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{payload.intent_core}</h3>
        <p className="text-slate-400 text-xs font-mono opacity-70">ID: {payload.prompt_id}</p>
      </div>

      <div className="p-6 space-y-4">
        {payload.choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          return (
            <div 
              key={choice.id}
              onClick={() => setSelectedId(choice.id)}
              className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-300 group
                ${isSelected 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                  : 'bg-background border-white/5 hover:border-white/20'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-200'}`}>
                    {choice.label}
                </h4>
                {isSelected && <Check size={18} className="text-primary" />}
              </div>
              
              <p className="text-sm text-slate-400 mb-3">{choice.what_it_means}</p>
              
              <div className="flex flex-wrap gap-2 text-[10px]">
                {choice.pros.map((pro, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-green-500/10 text-green-400">+{pro}</span>
                ))}
                {choice.cons.map((con, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-red-500/10 text-red-400">-{con}</span>
                ))}
              </div>
              
              {choice.recommended && (
                <div className="absolute top-2 right-2">
                     <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                     </span>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 pt-6 border-t border-white/5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Notes de décision (Optionnel)
            </label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez un contexte spécifique pour l'agent..."
                className="w-full bg-background rounded-xl border border-white/10 p-3 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                rows={2}
            />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
            ${selectedId 
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 translate-y-0' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
        >
          Valider la décision <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DecisionGate;