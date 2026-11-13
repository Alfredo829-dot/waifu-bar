(() => {
  const C = window.WB_CONFIG, P = window.WB_PERSONAJES;
  const $ = (id) => document.getElementById(id);
  const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem("wb_" + k)) ?? d; } catch { return d; } },
               set(k, v) { localStorage.setItem("wb_" + k, JSON.stringify(v)); } };
  let cfg = Object.assign({ nombre: "", key: "" }, ls.get("cfg", {}));
  let actual = null, ocupado = false;

  const ver = (id) => { document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa")); $(id).classList.add("activa"); };
  const pintarAvatar = (el, p) => {
    el.style.background = `linear-gradient(135deg,${p.colores[0]},${p.colores[1]})`;
    el.textContent = p.nombre[0];
    const img = new Image(); img.onload = () => { el.style.background = `url(img/${p.id}.jpg) center/cover`; el.textContent = ""; };
    img.src = `img/${p.id}.jpg`;
  };
  const datos = (id) => ls.get("chat_" + id, { msgs: [], resumen: "", usados: 0 });
  const guardar = (id, d) => ls.set("chat_" + id, d);

  // Portada
  { const pi = new Image(); pi.onload = () => { document.querySelector(".hero-bg").style.backgroundImage = "url(img/hero.jpg)"; }; pi.src = "img/hero.jpg"; }
  // Edad
  if (ls.get("mayor", false) || localStorage.getItem("nw18") === "1") ver("inicio");
  $("soyMayor").onclick = () => { ls.set("mayor", true); localStorage.setItem("nw18", "1"); irHash(); };
  $("soyMenor").onclick = () => { document.body.innerHTML = '<div class="caja" style="margin-top:30vh">Esta página es solo para mayores de 18 años.</div>'; };

  // Lista
  P.forEach(p => {
    const c = document.createElement("div"); c.className = "carta"; c.style.setProperty("--neon", p.colores[0]);
    const f = document.createElement("div"); f.className = "foto"; f.style.background = `radial-gradient(circle at 50% 30%,${p.colores[0]}55,${p.colores[1]} 70%)`;
    f.innerHTML = `<span class="ini">${p.nombre[0]}</span>`;
    const img = new Image(); img.onload = () => { f.style.background = `url(img/${p.id}.jpg) center/cover`; f.innerHTML = ""; }; img.src = `img/${p.id}.jpg`;
    const t = document.createElement("div"); t.className = "info";
    t.innerHTML = `<b>${p.nombre}, ${p.edad}</b><small>${p.tag}</small><p>“${p.frase}”</p><button class="btn">Platica con ella</button>`;
    c.append(f, t); c.onclick = () => abrir(p); $("lista").append(c);
  });

  const PART = { feliz:"✨", risa:"😆", coqueta:"😉", timida:"👉👈", sonrojada:"😳", enojada:"💢", celosa:"😤", triste:"💧", sorprendida:"❗", pensativa:"💭", emocionada:"✨", aburrida:"💤", "cariñosa":"💕", retadora:"🔥", misteriosa:"🌙", nerviosa:"💦", orgullosa:"👑", juguetona:"🎵", seria:"", enamorada:"💗" };
  // emoción de la IA -> nombre de la foto de Bestial
  const FOTO = { feliz:"sonrisa", risa:"risa", coqueta:"coqueta", timida:"sonrojada", sonrojada:"sonrojada", enojada:"brazos", celosa:"celosa", triste:"triste", sorprendida:"sorprendida", pensativa:"pensativa", emocionada:"emocionada", aburrida:"aburrida", "cariñosa":"beso", retadora:"burla", misteriosa:"susurro", nerviosa:"puchero", orgullosa:"ojos_blanco", juguetona:"guino", seria:"neutral", enamorada:"labio", saludo:"saludo" };
  // respaldo para quien solo tenga 5 caras
  const CINCO = { feliz:"sonrisa", risa:"sonrisa", coqueta:"coqueta", timida:"sonrojada", sonrojada:"sonrojada", celosa:"celosa", enojada:"celosa", triste:"triste", aburrida:"triste", "cariñosa":"coqueta", enamorada:"coqueta", juguetona:"coqueta", emocionada:"sonrisa", orgullosa:"sonrisa", nerviosa:"sonrojada", saludo:"sonrisa" };
  function moverse(emo) {
    const E = window.WB_EMOS; if (emo !== "saludo" && !E.includes(emo)) emo = E[Math.floor(Math.random() * E.length)];
    const pj = $("pj"); pj.className = ""; void pj.offsetWidth; pj.className = "emo-" + emo;
    const lista = [...new Set([emo, FOTO[emo], CINCO[emo] === "sonrisa" ? "feliz" : CINCO[emo], CINCO[emo]].filter(Boolean))].map(f => encodeURI(`img/${actual.id}/moods/${f}.jpg`));
    const probar = (k) => { if (k >= lista.length) { pj.style.backgroundImage = `url(img/${actual.id}.jpg)`; return; }
      const im = new Image(); im.onload = () => { pj.style.opacity = 0; setTimeout(() => { pj.style.backgroundImage = `url(${lista[k]})`; pj.style.opacity = ""; }, 250); };
      im.onerror = () => probar(k + 1); im.src = lista[k]; };
    probar(0);
    const s = PART[emo]; if (!s) return;
    for (let i = 0; i < 5; i++) { const e = document.createElement("span"); e.textContent = s;
      e.style.left = (25 + Math.random() * 50) + "%"; e.style.animationDelay = (i * 0.18) + "s";
      $("particulas").append(e); setTimeout(() => e.remove(), 2600); }
  }
  const limpiar = (t) => { const m = t.match(/\[emo:\s*([a-zñáéíóú]+)\s*\]/i); let emo = m ? m[1].toLowerCase().replace(/[áéíóú]/g, c => ({ "á":"a","é":"e","í":"i","ó":"o","ú":"u" })[c]) : ""; if (emo === "carinosa") emo = "cariñosa"; return { texto: t.replace(/\[emo:[^\]]*\]/gi, "").trim(), emo }; };
  function abrir(p) {
    actual = p;
    $("pj").style.backgroundImage = `url(img/${p.id}.jpg)`; $("escena").style.setProperty("--neon", p.colores[0]);
    new Set([...window.WB_EMOS, ...Object.values(FOTO)]).forEach(f => { const i = new Image(); i.onerror = () => {}; i.src = encodeURI(`img/${p.id}/moods/${f}.jpg`); });
    setTimeout(() => moverse("saludo"), 300); pintarAvatar($("chatAvatar"), p);
    $("chatNombre").textContent = p.nombre; $("chatTag").textContent = p.tag + " · IA";
    const d = datos(p.id);
    if (!d.msgs.length) { d.msgs.push({ role: "assistant", content: p.saludo }); guardar(p.id, d); }
    render(); ver("chat"); $("txt").focus();
  }
  function render() {
    const d = datos(actual.id), box = $("mensajes"); box.innerHTML = "";
    d.msgs.forEach(m => { const e = document.createElement("div"); e.className = "m " + (m.role === "user" ? "yo" : "ella"); e.textContent = m.content; box.append(e); });
    const quedan = Math.max(0, C.mensajesGratis - d.usados);
    $("contador").textContent = quedan + " gratis";
    box.scrollTop = box.scrollHeight;
  }
  const sis = (t) => { const e = document.createElement("div"); e.className = "m sis"; e.textContent = t; $("mensajes").append(e); $("mensajes").scrollTop = 1e9; };

  async function llamarIA(messages) {
    if (C.proxyUrl) {
      const r = await fetch(C.proxyUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
      if (!r.ok) throw new Error("La IA no respondió (" + r.status + "). Intenta en un ratito.");
      return (await r.json()).texto;
    }
    if (!cfg.key) throw new Error("Falta la clave de Groq en Ajustes ⚙ (modo prueba).");
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.9, max_tokens: 220 }) });
    if (r.status === 429) throw new Error("Se llenó el límite gratis por ahora. Espera un minuto.");
    if (!r.ok) throw new Error("La IA falló (" + r.status + "). Revisa la clave en Ajustes ⚙.");
    return (await r.json()).choices[0].message.content.trim();
  }
  function armar(p, d) {
    let sys = p.prompt;
    if (cfg.nombre) sys += `\nEl usuario se llama ${cfg.nombre}.`;
    if (d.resumen) sys += `\nLo que recuerdas de él: ${d.resumen}`;
    return [{ role: "system", content: sys }, ...d.msgs.slice(-20)];
  }
  async function actualizarResumen(p, d) {
    try {
      const txt = d.msgs.slice(-20).map(m => (m.role === "user" ? "Él: " : p.nombre + ": ") + m.content).join("\n");
      const r = await llamarIA([{ role: "system", content: "Resume en máximo 60 palabras los datos personales y gustos que el usuario contó (nombre, trabajo, ciudad, mascotas, planes, cómo se siente). Solo datos que dijo, sin inventar. Si no hay nada nuevo, repite el resumen anterior." },
        { role: "user", content: "Resumen anterior: " + (d.resumen || "nada") + "\n\nConversación:\n" + txt }]);
      d.resumen = r.slice(0, 600); guardar(p.id, d);
    } catch {}
  }

  $("formMsg").onsubmit = async (ev) => {
    ev.preventDefault(); if (ocupado) return;
    const t = $("txt").value.trim(); if (!t) return;
    const p = actual, d = datos(p.id);
    if (d.usados >= C.mensajesGratis) return mostrarPago();
    d.msgs.push({ role: "user", content: t }); d.usados++; guardar(p.id, d); $("txt").value = ""; render();
    ocupado = true; sis(p.nombre + " está escribiendo…");
    try {
      const crudo = await llamarIA(armar(p, d)); const { texto: r, emo } = limpiar(crudo);
      d.msgs.push({ role: "assistant", content: r || "…" }); moverse(emo); d.msgs = d.msgs.slice(-60); guardar(p.id, d);
      if (d.usados % 8 === 0) actualizarResumen(p, d);
      render();
    } catch (e) { render(); sis(e.message); d.usados--; d.msgs.pop(); guardar(p.id, d); }
    ocupado = false;
  };

  function mostrarPago() {
    $("pagoTxt").textContent = `Para seguir platicando con ${actual.nombre}, desbloquea más mensajes.`;
    $("pagoLink").href = C.linkPago || `https://wa.me/${C.contactoWhatsApp}?text=${encodeURIComponent("Quiero desbloquear a " + actual.nombre + " en Neón Waifus")}`;
    $("pago").classList.add("activa");
  }
  $("cerrarPago").onclick = () => $("pago").classList.remove("activa");
  $("volver").onclick = () => { location.href = "index.html#chicas"; };

  function irHash() { const p = P.find(x => x.id === location.hash.slice(1)); if (p) abrir(p); else ver("inicio"); }
  if (ls.get("mayor", false) || localStorage.getItem("nw18") === "1") irHash();
  // Ajustes
  $("abrirCfg").onclick = () => { $("cfgNombre").value = cfg.nombre; $("cfgKey").value = cfg.key; $("cfgPrueba").style.display = C.proxyUrl ? "none" : "block"; $("cfg").classList.add("activa"); };
  $("abrirCfg2").onclick = () => $("abrirCfg").onclick();
  $("cerrarCfg").onclick = () => $("cfg").classList.remove("activa");
  $("guardarCfg").onclick = () => { cfg.nombre = $("cfgNombre").value.trim(); cfg.key = $("cfgKey").value.trim(); ls.set("cfg", cfg); $("cfg").classList.remove("activa"); };
  $("borrarTodo").onclick = () => { if (confirm("¿Borrar todos tus chats?")) { P.forEach(p => localStorage.removeItem("wb_chat_" + p.id)); $("cfg").classList.remove("activa"); } };
})();
