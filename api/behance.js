// Reads Mani's public Behance RSS feed so the AI knows about newly uploaded projects.
// Shared by /api/chat (via require) and usable alone at /api/behance for a quick check.
const FEED = 'https://www.behance.net/feeds/user?username=manikandan276';
let cache = { at: 0, items: null };

function pick(tag, s) {
  const m = s.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

async function getBehance(ms = 2500) {
  if (cache.items && Date.now() - cache.at < 60 * 60 * 1000) return cache.items;
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(FEED, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (portfolio chat)' } });
    clearTimeout(t);
    if (!r.ok) { console.error('Behance feed failed', r.status); return cache.items || []; }
    const xml = await r.text();
    const items = (xml.match(/<item[\s\S]*?<\/item>/gi) || []).slice(0, 30).map(it => ({
      title: pick('title', it), link: pick('link', it), date: pick('pubDate', it), about: pick('description', it).slice(0, 400)
    })).filter(x => x.title && x.link);
    cache = { at: Date.now(), items };
    return items;
  } catch (e) { clearTimeout(t); console.error('Behance feed error', e.name); return cache.items || []; }
}

module.exports = async (req, res) => {
  const items = await getBehance(6000);
  res.status(200).json({ count: items.length, items });
};
module.exports.getBehance = getBehance;
