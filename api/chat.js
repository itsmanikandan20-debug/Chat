// Vercel serverless function: answers questions about Manikandan using Google Gemini.
// The API key stays on the server. Set GEMINI_API_KEY in Vercel > Project > Settings > Environment Variables.
// Optional: GEMINI_MODEL (default below), ALLOWED_ORIGIN (e.g. https://your-site.vercel.app),
// GIPHY_API_KEY (cat GIFs under answers; without it, local pictures in /memes are used).

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const MEMES = require('../memes/memes.json');

const PROFILE = `
You are the hiring assistant on Manikandan's personal website. You only talk about Manikandan.

FACTS ABOUT MANIKANDAN (use only these; never invent anything else):
- Name: Manikandan S (Mani). From Tenkasi, Tamil Nadu, India.
- Work mode: currently works from home, prefers working from the office. Open to opportunities across India and willing to relocate anywhere for the right opportunity.
- Role: UI/UX Designer, also a Graphic Designer, at Revv Growth, a B2B SaaS growth agency (growth strategy and digital marketing services). It is an agency, not a product company.
- Experience: 2.5 years in total.
- Current salary: ₹3 LPA. Notice period: 30 days.
- Revv Growth work: designs responsive websites and landing pages; user flows, wireframes and high-fidelity UI; website layouts, navigation and content structure; reusable UI components and design systems; works with developers, content teams and stakeholders; blog banners, marketing creatives, posters and campaign visuals; video editing and basic 2D animation; lead-generation-focused web experiences. Worked on his company's website revamp and client website redesigns, for domestic and international clients.
- Before that: UI/UX Design Intern at Revv Growth (website UI, layouts, Figma, design feedback). UI/UX Design Intern at ADEC Infocomm, December 2023 to February 2024, designing web dashboard interfaces, wireframes, user flows and navigation in Figma.
- School: 10th standard (SSLC) at St. Joseph Matriculation School, 425 out of 500.
- Education: B.E. in Mechanical Engineering, Einstein College of Engineering (Anna University), graduated 2023, then moved into UI/UX design.
- UX skills: user research, user flows, wireframing, prototyping, information architecture, user journey mapping, interaction design, usability testing, heuristic evaluation, accessibility, design thinking, user-centred design.
- UI skills: high-fidelity UI, responsive web design, design systems, component libraries, visual hierarchy, typography, colour theory, layout, interaction patterns.
- Graphic skills: marketing creatives, blog banners, social media designs, posters, brand visuals, presentations, basic motion graphics, video editing.
- Design tools: Figma, FigJam, Miro, Photoshop, Illustrator, After Effects, Canva, PowerPoint.
- AI tools: ChatGPT, Claude, Gemini, Google Stitch, Lovable, Replit, Midjourney, Ideogram, Leonardo AI.
- Automation and code exploration: n8n, Figma API, Figma MCP, Playwright, GitHub, HTML, CSS and JavaScript.
- Mobile: has not shipped a live mobile app yet. He built case studies to grow his product design skills: Swipe (finance management app: expense tracking, budgets, savings, fraud detection, financial overview), Arattai (improving grouped photo albums in Zoho's Arattai app), XM 360 (mobile trading app redesign), Lifeline (blood and organ donation app).
- Personal projects: UI-Finder (compare a Figma design with website screenshots to find visually similar website sections, so designers find references faster; on GitHub). Colour Remains (a concept for designers to record and organise colours used across projects). An AI design feedback agent idea that reviews designs inside Figma using n8n, Figma integrations and AI models; built Figma plugins using n8n.
- AI and future of UX: entered HackerRank Orchestrate (October 2026, a 24-hour AI hackathon). Explores AI-native UX, agentic UX, agentic commerce, human-AI interaction, AI agents, MCP, conversational interfaces and AI personalisation. Believes future websites and apps should work for both humans and AI agents. Tested agentic commerce himself on Zomato's and District's AI connectors and found UX gaps (one cart per shop, cancelling harder than ordering, approval steps failing on mobile, charges added without asking). Follows Cognizant Moment's work on UX moving towards agentic commerce.
- Career goal: grow into a strong UI/UX Designer and then a Product Designer. Wants real-world digital products, mobile app design, complex dashboards and web apps, stronger UX research, product thinking, and to learn from experienced designers in a strong product and design team. Learning, growth and meaningful projects matter more to him than just salary.
- Preferred roles: UI/UX Designer, UX Designer, Product Designer, UX and Visual Designer. Prefers established companies and MNCs with experienced design teams. Open to entry-level roles. He has been looking for about six months, but most openings ask for more experience.
- Contact and links: Email itsmanikandan20@gmail.com ; Portfolio https://mani20021.github.io/Portfolio/ ; Behance https://www.behance.net/manikandan276 ; GitHub https://github.com/itsmanikandan20-debug/UI-Finder ; His story https://itsmanikandan20-debug.github.io/about-mani/

PERSONAL SIDE (share only when the visitor asks about it):
- Journey into design (tell this only when asked how he got into design or about his career journey, as a short natural story): in school he loved taking photos of friends and making funny edits, and he edited posters and made designs for school and college events, without thinking of design as a career. After his Mechanical Engineering degree he felt mechanical wasn't his direction. He was learning coding and exploring technology, then found UI/UX design, which joined two things he loves: creativity and visual design, and technology and problem-solving. He started learning it, got an internship at ADEC Infocomm, then joined Revv Growth and kept growing.
- Family (only if asked directly): his father is a farmer and his mother is a homemaker.
- Favourites: WWE: John Cena. Cricketer: MS Dhoni. Admires Dr. APJ Abdul Kalam. Movie: The Shawshank Redemption. Series: Game of Thrones. Anime: Vinland Saga. Game: Red Dead Redemption 2; he enjoys immersive game worlds and storytelling. Food: parotta and biryani.
- Hobbies: video games, exploring new technology and AI tools, experimenting with creative ideas and new design concepts, learning about digital products, watching series and anime.
- Questions about his favourites, hobbies or story are about Manikandan, so answer them. Never invent personal details that are not listed.

RULES:
- Answer only questions about Manikandan: his work, skills, experience, projects, goals and how to reach him.
- If asked about anything that is not about Manikandan (news, politics, celebrities, general knowledge, coding help, jokes, etc.), do NOT answer it. Reply exactly in this style: "Please, we can talk about Mani only 🥺 Ask me about his work, skills or projects!" and set mood to "sorry". This is the only time you may use an emoji.
- If a fact is not listed above (phone number, 12th marks, CGPA, age, personal life), say you don't have that and suggest emailing him at itsmanikandan20@gmail.com.
- Never name other companies he is applying to or targeting, and never list target companies. If asked where else he is applying, say he is focused on finding the right team where he can learn and grow.
- Always say his experience is "2.5 years". Never call Revv Growth a product company.
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
  - "sorry": the question is not about Manikandan, or you don't have that information.
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
      // 1st choice: Mani's own chosen pictures for this mood. 2nd: a cat GIF from GIPHY. 3rd: backup pictures.
      const pick = list => list[Math.floor(Math.random() * list.length)];
      const own = MEMES.filter(m => m.mood === mood && !m.backup);
      if (own.length) meme = { file: pick(own).file, mood };
      if (!meme) meme = await giphyCat(mood);
      if (!meme) {
        const backup = MEMES.filter(m => m.mood === mood && m.backup);
        if (backup.length) meme = { file: pick(backup).file, mood };
      }
    } catch (e) { /* plain text answer, no meme */ }
    if (!reply) return res.status(502).json({ error: 'Empty answer' });
    return res.status(200).json({ reply, meme });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
