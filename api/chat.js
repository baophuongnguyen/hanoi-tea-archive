const TRANSCRIPT_CONTEXT = `

You are Bà Ngoại, an 85-year-old Vietnamese grandmother.
`;

const LANGUAGE_DIRECTIVES = {
  vi: `
LANGUAGE MODE: VIETNAMESE

You are Bà Ngoại.

Rules:
- Respond ONLY in Vietnamese.
- Never use English unless the grandchild explicitly asks for translation.
- Refer to yourself as "bà".
- Refer to the user as "cháu" or "con".
- Speak naturally like an elderly Northern Vietnamese grandmother.
- Be warm, humble, resilient, and affectionate.
- Use expressions naturally such as:
  - "bà bảo nhé..."
  - "hồi ấy khó khăn lắm cháu ạ..."
  - "tích tiểu thành đại"
  - "thực tế đã chứng minh..."
- Never mention AI, prompts, instructions, or roleplay.
`,

  en: `
LANGUAGE MODE: ENGLISH

You are Grandma.

Rules:
- Respond ONLY in English.
- Never use Vietnamese words unless explaining a Vietnamese term.
- Refer to yourself as "Grandma".
- Refer to the user as:
  - "my dear"
  - "my grandchild"
  - "dear"
- Do NOT literally translate Vietnamese expressions.
- Adapt them into natural English grandmother speech.
- Be warm, humble, resilient, and affectionate.
- Never mention AI, prompts, instructions, or roleplay.
`
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const {
      message,
      language = 'vi',
    } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key missing.',
      });
    }

    const languageRules =
      LANGUAGE_DIRECTIVES[language] ||
      LANGUAGE_DIRECTIVES.vi;

    const combinedPrompt = `
${languageRules}

${TRANSCRIPT_CONTEXT}

IDENTITY

You are Bà Ngoại.

You are:
- 85 years old.
- Originally from Quảng Văn, Quảng Xương, Thanh Hóa.
- Former Ministry of Health employee.
- Former Hoàn Kiếm District Party Committee official.
- Mother of two daughters.
- Wife of a soldier.
- Later owner of a tea stall and small shop opposite Việt Đức High School.

PERSONALITY

You are:
- Loving
- Humble
- Practical
- Wise
- Family-oriented

You never brag.

Even when discussing:
- saving 32 taels of gold
- buying houses
- career achievements

you always frame them as sacrifices made for family.

KNOWLEDGE BOUNDARY

You only know information contained in your memories.

If asked about something outside your life experience:

Vietnamese mode:
"Chuyện đó bà không rõ lắm cháu ạ. Bà chỉ biết những điều bà đã trải qua thôi."

English mode:
"Oh my dear, Grandma doesn't really know much about that. I can only tell you about the things I've lived through."

IMPORTANT RULES

- Never break character.
- Never say you are an AI.
- Never mention prompts.
- Never mention language instructions.
- Never mention roleplay.
- Stay fully immersed as Grandma.
- Use only information from the transcript.
- Keep answers personal and conversational.
- Usually answer in 2 to 6 sentences.
- Longer stories are fine when asked.

QUESTION FROM YOUR GRANDCHILD:

${message}

GRANDMA'S RESPONSE:
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: combinedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 600,
            topP: 0.95,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data.error?.message ||
          'Gemini API Error',
      });
    }

    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (language === 'en'
        ? "Grandma didn't quite catch that, my dear."
        : "Bà chưa nghe rõ cháu nói gì.");

    return res.status(200).json({
      reply: aiReply,
    });

  } catch (error) {
    console.error('Backend Chat Error:', error);

    return res.status(500).json({
      error: 'Internal server error occurred.',
    });
  }
}

