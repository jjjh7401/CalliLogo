
import { ReferenceAsset } from './types';

export const STYLES: ReferenceAsset[] = [
  { id: 's1', type: 'style', name: 'Traditional Brush', description: 'Classic oriental ink brush strokes', tags: ['oriental', 'traditional'], imageUrl: 'https://picsum.photos/seed/s1/200/200', promptHint: 'heavy traditional oriental ink brush calligraphy, dynamic strokes' },
  { id: 's2', type: 'style', name: 'Modern Signature', description: 'Clean, elegant handwritten style', tags: ['modern', 'elegant'], imageUrl: 'https://picsum.photos/seed/s2/200/200', promptHint: 'modern elegant signature style, minimalist thin strokes' },
  { id: 's3', type: 'style', name: 'Gothic Bold', description: 'Strong, geometric medieval strokes', tags: ['vintage', 'bold'], imageUrl: 'https://picsum.photos/seed/s3/200/200', promptHint: 'gothic blackletter calligraphy, high contrast geometric strokes' },
  { id: 's4', type: 'style', name: 'Minimalist Monoline', description: 'Simple, consistent stroke weight', tags: ['minimal', 'clean'], imageUrl: 'https://picsum.photos/seed/s4/200/200', promptHint: 'minimalist monoline calligraphy, consistent line weight' },
  { id: 's5', type: 'style', name: 'Wild Abstract', description: 'Energetic and expressive movements', tags: ['expressive', 'artistic'], imageUrl: 'https://picsum.photos/seed/s5/200/200', promptHint: 'abstract expressive calligraphy, splatters and energetic movements' },
  { id: 's6', type: 'style', name: 'Elegant Cursive', description: 'Flowing and romantic lettering', tags: ['luxury', 'soft'], imageUrl: 'https://picsum.photos/seed/s6/200/200', promptHint: 'romantic flowing cursive lettering, elegant loops' },
  { id: 's7', type: 'style', name: 'Retro Script', description: 'Mid-century advertising style', tags: ['retro', 'vintage'], imageUrl: 'https://picsum.photos/seed/s7/200/200', promptHint: 'retro mid-century advertising script, bold vintage lettering' },
  { id: 's8', type: 'style', name: 'Handmade Marker', description: 'Casual, street-style felt pen', tags: ['casual', 'urban'], imageUrl: 'https://picsum.photos/seed/s8/200/200', promptHint: 'casual felt pen marker lettering, street style' },
  // ... Adding more to reach near 30
  ...Array.from({ length: 22 }).map((_, i) => ({
    id: `s_extra_${i}`,
    type: 'style' as const,
    name: `Style Variant ${i + 9}`,
    description: 'Professional calligraphy style',
    tags: ['design'],
    imageUrl: `https://picsum.photos/seed/style${i+9}/200/200`,
    promptHint: 'professional custom calligraphy'
  }))
];

export const COLORS: ReferenceAsset[] = [
  { id: 'c1', type: 'color', name: 'Luxury Gold', description: 'Premium metallic gold finish', tags: ['gold', 'luxury'], imageUrl: 'https://picsum.photos/seed/c1/200/200', promptHint: 'rich metallic gold color with reflective highlights' },
  { id: 'c2', type: 'color', name: 'Midnight Navy', description: 'Deep, mysterious dark blue', tags: ['dark', 'premium'], imageUrl: 'https://picsum.photos/seed/c2/200/200', promptHint: 'deep midnight navy blue, matte finish' },
  { id: 'c3', type: 'color', name: 'Rose Copper', description: 'Warm and trendy metallic hue', tags: ['warm', 'modern'], imageUrl: 'https://picsum.photos/seed/c3/200/200', promptHint: 'warm rose copper metallic sheen' },
  { id: 'c4', type: 'color', name: 'Forest Green', description: 'Natural, earthy deep green', tags: ['nature', 'calm'], imageUrl: 'https://picsum.photos/seed/c4/200/200', promptHint: 'deep earthy forest green' },
  { id: 'c5', type: 'color', name: 'Monochrome Black', description: 'Pure, absolute black ink', tags: ['classic', 'minimal'], imageUrl: 'https://picsum.photos/seed/c5/200/200', promptHint: 'deep obsidian black ink' },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `c_extra_${i}`,
    type: 'color' as const,
    name: `Color Palette ${i + 6}`,
    description: 'Designer color scheme',
    tags: ['art'],
    imageUrl: `https://picsum.photos/seed/color${i+6}/200/200`,
    promptHint: 'vibrant artistic colors'
  }))
];

export const TEXTURES: ReferenceAsset[] = [
  { id: 't1', type: 'texture', name: 'Handmade Paper', description: 'Rough fibrous paper texture', tags: ['paper', 'vintage'], imageUrl: 'https://picsum.photos/seed/t1/200/200', promptHint: 'rough fibrous handmade paper texture background' },
  { id: 't2', type: 'texture', name: 'Ink Bleed', description: 'Natural spread of ink on paper', tags: ['ink', 'organic'], imageUrl: 'https://picsum.photos/seed/t2/200/200', promptHint: 'organic ink bleeding effect on damp paper' },
  { id: 't3', type: 'texture', name: 'Brushed Metal', description: 'Sleek industrial metal finish', tags: ['modern', 'metal'], imageUrl: 'https://picsum.photos/seed/t3/200/200', promptHint: 'horizontal brushed metal texture' },
  { id: 't4', type: 'texture', name: 'Oil Canvas', description: 'Classic artistic canvas weave', tags: ['art', 'classic'], imageUrl: 'https://picsum.photos/seed/t4/200/200', promptHint: 'coarse oil painting canvas weave' },
  { id: 't5', type: 'texture', name: 'Leather Grain', description: 'Sophisticated textured leather', tags: ['luxury', 'warm'], imageUrl: 'https://picsum.photos/seed/t5/200/200', promptHint: 'fine-grained luxury leather texture' },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `t_extra_${i}`,
    type: 'texture' as const,
    name: `Texture Pattern ${i + 6}`,
    description: 'Unique surface material',
    tags: ['surface'],
    imageUrl: `https://picsum.photos/seed/texture${i+6}/200/200`,
    promptHint: 'complex surface texture'
  }))
];
