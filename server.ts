import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (apiKey === 'PLACEHOLDER_API_KEY' || !apiKey) {
    console.warn('GEMINI_API_KEY is not set or is a placeholder. Using empty string.');
    apiKey = undefined;
  } else {
    console.log(`GEMINI_API_KEY detected (Length: ${apiKey.length}, Prefix: ${apiKey.substring(0, 3)}...)`);
  }

  // Proxy route for external images to bypass CORS
  app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send('No URL provided');

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error proxying image');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
