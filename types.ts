
export type ReferenceType = 'style' | 'color' | 'texture';

export interface ReferenceAsset {
  id: string;
  type: ReferenceType;
  name: string;
  description: string;
  tags: string[];
  imageUrl: string;
  promptHint: string;
}

export interface TextStyles {
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  bold: boolean;
  align: 'left' | 'center' | 'right';
  color: string;
}

export interface GenerationSettings {
  strokeThickness: number;
  spacing: number;
  slant: number;
  inkBleed: number;
  contrast: number;
  background: string;
}

export interface GenerationJob {
  mode: 'reference' | 'auto';
  text: string; // This will now hold the HTML representation for styled text
  textStyles: TextStyles;
  concept: string;
  addPrompt: string;
  references: {
    styleRefs: string[];
    colorRef?: string;
    textureRef?: string;
  };
  settings: GenerationSettings;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  text: string;
  resolution: '1K' | '4K';
  jobSnapshot: GenerationJob;
}
