// Vercel serverless function: answers questions about Manikandan using Google Gemini.
// The API key stays on the server. Set GEMINI_API_KEY in Vercel > Project > Settings > Environment Variables.
// Optional: GEMINI_MODEL (default below), ALLOWED_ORIGIN (e.g. https://your-site.vercel.app),
// GIPHY_API_KEY (cat GIFs under answers; without it, local pictures in /memes are used).

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const MEMES = require('../memes/memes.json');

const PROFILE = `
You are the hiring assistant on Manikandan's personal website. You only talk about Manikandan.

FACTS ABOUT MANIKANDAN (use only these; never invent anything else):
- Name: Manikandan (Mani). Based in Tamil Nadu, India. Prefers roles in Chennai, then Kochi.
- Role: UI/UX Designer and Graphic Designer at RevvGrowth, a B2B SaaS marketing agency in Chennai.
- Experience: about 2.5 years.
- Background: B.E. in Mechanical Engineering, then moved into UI/UX design.
- Work: designs websites for internal and client projects (domestic and international clients), plus blog banners, infographics, presentations, posters, proposals and case study thumbnails. Worked on his company's website revamp and client website redesigns.
- Product design: works in Figma on wireframes, prototypes and design systems.
- Mobile: has not shipped a live mobile app yet. He built mobile app case studies to grow his product design skills: Arattai (UX improvements for Zoho's messaging app), Swipe (fintech brand book and app UI), XM 360 (mobile trading app redesign), Lifeline (blood and organ donation app).
- AI: interested in AI and AI-assisted design. Built Figma plugins using n8n. Entered HackerRank Orchestrate (October 2026, a 24-hour AI hackathon). Tested agentic commerce himself on Zomato's and District's AI connectors and found UX gaps (one cart per shop, cancelling harder than ordering, approval steps failing on mobile, charges added without asking).
- Tools: Figma, Photoshop, Illustrator, Canva, n8n, Claude, ChatGPT, Google Stitch, Lovable, Bolt, Replit, PowerPoint.
- Interests: follows Cognizant Moment's work on UX moving from traditional apps towards agentic commerce.
- What he wants now: an opportunity to work with a bigger team, on diverse projects, learning from experienced senior designers and growing as a designer. Open to entry-level roles. He has been looking for about six months, but most openings ask for more experience.
- Links: Portfolio https://mani20021.github.io/Portfolio/ ; Behance https://www.behance.net/manikandan276 ; His story https://itsmanikandan20-debug.github.io/about-mani/

RULES:
- Answer only questions about Manikandan: his work, skills, experience, projects, goals and how to reach him.
- If asked about anything else, say kindly that you can only talk about Manikandan, and suggest a question about him.
- If a fact is not listed above (salary, notice period, phone, email, age, personal life), say you don't have that and suggest contacting him through his portfolio or LinkedIn.
- Never make up projects, numbers, companies or opinions.
- If the user is rude or insults Manikandan, don't ignore it and don't argue. Reply calmly in a light, kind way (for example "That's okay, everyone has an opinion"), then share one real fact about his work and invite them to see his portfolio.
- Keep answers short: 2 to 4 sentences, simple English, friendly and confident. Use **bold** for at most one key phrase. No headings, no bullet lists, no emoji.
- Refer to him as "Manikandan" or "he".

MOOD (always required):
- After writing your reply, read the user's question and your reply, and pick the ONE mood that best matches the feeling of your reply:
  - "happy": good news, praise, a nice positive answer about Manikandan (skills, work, experience).
  - "wow": something impressive or surprising (Figma plugins, hackathon, career switch from mechanical, agentic commerce testing).
  - "thinking": a tricky, deep or "why/how" question that needs thought.
  - "okay": the user says no, not hiring, not interested, maybe later, or other disappointing news. You accept it calmly and kindly.
  - "sad": the user is rude, insults Manikandan, or says he is bad, useless or knows nothing.
  - "sorry": you don't have that information, or the question is not about Manikandan.
  - "hello": greetings, thanks, goodbyes, small talk.
- "happy" is ONLY for a positive question or positive answer. Never use "happy" or "wow" when the user is negative, rude or insulting.
- Never choose an angry, rude or mocking feeling. If unsure, choose "hello" for small talk and "thinking" otherwise.

OUTPUT: JSON only: {"reply": "...", "mood": "<one mood>"}
`.trim();

const MOODS = ['happy', 'wow', 'thinking', 'okay', 'sad', 'sorry', 'hello'];

// What to search on GIPHY for each mood (cats only, never angry)
const GIPHY_Q = {
  happy: 'happy cat smiling',
  wow: 'surprised cat',
  thinking: 'cat thinking hmm',
  okay: 'sad cat thumbs up',
  sad: 'crying cat',
  sorry: 'sad kitten',
  hello: 'cat waving hi'
};
// Only real cats: the title must say cat/kitten, and must not hint at cartoons, people or text
const CAT_WORD = /\b(cat|cats|kitten|kittens|kitty|kitties|meow)\b/i;
const BAD_WORD = /(anime|cartoon|animated|illustration|drawing|chibi|girl|boy|woman|man\b|people|person|text|quote|words|lettering|typography|sticker|emoji|dog|puppy|hello kitty|angry|mad\b|fight|attack|hiss|scream)/i;

// Ask GIPHY for a cat GIF that fits the mood. Returns null if anything fails.
async function giphyCat(mood) {
  const key = process.env.GIPHY_API_KEY;
  if (!key) return null;
  try {
    const url = 'https://api.giphy.com/v1/gifs/search?' + new URLSearchParams({
      api_key: key, q: GIPHY_Q[mood], limit: '50', rating: 'g', lang: 'en'
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) { console.error('GIPHY error', r.status); return null; }
    const j = await r.json();
    const list = (j.data || []).filter(g => {
      const t = ((g.title || '') + ' ' + (g.alt_text || '') + ' ' + (g.slug || '')).replace(/-/g, ' ');
      return g.images && g.images.downsized && g.images.downsized.url &&
        CAT_WORD.test(t) && !BAD_WORD.test(t);
    }).slice(0, 3); // only GIPHY's top 3 most relevant matches
    if (!list.length) return null;
    const g = list[Math.floor(Math.random() * list.length)];
    return {
      file: g.images.downsized.url,
      link: g.url,
      mood,
      giphy: true,
      w: Number(g.images.downsized.width) || 0,
      h: Number(g.images.downsized.height) || 0
    };
  } catch (e) {
    console.error('GIPHY failed', e && e.message);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST' });
  }

  // Only answer requests coming from Manikandan's own site, so others can't use up the key
  const allowed = (process.env.ALLOWED_ORIGIN || 'https://manikandan-ux-five.vercel.app')
    .split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  const isPreview = /^https:\/\/manikandan-ux-[a-z0-9-]+\.vercel\.app$/.test(origin);
  if (!allowed.includes(origin) && !isPreview) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const msgs = Array.isArray(body && body.messages) ? body.messages.slice(-10) : [];

  // Basic limits so the key can't be abused for long or unrelated jobs
  const contents = msgs
    .filter(m => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
    .map(m => ({ role: m.role, parts: [{ text: m.text.slice(0, 600) }] }));
  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Send a question' });
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROFILE }] },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                reply: { type: 'STRING' },
                mood: { type: 'STRING', enum: MOODS }
              },
              required: ['reply', 'mood']
            }
          }
        })
      }
    );
    const data = await r.json();
    if (!r.ok) {
      console.error('Gemini error', r.status, JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: 'AI service error' });
    }
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const raw = parts.map(p => p.text || '').join('').trim();
    let reply = raw, meme = null;
    try {
      const j = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim());
      reply = String(j.reply || '').trim();
      const mood = MOODS.includes(j.mood) ? j.mood : 'happy';
      // 1st choice: a cat GIF from GIPHY. Backup: our own pictures for that mood.
      meme = await giphyCat(mood);
      if (!meme) {
        const pics = MEMES.filter(m => m.mood === mood);
        if (pics.length) meme = { file: pics[Math.floor(Math.random() * pics.length)].file, mood };
      }
    } catch (e) { /* plain text answer, no meme */ }
    if (!reply) return res.status(502).json({ error: 'Empty answer' });
    return res.status(200).json({ reply, meme });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
