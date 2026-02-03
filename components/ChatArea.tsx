import React, { useRef, useEffect, useState } from 'react';
import { Message, AnyPayload, Attachment } from '../types';
import MorselBlock, { parseMorselContent } from './MorselBlock';
import DecisionGate from './DecisionGate';
import { Image, FileText, Send, User, Bot, Paperclip, Mic, X, Square } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSend: (attachments: Attachment[]) => void;
  isTyping: boolean;
  onDecide: (choiceId: string, notes: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, input, setInput, onSend, isTyping, onDecide }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for attachments and recording
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, attachments]);

  // Handle File Select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        const type = file.type.startsWith('image/') ? 'image' : 'audio';
        
        setAttachments(prev => [...prev, {
            type,
            mimeType: file.type,
            data: base64String
        }]);
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Audio Recording
  const toggleRecording = async () => {
      if (isRecording) {
          // Stop recording
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              mediaRecorderRef.current = new MediaRecorder(stream);
              audioChunksRef.current = [];

              mediaRecorderRef.current.ondataavailable = (event) => {
                  audioChunksRef.current.push(event.data);
              };

              mediaRecorderRef.current.onstop = () => {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // Default to wav/webm
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      const base64String = (reader.result as string).split(',')[1];
                      // Detect mime type from blob or default
                      const mimeType = audioBlob.type || 'audio/wav';
                      setAttachments(prev => [...prev, {
                          type: 'audio',
                          mimeType: mimeType,
                          data: base64String
                      }]);
                  };
                  reader.readAsDataURL(audioBlob);
                  
                  // Stop all tracks
                  stream.getTracks().forEach(track => track.stop());
              };

              mediaRecorderRef.current.start();
              setIsRecording(true);
          } catch (err) {
              console.error("Error accessing microphone:", err);
              alert("Impossible d'accéder au microphone.");
          }
      }
  };

  const handleSendClick = () => {
      onSend(attachments);
      setAttachments([]);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center border border-white/5">
                    <Bot size={40} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">L'orchestrateur est prêt.<br/>Démarrer la conception.</p>
            </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg
              ${msg.role === 'user' ? 'bg-white text-background' : 'bg-primary text-white'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] lg:max-w-[70%] space-y-4`}>
                <div className={`p-4 rounded-3xl ${
                    msg.role === 'user' 
                    ? 'bg-white text-slate-900 rounded-tr-none' 
                    : 'bg-surface border border-white/5 text-slate-200 rounded-tl-none shadow-xl'
                }`}>
                    {/* Attachments Display in History */}
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {msg.attachments.map((att, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden border border-black/10">
                                    {att.type === 'image' ? (
                                        <img 
                                            src={`data:${att.mimeType};base64,${att.data}`} 
                                            alt="attachment" 
                                            className="h-32 w-auto object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="h-12 px-4 bg-slate-100 dark:bg-slate-800 flex items-center gap-2 rounded-lg">
                                            <Mic size={16} />
                                            <span className="text-xs font-mono">Audio Clip</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                        <div className="space-y-2">
                             {/* Only parse morsel for model */}
                             {parseMorselContent(msg.content)}
                        </div>
                    )}
                </div>

                {/* Render Payloads */}
                {msg.payloads?.map((payload, pIdx) => {
                    if (payload.type === 'CHOICE') {
                        return <DecisionGate key={pIdx} payload={payload} onDecide={onDecide} />;
                    }
                    if (payload.type === 'IMAGE_JOB') {
                        return (
                            <div key={pIdx} className="bg-surface rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                                <div className="w-16 h-16 bg-background rounded-xl flex items-center justify-center">
                                    <Image size={24} className="text-primary" />
                                </div>
                                <div>
                                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Image Job Generated</div>
                                    <div className="font-semibold text-white">{payload.filename}</div>
                                    <div className="text-xs text-slate-400 mt-1 font-mono">{payload.dimensions} • {payload.category}</div>
                                </div>
                            </div>
                        )
                    }
                    if (payload.type === 'ARTIFACT') {
                        return (
                             <div key={pIdx} className="bg-surface rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                                <div className="w-16 h-16 bg-background rounded-xl flex items-center justify-center">
                                    <FileText size={24} className="text-secondary" />
                                </div>
                                <div>
                                    <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Artifact Created</div>
                                    <div className="font-semibold text-white">{payload.title}</div>
                                    <div className="text-xs text-slate-400 mt-1 font-mono">
                                        {payload.artifact_type} • {payload.format}
                                        {payload.versioning?.version && ` • v${payload.versioning.version}`}
                                    </div>
                                    {payload.tags && (
                                        <div className="flex gap-1 mt-1">
                                            {payload.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-1 bg-white/10 rounded text-slate-300">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                    return null;
                })}
            </div>
          </div>
        ))}
        {isTyping && (
             <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                </div>
                <div className="bg-surface rounded-3xl rounded-tl-none p-4 border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-150"></div>
                </div>
             </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            
            <div className="relative bg-surface p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="flex gap-2 p-2 overflow-x-auto">
                        {attachments.map((att, i) => (
                            <div key={i} className="relative group/att shrink-0">
                                {att.type === 'image' ? (
                                    <img src={`data:${att.mimeType};base64,${att.data}`} className="h-16 w-16 object-cover rounded-lg border border-white/10" />
                                ) : (
                                    <div className="h-16 w-16 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                                        <Mic size={20} className="text-primary" />
                                    </div>
                                )}
                                <button 
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* Media Buttons */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,audio/*" 
                        onChange={handleFileSelect} 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Upload Image/Audio"
                    >
                        <Paperclip size={20} />
                    </button>

                    <button 
                        onClick={toggleRecording}
                        className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        title="Voice Input"
                    >
                        {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSendClick()}
                        placeholder={isRecording ? "Enregistrement en cours..." : "Décrivez votre intention ou parlez..."}
                        className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none placeholder:text-slate-600 disabled:opacity-50"
                        disabled={isRecording}
                    />
                    <button 
                        onClick={handleSendClick}
                        disabled={(!input.trim() && attachments.length === 0) || isTyping || isRecording}
                        className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            
            <div className="text-center mt-2 flex items-center justify-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">FLOW COGNITIF STRICT • MODE MORSEL • HUMAN-IN-THE-LOOP</span>
                {isRecording && <span className="text-[10px] text-red-400 font-bold animate-pulse">● REC</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;