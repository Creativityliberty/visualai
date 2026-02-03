import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ContextPanel from './components/ContextPanel';
import { Message, WorkspaceState, AnyPayload, Attachment } from './types';
import { INITIAL_WORKSPACE } from './constants';
import { sendMessageToAgent } from './services/geminiService';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceState>(INITIAL_WORKSPACE);

  const handleSend = async (attachments: Attachment[] = []) => {
    if (!input.trim() && attachments.length === 0) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Agent with history, new text, and new attachments
    const response = await sendMessageToAgent(messages.concat(userMsg), input, attachments);

    setIsTyping(false);

    const modelMsg: Message = {
      role: 'model',
      content: response.content,
      timestamp: new Date(),
      payloads: response.payloads
    };

    setMessages(prev => [...prev, modelMsg]);

    // Update Workspace State based on Payloads
    updateWorkspaceState(response.payloads);
  };

  const handleDecide = async (choiceId: string, notes: string) => {
    // Send choice back to agent as a user message, formatted specifically
    const choiceMsgContent = `<<<CHOIX_UTILISATEUR { "choice_id": "${choiceId}", "notes": "${notes}" } CHOIX_UTILISATEUR>>>`;
    
    const userMsg: Message = {
        role: 'user',
        content: `Choice selected: ${choiceId}. ${notes}`,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Continue the flow
    const response = await sendMessageToAgent(messages.concat(userMsg), choiceMsgContent);
    
    setIsTyping(false);
    
    const modelMsg: Message = {
        role: 'model',
        content: response.content,
        timestamp: new Date(),
        payloads: response.payloads
    };

    setMessages(prev => [...prev, modelMsg]);
    updateWorkspaceState(response.payloads);
  };

  const updateWorkspaceState = (payloads: AnyPayload[]) => {
      if (!payloads) return;
      
      const newImages = payloads.filter(p => p.type === 'IMAGE_JOB');
      const newArtifacts = payloads.filter(p => p.type === 'ARTIFACT');
      
      if (newImages.length > 0 || newArtifacts.length > 0) {
          setWorkspace(prev => ({
              ...prev,
              images: [...prev.images, ...newImages as any],
              artifacts: [...prev.artifacts, ...newArtifacts as any]
          }));
      }
  };

  return (
    <div className="flex h-screen w-full bg-background text-slate-200 overflow-hidden font-sans selection:bg-primary/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex overflow-hidden relative z-0">
         {/* Background Ambient Glow */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
            <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px]"></div>
         </div>

         <ChatArea 
            messages={messages} 
            input={input} 
            setInput={setInput} 
            onSend={handleSend}
            isTyping={isTyping}
            onDecide={handleDecide}
         />
         
         <ContextPanel workspace={workspace} activeTab={activeTab} />
      </main>
    </div>
  );
};

export default App;