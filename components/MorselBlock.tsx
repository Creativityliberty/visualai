import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Info, Target, ArrowRight } from 'lucide-react';

interface MorselBlockProps {
  type: string;
  content: string;
  meta: string;
}

const MorselBlock: React.FC<MorselBlockProps> = ({ type, content, meta }) => {
  let styles = "border-l-4 p-4 rounded-r-xl mb-3 bg-surface/40 backdrop-blur-sm";
  let icon = <Info size={18} />;
  let titleColor = "text-slate-300";

  switch (type.toLowerCase()) {
    case 'decision':
      styles += " border-primary bg-primary/5";
      icon = <CheckCircle size={18} className="text-primary" />;
      titleColor = "text-primary";
      break;
    case 'question':
      styles += " border-accent bg-accent/5";
      icon = <HelpCircle size={18} className="text-accent" />;
      titleColor = "text-accent";
      break;
    case 'risk':
      styles += " border-orange-500 bg-orange-500/5";
      icon = <AlertTriangle size={18} className="text-orange-500" />;
      titleColor = "text-orange-500";
      break;
    case 'nextstep':
      styles += " border-secondary bg-secondary/5";
      icon = <ArrowRight size={18} className="text-secondary" />;
      titleColor = "text-secondary";
      break;
    case 'option':
      styles += " border-blue-500 bg-blue-500/5";
      icon = <Target size={18} className="text-blue-500" />;
      titleColor = "text-blue-500";
      break;
    default:
      styles += " border-slate-500";
  }

  return (
    <div className={`${styles} animate-fade-in`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={`font-bold text-xs uppercase tracking-wider ${titleColor}`}>{type}</span>
      </div>
      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-light">
        {content.trim()}
      </div>
      {meta && (
        <div className="mt-2 text-[10px] text-slate-500 font-mono border-t border-white/5 pt-1 uppercase tracking-tight">
          {meta}
        </div>
      )}
    </div>
  );
};

export const parseMorselContent = (text: string) => {
  // Simple parser to identify blocks like "**Decision**\nContent\nMeta"
  const blocks: React.ReactNode[] = [];
  const lines = text.split('\n');
  let currentType = '';
  let currentContent = '';
  
  lines.forEach((line, index) => {
    // Detect Bold Headers like **Decision**
    const match = line.match(/^\*\*([a-zA-Z]+)\*\*$/);
    
    if (match) {
        // Push previous block if exists
        if (currentType) {
             const parts = currentContent.split('alignement:');
             const content = parts[0];
             const meta = parts.length > 1 ? `alignement:${parts[1]}` : '';
             blocks.push(<MorselBlock key={index} type={currentType} content={content} meta={meta} />);
        }
        currentType = match[1];
        currentContent = '';
    } else {
        if (currentType) {
            currentContent += line + '\n';
        } else {
            // Regular text outside blocks
             blocks.push(
                <p key={`p-${index}`} className="text-slate-300 text-sm mb-1 leading-relaxed">
                    {line}
                </p>
             );
        }
    }
  });

  // Push last block
  if (currentType) {
        const parts = currentContent.split('alignement:');
        const content = parts[0];
        const meta = parts.length > 1 ? `alignement:${parts[1]}` : '';
        blocks.push(<MorselBlock key={`last`} type={currentType} content={content} meta={meta} />);
  }

  return blocks;
};

export default MorselBlock;