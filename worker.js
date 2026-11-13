// Cloudflare Worker (gratis): esconde la clave de Groq. Variable secreta: GROQ_KEY
export default {
  async fetch(req, env) {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("ok", { headers: cors });
    const { messages } = await req.json();
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.GROQ_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: (messages || []).slice(-24), temperature: 0.9, max_tokens: 220 }) });
    if (!r.ok) return new Response(JSON.stringify({ error: r.status }), { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
    const j = await r.json();
    return new Response(JSON.stringify({ texto: j.choices[0].message.content.trim() }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
};
