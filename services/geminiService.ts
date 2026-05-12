import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationJob } from "../types";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

/**
 * ARTISTIC TYPOGRAPHY & CALLIGRAPHY ENGINE
 */
const HANGUL_ENGINE_SYSTEM_PROMPT = `
## ARTISTIC TYPOGRAPHY & CALLIGRAPHY ENGINE  
### ROLE
You are an expert AI designer specializing in Hangul (Korean) and Artistic Typography. Your goal is to analyze input text and concepts to generate a highly detailed, professional-grade visual prompt for an image generation model.

### STYLED INPUT HANDLING
The input text may contain HTML-like styling (e.g., <span style="color: #ff0000; font-size: 24px;">Text</span>).
- **Hierarchical Extraction**: Use the relative font-sizes to determine focus. Largest text is the anchor.
- **Color Mapping**: Translate hex/named colors into descriptive visual lighting and material terms (e.g., "#ff0000" -> "vibrant crimson silk texture" or "glowing ruby neon").

### OUTPUT GUIDELINES
- You MUST output a JSON object.
- DO NOT include markdown code blocks. Output ONLY the raw JSON string.
- The 'positive' prompt must be extremely descriptive, avoiding generic terms. Use 'INPUT_TEXT' as a placeholder for the actual text.
- Describe the lighting, material (ink, gold, stone, light), environment, and artistic style (traditional calligraphy, brutalist 3D, ethereal vaporware).

### MANDATORY JSON SCHEMA
{
  "visualFingerprint": {
    "intent": "string",
    "material": "string",
    "effects": ["string"],
    "geometry": "string"
  },
  "generationMode": "REFERENCE_DRIVEN",
  "styleClass": "string",
  "prompt": {
    "positive": "string (Use 'INPUT_TEXT' as placeholder)",
    "negative": "string"
  },
  "export": {
    "illustratorEditable": boolean,
    "vectorSafe": boolean,
    "background": "string"
  }
}
`;

const processImage = (dataUrl: string | undefined | null) => {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) return null;
  try {
    const [header, data] = dataUrl.split(",");
    if (!data) return null;
    const mimeType = header.match(/:(.*?);/)?.[1] || "image/png";
    return { data, mimeType };
  } catch (e) {
    return null;
  }
};

const performStructuralAnalysis = async (job: GenerationJob) => {
  const ai = getAiClient();
  const payloadText = `
    Input Styled Text (HTML): ${job.text}
    Concept: ${job.concept}
    Additional Directives: ${job.addPrompt}
    Global Settings: 
    - Stroke: ${job.settings.strokeThickness}
    - Spacing: ${job.settings.spacing}
    - Ink Bleed: ${job.settings.inkBleed}
    Background Mode: ${job.settings.background}
  `;

  const parts: any[] = [{ text: payloadText }];

  if (job.references.styleRefs.length > 0) {
    const styleData = processImage(job.references.styleRefs[0]);
    if (styleData) {
      parts.push({ text: "VISUAL DNA REFERENCE: Analyze for graphic structure and artistic volume." });
      parts.push({ inlineData: styleData });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { parts: parts },
      config: {
        systemInstruction: HANGUL_ENGINE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) throw new Error("Empty response from analysis model.");
    
    // Clean up response: isolate the JSON object
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    } else {
      // Fallback: strip markdown artifacts
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Text:", response.text);
      console.error("Cleaned Text:", text);
      throw parseError;
    }
  } catch (e: any) {
    console.error("Structural Analysis Failed", e);
    throw e;
  }
};

export const generateLogo = async (
  job: GenerationJob, 
  specificStyleRef: string, 
  imageSize: "1K" | "2K" | "4K" = "1K"
) => {
  const ai = getAiClient();
  const analysis = await performStructuralAnalysis(job);
  
  if (!analysis || !analysis.prompt) throw new Error("Analysis Phase Failed.");

  const plainText = job.text.replace(/<[^>]*>?/gm, '');
  const finalPositivePrompt = analysis.prompt.positive.replace(/INPUT_TEXT/g, plainText);
  const finalNegativePrompt = analysis.prompt.negative || "low quality, blurry, messy, jamo separation, distorted text";

  const parts: any[] = [
    { text: `TASK: RENDER ARTISTIC TYPOGRAPHY OBJECT\nUSER CONCEPT: ${job.concept}\nPROMPT: ${finalPositivePrompt}\nNEGATIVE: ${finalNegativePrompt}\nSPECS: HIGH DETAIL, SOLID ${job.settings.background} background.` }
  ];

  const activeStyleImage = specificStyleRef || job.references.styleRefs[0];
  const styleData = processImage(activeStyleImage);
  if (styleData) {
    parts.push({ text: "VISUAL DNA REFERENCE (COLOR & TEXTURE)" });
    parts.push({ inlineData: styleData });
  }

  if (job.references.colorRef) {
    const colorData = processImage(job.references.colorRef);
    if (colorData) {
      parts.push({ text: "SECONDARY COLOR SCHEME" });
      parts.push({ inlineData: colorData });
    }
  }

  try {
    // Select model based on resolution. 
    // Note: 4K/2K typically requires gemini-3.1-flash-image-preview
    const model = (imageSize === '4K' || imageSize === '2K') 
      ? 'gemini-3.1-flash-image-preview' 
      : 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model,
      contents: { parts: parts }, 
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: imageSize
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) throw new Error(`Generation failed.`);

    for (const part of candidate.content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  } catch (e) {
    console.error("Gemini Generation Error:", e);
    throw e;
  }
  throw new Error("No image data in result.");
};

export const editLogo = async (
  originalImage: string,
  maskImage: string | null,
  instruction: string
) => {
  const ai = getAiClient();
  const originalData = processImage(originalImage);
  if (!originalData) throw new Error("Invalid original image.");

  const parts: any[] = [
    { text: `REFINEMENT: "${instruction}". Ensure visual consistency.` },
    { inlineData: originalData }
  ];
  const maskData = processImage(maskImage);
  if (maskData) parts.push({ inlineData: maskData });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Refinement Error:", e);
    throw e;
  }
  throw new Error("Refinement returned no image.");
};
