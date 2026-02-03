import { GoogleGenAI } from "@google/genai";
import { Message, AnyPayload, Attachment } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey });
}

// Helper to extract JSON blocks from text
const extractPayloads = (text: string): { cleanedText: string; payloads: AnyPayload[] } => {
    let cleanedText = text;
    const payloads: AnyPayload[] = [];

    // Regex for different payload types
    const patterns = [
        { regex: /<<<CHOICE_PAYLOAD([\s\S]*?)CHOICE_PAYLOAD>>>/g, type: 'CHOICE' },
        { regex: /<<<ARTIFACT_PAYLOAD([\s\S]*?)ARTIFACT_PAYLOAD>>>/g, type: 'ARTIFACT' },
        { regex: /<<<IMAGE_JOB([\s\S]*?)IMAGE_JOB>>>/g, type: 'IMAGE_JOB' },
        { regex: /<<<MODULE_CONFIDENCE_REPORT([\s\S]*?)MODULE_CONFIDENCE_REPORT>>>/g, type: 'CONFIDENCE' },
    ];

    patterns.forEach(({ regex, type }) => {
        cleanedText = cleanedText.replace(regex, (match, jsonString) => {
            try {
                const parsed = JSON.parse(jsonString.trim());
                
                if(type === 'ARTIFACT') parsed.type = 'ARTIFACT'; 
                if(type === 'CHOICE') parsed.type = 'CHOICE';
                if(type === 'IMAGE_JOB') parsed.type = 'IMAGE_JOB';
                if(type === 'CONFIDENCE') parsed.type = 'CONFIDENCE';
                
                // For artifacts, map the API 'type' field (ADR/ARCH) to 'artifact_type' to avoid collision with our discriminating union
                if(type === 'ARTIFACT' && parsed.type === 'ARTIFACT' && parsed.type) {
                     parsed.artifact_type = parsed.type; // save "ADR"
                     parsed.type = 'ARTIFACT'; // restore payload type
                }
                
                payloads.push(parsed as AnyPayload);
            } catch (e) {
                console.error(`Failed to parse ${type} JSON`, e);
            }
            return ""; // Remove the JSON block from visible text
        });
    });

    return { cleanedText, payloads };
};

export const sendMessageToAgent = async (
    history: Message[], 
    newMessageContent: string,
    attachments: Attachment[] = []
): Promise<{ content: string; payloads: AnyPayload[] }> => {
    try {
        const ai = getClient();
        
        // Format history for the model, including previous attachments
        const chatHistory = history.map(msg => {
            const parts: any[] = [{ text: msg.content }];
            
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    parts.push({
                        inlineData: {
                            mimeType: att.mimeType,
                            data: att.data
                        }
                    });
                });
            }
            
            return {
                role: msg.role,
                parts: parts
            };
        });

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash-preview', // Supports native audio/images
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.7, 
            },
            history: chatHistory
        });

        // Construct current message parts
        const currentParts: any[] = [{ text: newMessageContent }];
        attachments.forEach(att => {
             currentParts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: att.data
                }
            });
        });

        const result = await chat.sendMessage({ 
            message: { 
                role: 'user', 
                parts: currentParts 
            } 
        });

        const rawText = result.text || "";
        
        const { cleanedText, payloads } = extractPayloads(rawText);
        return { content: cleanedText, payloads };

    } catch (error) {
        console.error("Gemini Error:", error);
        return { 
            content: "⚠️ Une erreur est survenue lors de la communication avec l'agent. " + (error instanceof Error ? error.message : ""), 
            payloads: [] 
        };
    }
};