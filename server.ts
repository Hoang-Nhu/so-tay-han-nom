import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT =
  process.env.NODE_ENV === 'production'
    ? Number(process.env.PORT) || 3000
    : 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';
const FALLBACK_GEMINI_MODEL = 'gemini-3.8-flash';

const SYSTEM_INSTRUCTION =
  'Bạn là một Chuyên Gia Hán Nôm học và Văn hóa Cổ Việt Nam uyên thâm. Hãy trả lời bằng tiếng Việt chuẩn mực, trang nhã, dễ hiểu. Khi giải mã câu đối, hoành phi, chữ Hán hoặc chữ Nôm, hãy cung cấp: 1) Chữ Hán / Chữ Nôm gốc, 2) Phiên âm Hán Việt chuẩn, 3) Dịch nghĩa tiếng Việt rõ ràng, 4) Chiết tự (nếu phù hợp), 5) Ý nghĩa văn hóa, tâm linh và vị trí treo phù hợp.';

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

let cachedWorkingKey: string | null = null;

function sanitizeSecret(raw: string | undefined): string {
  return (raw || '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
}

function getCandidateApiKeys(): string[] {
  const rawCandidates = [
    cachedWorkingKey ?? undefined,
    process.env.GEMINI_API_KEY,
    process.env.Key_ChatBot,
  ];
  const valid = rawCandidates
    .map(sanitizeSecret)
    .filter(k => k.length > 0 && k !== 'MY_GEMINI_API_KEY');
  return Array.from(new Set(valid));
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractStatusCode(err: unknown): number {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { status?: unknown; code?: unknown; cause?: { status?: unknown } };
    if (typeof anyErr.status === 'number') return anyErr.status;
    if (typeof anyErr.code === 'number') return anyErr.code;
    if (anyErr.cause && typeof anyErr.cause.status === 'number') return anyErr.cause.status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('401')) return 401;
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) return 403;
  if (msg.includes('404') || msg.includes('NOT_FOUND')) return 404;
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  if (msg.includes('400') || msg.includes('API_KEY_INVALID')) return 400;
  return 500;
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  maxRetries = 2
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (err) {
      lastError = err;
      const status = extractStatusCode(err);
      const isRetryable = status === 429 || status === 503 || status === 500;
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 600 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

async function generateWithFallback(
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<{ text: string; model: string }> {
  const candidateKeys = getCandidateApiKeys();
  if (candidateKeys.length === 0) {
    throw Object.assign(new Error('GEMINI_API_KEY_MISSING'), { status: 503 });
  }

  let lastError: unknown;

  for (const apiKey of candidateKeys) {
    const ai = createGeminiClient(apiKey);
    const modelsToTry = [GEMINI_MODEL, FALLBACK_GEMINI_MODEL];

    for (const model of modelsToTry) {
      try {
        const response = await generateWithModel(ai, model, contents);
        cachedWorkingKey = apiKey;
        return {
          text: (response.text || '').trim(),
          model,
        };
      } catch (err) {
        lastError = err;
        const status = extractStatusCode(err);
        if (status === 404 && model !== FALLBACK_GEMINI_MODEL) {
          continue;
        }
        if (status === 401 || status === 403 || status === 400) {
          // Try next configured secret key if available
          break;
        }
        throw err;
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint (never exposes secret values)
  app.get('/api/health', (_req: Request, res: Response) => {
    const candidateKeys = getCandidateApiKeys();
    res.json({
      ok: true,
      geminiConfigured: candidateKeys.length > 0,
      model: GEMINI_MODEL,
    });
  });

  // Server-side Gemini AI chat endpoint
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    if (getCandidateApiKeys().length === 0) {
      res.status(503).json({
        error:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng thiết lập Secret GEMINI_API_KEY trong Settings > Secrets.',
        code: 'GEMINI_API_KEY_MISSING',
      });
      return;
    }

    const body = req.body as { prompt?: unknown; history?: unknown };
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      res.status(400).json({
        error: 'Vui lòng nhập nội dung câu hỏi hợp lệ.',
        code: 'INVALID_PROMPT',
      });
      return;
    }

    if (prompt.length > 4000) {
      res.status(400).json({
        error: 'Nội dung câu hỏi quá dài (tối đa 4000 ký tự).',
        code: 'PROMPT_TOO_LONG',
      });
      return;
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const safeHistory: ChatHistoryItem[] = rawHistory
      .filter(
        (item): item is ChatHistoryItem =>
          typeof item === 'object' &&
          item !== null &&
          ((item as ChatHistoryItem).role === 'user' || (item as ChatHistoryItem).role === 'model') &&
          typeof (item as ChatHistoryItem).text === 'string' &&
          (item as ChatHistoryItem).text.trim().length > 0
      )
      .slice(-10)
      .map(item => ({
        role: item.role,
        text: item.text.trim().slice(0, 4000),
      }));

    const contents = [
      ...safeHistory.map(item => ({
        role: item.role,
        parts: [{ text: item.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: prompt }],
      },
    ];

    try {
      const { text: replyText, model } = await generateWithFallback(contents);

      if (!replyText) {
        res.status(502).json({
          error: 'Mô hình AI không trả về nội dung phản hồi. Vui lòng thử lại.',
          code: 'EMPTY_RESPONSE',
        });
        return;
      }

      res.json({
        reply: replyText,
        model,
      });
    } catch (err: unknown) {
      const status = extractStatusCode(err);
      const rawMessage = err instanceof Error ? err.message : 'Lỗi không xác định từ Gemini API';

      let userMessage = 'Không thể kết nối tới dịch vụ Gemini AI. Vui lòng thử lại sau.';
      if (status === 400 || status === 401 || status === 403) {
        userMessage =
          'Khóa Gemini API chưa hợp lệ hoặc chưa được cấp quyền. Vui lòng kiểm tra lại GEMINI_API_KEY trong Settings > Secrets.';
      } else if (status === 404) {
        userMessage = `Không tìm thấy mô hình ${GEMINI_MODEL}. Vui lòng kiểm tra cấu hình mô hình.`;
      } else if (status === 429) {
        userMessage = 'Hệ thống AI đang tạm thời quá tải hạn mức. Vui lòng thử lại sau giây lát.';
      }

      console.error(`[Gemini API Error ${status}]:`, rawMessage);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: userMessage,
        code: `GEMINI_ERROR_${status}`,
      });
    }
  });

  // Unknown /api/* routes return JSON 404
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (model: ${GEMINI_MODEL})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
