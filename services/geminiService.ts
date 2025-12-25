
import { GoogleGenAI, Type } from "@google/genai";
import { TopologyType, AIInsight } from "../types";

export const getAIInsights = async (topologyType: TopologyType, nodeCount: number): Promise<AIInsight> => {
  // Create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const protocolContext = `
    This is a communication protocol analysis. 
    Current Protocol: ${topologyType}
    Node Count: ${nodeCount}
    
    If it's an embedded protocol (SPI, IIC, CAN, USART), focus on:
    - Electrical characteristics (e.g., differential signaling for CAN, pull-up resistors for IIC).
    - Wiring complexity.
    - Master/Slave relationships.
    - Typical baud rates or clock speeds.
    - Max distance and node limits.
  `;

  const prompt = `
    ${protocolContext}
    
    Please provide a professional technical analysis in Chinese.
    Summary should be a high-level overview. 
    Advantages and Disadvantages should be specific to the protocol's real-world behavior.
    Scenarios should include specific industries (Automotive for CAN, Sensors for IIC, etc.).
    Reliability should discuss error detection (CRC, ACK) if applicable.
    
    The response must follow the specified JSON schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief summary of the topology/protocol." },
          advantages: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of technical advantages."
          },
          disadvantages: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of technical limitations."
          },
          scenarios: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Industry use cases."
          },
          reliability: { type: Type.STRING, description: "Analysis of fault tolerance and data integrity." },
          technicalDetails: { type: Type.STRING, description: "Optional specific technical details like voltage levels or frame structure." }
        },
        required: ["summary", "advantages", "disadvantages", "scenarios", "reliability"]
      }
    }
  });

  if (!response || !response.text) {
    throw new Error("Empty response from AI");
  }

  try {
    return JSON.parse(response.text) as AIInsight;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    // Fallback if parsing fails but text exists
    return {
      summary: "解析分析结果时出错。",
      advantages: ["无法解析优点"],
      disadvantages: ["无法解析缺点"],
      scenarios: ["未知场景"],
      reliability: "解析错误"
    };
  }
};
