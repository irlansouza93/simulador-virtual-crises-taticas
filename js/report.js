// Relatório final: dados da partida + textos escritos e assinados por cada jogador.
// Nenhum texto é gerado em nome dos alunos: campo vazio aparece como vazio.
import { MISSIONS, TOTAL_SECONDS } from "./missions.js";
import { portraitSVG, ROLES } from "./characters.js";
import { appendEntry, auditState } from "./integrity.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtClock = (sec) => { const s = Math.max(0, Math.round(sec)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "";
const short = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : "";

let editing = null; // { kind: "parecer", id } | { kind: "conclusao", by }

function outcome(state) {
  if (state.expired || state.secondsLeft <= 0) return { ok: false, text: "Janela clínica encerrada antes do fim" };
  return { ok: true, text: `Feridos atendidos com ${fmtClock(state.secondsLeft)} de margem` };
}

export async function renderReport(el, h) {
  const state = h.getState();
  const P = (id) => state.players.find(p => p.id === id);
  const roleNames = (pid) => ROLES.filter(r => state.roles[r.id] === pid).map(r => r.name).join(", ");
  const res = outcome(state);
  const losses = state.attempts.filter(a => a.kind === "classic");
  const lostMin = losses.reduce((s, a) => s + a.lost, 0);
  const check = await auditState(state);

  const team = state.players.map(p => `
    <tr>
      <td class="who">${portraitSVG(p.characterId, { size: 40 })}<strong>${esc(p.codename)}</strong></td>
      <td>${esc(p.name)}</td>
      <td>${esc(roleNames(p.id))}</td>
      <td class="num">${p.xp} XP</td>
      <td>${p.medals.length ? p.medals.map(m => `<span class="medal">${esc(m)}</span>`).join("") : "<span class=\"muted\">—</span>"}</td>
    </tr>`).join("");

  const timeline = state.attempts.map(a => {
    const m = MISSIONS.find(x => x.id === a.mission);
    const p = P(a.player);
    return `<tr class="${a.kind === "classic" ? "lost" : "won"}">
      <td class="num">${fmtTime(a.at)}</td>
      <td>${MISSIONS.indexOf(m) + 1}. ${esc(m.title)}</td>
      <td>${esc(p?.codename)}</td>
      <td>${esc(a.name)}</td>
      <td>${a.kind === "classic" ? `Perda · −${a.lost} min` : a.lost ? `Sucesso · viagem ${a.lost} min` : "Sucesso"}</td>
      <td class="num">${fmtClock(a.left)}</td>
    </tr>`;
  }).join("");

  const missions = MISSIONS.map((m, i) => {
    const win = state.attempts.find(a => a.mission === m.id && a.kind === "quantum");
    const tries = state.attempts.filter(a => a.mission === m.id).length;
    const owner = P(state.roles[m.role]);
    const note = state.notes[m.id];
    return `<section class="rep-mission">
      <h4>${i + 1}. ${esc(m.title)} <span>${esc(owner?.codename)} · ${esc(owner?.name)}</span></h4>
      <dl>
        <div><dt>Decisão final</dt><dd>${win ? esc(win.name) : "Não concluída"}${tries > 1 ? ` (após ${tries - 1} tentativa${tries > 2 ? "s" : ""} com perda)` : ""}</dd></div>
        <div><dt>Fundamento (conteúdo da atividade)</dt><dd>${esc(m.physics)}</dd></div>
      </dl>
      <div class="rep-note">
        <span class="rep-note-label">Nota de campo de ${esc(owner?.codename)}</span>
        ${note ? `<blockquote>${esc(note.text)}</blockquote><span class="seal">Assinada às ${fmtTime(note.at)} · selo ${short(note.hash)}</span>` : `<p class="muted">Sem nota de campo.</p>`}
      </div>
    </section>`;
  }).join("");

  const pareceres = state.players.map(p => {
    const sig = state.pareceres[p.id];
    const isEditing = editing && editing.kind === "parecer" && editing.id === p.id;
    let body;
    if (isEditing) {
      body = `<textarea class="rep-textarea" data-edit-text rows="6" maxlength="3000" aria-label="Parecer de ${esc(p.codename)}">${esc(sig?.text || "")}</textarea>
        <div class="rep-row">
          <button type="button" class="btn-ghost" data-cancel>Cancelar</button>
          <button type="button" class="btn-primary" data-sign="${p.id}">Assinar parecer</button>
        </div>`;
    } else if (sig) {
      body = `<blockquote>${esc(sig.text)}</blockquote>
        <div class="rep-row"><span class="seal">Assinado por ${esc(p.codename)} às ${fmtTime(sig.at)} · selo ${short(sig.hash)}</span>
        <button type="button" class="btn-link" data-open="${p.id}">Editar (pede PIN)</button></div>`;
    } else {
      body = `<p class="muted">Aguardando o parecer de ${esc(p.codename)}.</p>
        <button type="button" class="btn-ghost" data-open="${p.id}">Escrever meu parecer</button>`;
    }
    return `<div class="rep-parecer ${sig ? "signed" : ""} ${isEditing ? "editing" : ""}">
      <div class="rep-parecer-head">${portraitSVG(p.characterId, { size: 44 })}<div><strong>${esc(p.codename)}</strong><span>${esc(p.name)} · ${esc(roleNames(p.id))}</span></div></div>
      ${body}
    </div>`;
  }).join("");

  const conc = state.conclusion;
  let concBody;
  if (editing && editing.kind === "conclusao") {
    concBody = `<textarea class="rep-textarea" data-edit-text rows="5" maxlength="3000" aria-label="Conclusão da equipe">${esc(conc?.text || "")}</textarea>
      <div class="rep-row"><button type="button" class="btn-ghost" data-cancel>Cancelar</button><button type="button" class="btn-primary" data-sign-conc>Assinar conclusão</button></div>`;
  } else if (conc) {
    concBody = `<blockquote>${esc(conc.text)}</blockquote><div class="rep-row"><span class="seal">Registrada por ${esc(P(conc.by)?.codename)} às ${fmtTime(conc.at)} · selo ${short(conc.hash)}</span><button type="button" class="btn-link" data-conc-open>Editar (pede PIN)</button></div>`;
  } else {
    concBody = `<p class="muted">A equipe decide junto o que escrever. Quem digitar assina com o próprio PIN.</p>
      <div class="rep-row">${state.players.map(p => `<button type="button" class="btn-ghost" data-conc-by="${p.id}">${esc(p.codename)} vai digitar</button>`).join("")}</div>`;
  }

  const signedCount = state.players.filter(p => state.pareceres[p.id]).length;

  el.innerHTML = `
    <header class="rep-head">
      <div>
        <p class="rep-form">Parte de ocorrência · Simulação</p>
        <h1 id="report-title">Resgate na Serra</h1>
        <p class="rep-sub">Ecossistema CÓRTEX · UVPR / UEPG / CTEx · Módulo 2: Aplicações Quânticas 2.0</p>
      </div>
      <div class="rep-stamp ${res.ok ? "ok" : "bad"}">${res.ok ? "Missão cumprida" : "Tempo esgotado"}</div>
    </header>
    <dl class="rep-meta">
      <div><dt>Equipe</dt><dd>${esc(state.teamName)}</dd></div>
      <div><dt>Data</dt><dd>${fmtDate(state.finishedAt || state.startedAt)}</dd></div>
      <div><dt>Resultado</dt><dd>${esc(res.text)}</dd></div>
      <div><dt>Perdas por decisão</dt><dd>${losses.length} · −${lostMin} min</dd></div>
      <div><dt>Cenário sorteado</dt><dd>nº ${state.seed}</dd></div>
    </dl>

    <h3>Equipe</h3>
    <table class="rep-table"><thead><tr><th>Operador</th><th>Nome</th><th>Funções</th><th>XP</th><th>Medalhas</th></tr></thead><tbody>${team}</tbody></table>

    <h3>Linha do tempo das decisões</h3>
    <table class="rep-table"><thead><tr><th>Hora</th><th>Missão</th><th>Quem</th><th>Decisão</th><th>Resultado</th><th>Sobrevida</th></tr></thead><tbody>${timeline || `<tr><td colspan="6" class="muted">Nenhuma decisão registrada.</td></tr>`}</tbody></table>

    <h3>Missões e notas de campo</h3>
    ${missions}

    <h3>Pareceres individuais <span class="rep-count">${signedCount} de ${state.players.length} assinados</span></h3>
    <p class="rep-help">Cada jogador libera o próprio campo com o PIN. Ninguém consegue escrever ou alterar o parecer de outro.</p>
    <div class="rep-pareceres">${pareceres}</div>

    <h3>Conclusão da equipe</h3>
    <div class="rep-parecer rep-conclusion ${conc ? "signed" : ""}">${concBody}</div>

    <footer class="rep-integrity ${check.ok ? "ok" : "bad"}">
      <strong>${check.ok ? "Registro íntegro" : "Registro alterado fora do jogo"}</strong>
      <span>${check.ok
        ? `${state.ledger.length} registros encadeados por SHA-256, cada um com o PIN do autor. Selo final ${short(check.head)}.`
        : `${check.problems.join(" ")} Algo foi editado fora do jogo.`}</span>
    </footer>`;

  bind(el, h);
  const ta = el.querySelector("[data-edit-text]");
  if (ta) ta.focus();
}

function bind(el, h) {
  const state = h.getState();
  const P = (id) => state.players.find(p => p.id === id);
  const rerender = () => renderReport(el, h);

  el.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", async () => {
    const p = P(b.dataset.open);
    const ok = await h.askPin(p, `Liberar o parecer de ${p.codename}.`);
    if (!ok) return;
    editing = { kind: "parecer", id: p.id };
    rerender();
  }));
  el.querySelectorAll("[data-cancel]").forEach(b => b.addEventListener("click", () => { editing = null; rerender(); }));
  el.querySelectorAll("[data-sign]").forEach(b => b.addEventListener("click", async () => {
    const p = P(b.dataset.sign);
    if (!editing || editing.id !== p.id) return;
    const text = el.querySelector("[data-edit-text]").value.trim();
    if (!text) { h.toast("Escreva o parecer antes de assinar."); return; }
    const first = !state.pareceres[p.id];
    const at = new Date().toISOString();
    const entry = await appendEntry(state.ledger, { type: "parecer", actor: p.id, data: { texto: text }, at });
    state.pareceres[p.id] = { text, at, hash: entry.hash };
    if (first) p.xp += 30;
    editing = null;
    h.save();
    h.sound.pinOk();
    h.toast(`Parecer de ${p.codename} assinado.`);
    rerender();
  }));
  el.querySelectorAll("[data-conc-by]").forEach(b => b.addEventListener("click", async () => {
    const p = P(b.dataset.concBy);
    const ok = await h.askPin(p, `${p.codename} vai digitar e assinar a conclusão da equipe.`);
    if (!ok) return;
    editing = { kind: "conclusao", by: p.id };
    rerender();
  }));
  const concOpen = el.querySelector("[data-conc-open]");
  if (concOpen) concOpen.addEventListener("click", async () => {
    const p = P(state.conclusion.by);
    const ok = await h.askPin(p, `Só ${p.codename}, que registrou a conclusão, pode editá-la.`);
    if (!ok) return;
    editing = { kind: "conclusao", by: p.id };
    rerender();
  });
  const signConc = el.querySelector("[data-sign-conc]");
  if (signConc) signConc.addEventListener("click", async () => {
    const text = el.querySelector("[data-edit-text]").value.trim();
    if (!text) { h.toast("Escreva a conclusão antes de assinar."); return; }
    const at = new Date().toISOString();
    const entry = await appendEntry(state.ledger, { type: "conclusao", actor: editing.by, data: { texto: text }, at });
    state.conclusion = { text, by: editing.by, at, hash: entry.hash };
    editing = null;
    h.save();
    h.sound.pinOk();
    rerender();
  });
}

// ---------- PDF ----------
// Helvetica do jsPDF só cobre Latin-1: troca símbolos fora dela.
function pdfText(s) {
  return String(s ?? "")
    .replace(/μ/g, "µ").replace(/−/g, "-").replace(/→/g, ">").replace(/Δ/g, "Delta ")
    .replace(/ρ/g, "rho").replace(/ψ/g, "psi").replace(/[⟩〉]/g, ">").replace(/α/g, "a").replace(/β/g, "b")
    .replace(/ⁿ/g, "^n").replace(/≈/g, "~").replace(/…/g, "...").replace(/[^\x00-\xFF’“”–—•]/g, "");
}

// Fontes do jogo embutidas no PDF (TTF do Fontsource). Sem rede, cai para Helvetica.
const FONT_BASE = "https://cdn.jsdelivr.net/fontsource/fonts";
const PDF_FONTS = [
  ["Barlow", "normal", `${FONT_BASE}/barlow@5.0.13/latin-400-normal.ttf`],
  ["Barlow", "italic", `${FONT_BASE}/barlow@5.0.13/latin-400-italic.ttf`],
  ["Barlow", "bold", `${FONT_BASE}/barlow@5.0.13/latin-700-normal.ttf`],
  ["BarlowCondensed", "bold", `${FONT_BASE}/barlow-condensed@5.0.13/latin-800-normal.ttf`]
];
let fontCache = null;
async function loadPdfFonts() {
  if (fontCache) return fontCache;
  const toB64 = (buf) => {
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  fontCache = await Promise.all(PDF_FONTS.map(async ([family, style, url]) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return { family, style, file: `${family}-${style}.ttf`, data: toB64(await res.arrayBuffer()) };
  }));
  return fontCache;
}

export async function exportPdf(state, { save = true } = {}) {
  if (!window.jspdf) { alert("O gerador de PDF ainda está carregando. Tente de novo em alguns segundos."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  let BODY = "helvetica", DISPLAY = "helvetica";
  try {
    for (const f of await loadPdfFonts()) {
      doc.addFileToVFS(f.file, f.data);
      doc.addFont(f.file, f.family, f.style);
    }
    BODY = "Barlow"; DISPLAY = "BarlowCondensed";
  } catch { /* sem rede: mantém Helvetica */ }
  const P = (id) => state.players.find(p => p.id === id);
  const roleNames = (pid) => ROLES.filter(r => state.roles[r.id] === pid).map(r => r.name).join(", ");
  const res = outcome(state);
  const check = await auditState(state);
  const M = 16, W = 210 - M * 2;
  let y = 18;

  const ensure = (need) => { if (y + need > 282) { doc.addPage(); y = 18; } };
  const text = (s, { size = 9, style = "normal", color = [29, 29, 27], indent = 0, gap = 1.6, font = BODY } = {}) => {
    doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(pdfText(s), W - indent);
    const lh = size * 0.42;
    for (const line of lines) { ensure(lh); doc.text(line, M + indent, y); y += lh; }
    y += gap;
  };
  const heading = (s) => {
    ensure(14); y += 3;
    doc.setDrawColor(138, 90, 43); doc.setLineWidth(0.4); doc.line(M, y, M + W, y); y += 5;
    text(s.toUpperCase(), { size: 12, style: "bold", color: [138, 90, 43], gap: 1.5, font: DISPLAY });
  };

  text("RESGATE NA SERRA", { size: 26, style: "bold", gap: 0.5, font: DISPLAY });
  text("Parte de ocorrência · Simulação", { size: 9, style: "bold", color: [138, 90, 43], gap: 0.5 });
  text("Ecossistema CÓRTEX · UVPR / UEPG / CTEx · Módulo 2: Aplicações Quânticas 2.0", { size: 8.5, color: [80, 80, 76], gap: 3 });
  text(`Equipe: ${state.teamName}`, { size: 10, style: "bold", gap: 0.6 });
  text(`Data: ${fmtDate(state.finishedAt || state.startedAt)}   ·   Resultado: ${res.text}`, { size: 9, gap: 0.6 });
  const losses = state.attempts.filter(a => a.kind === "classic");
  text(`Perdas por decisão: ${losses.length} (−${losses.reduce((s, a) => s + a.lost, 0)} min)   ·   Cenário nº ${state.seed}`, { size: 9, gap: 1 });

  heading("Equipe");
  for (const p of state.players) {
    text(`${p.codename} — ${p.name} · ${roleNames(p.id)} · ${p.xp} XP${p.medals.length ? " · " + p.medals.join("; ") : ""}`, { size: 9, gap: 0.8 });
  }

  heading("Linha do tempo das decisões");
  for (const a of state.attempts) {
    const m = MISSIONS.find(x => x.id === a.mission);
    text(`${fmtTime(a.at)}  ${MISSIONS.indexOf(m) + 1}. ${m.title} · ${P(a.player)?.codename}: ${a.name} → ${a.kind === "classic" ? `perda (−${a.lost} min)` : "sucesso"} · sobrevida ${fmtClock(a.left)}`, { size: 8.5, gap: 0.6 });
  }

  heading("Missões e notas de campo");
  MISSIONS.forEach((m, i) => {
    const win = state.attempts.find(a => a.mission === m.id && a.kind === "quantum");
    const owner = P(state.roles[m.role]);
    const note = state.notes[m.id];
    text(`${i + 1}. ${m.title} — ${owner?.codename} (${owner?.name})`, { size: 10, style: "bold", gap: 0.6 });
    text(`Decisão final: ${win ? win.name : "não concluída"}`, { size: 9, gap: 0.6 });
    text(`Fundamento: ${m.physics}`, { size: 8.5, color: [70, 70, 66], gap: 0.8 });
    if (note) {
      text(`Nota de campo de ${owner?.codename}: “${note.text}”`, { size: 9, style: "italic", indent: 3, gap: 0.4 });
      text(`assinada às ${fmtTime(note.at)} · selo ${short(note.hash)}`, { size: 7.5, color: [31, 79, 168], indent: 3, gap: 2 });
    } else {
      text("Sem nota de campo.", { size: 8.5, color: [120, 120, 114], indent: 3, gap: 2 });
    }
  });

  heading("Pareceres individuais");
  for (const p of state.players) {
    const sig = state.pareceres[p.id];
    text(`${p.codename} — ${p.name}`, { size: 10, style: "bold", gap: 0.6 });
    if (sig) {
      text(sig.text, { size: 9.5, indent: 3, gap: 0.4 });
      text(`assinado às ${fmtTime(sig.at)} · selo ${short(sig.hash)}`, { size: 7.5, color: [31, 79, 168], indent: 3, gap: 2.5 });
    } else {
      text("Não registrou parecer.", { size: 9, color: [120, 120, 114], indent: 3, gap: 2.5 });
    }
  }

  heading("Conclusão da equipe");
  if (state.conclusion) {
    text(state.conclusion.text, { size: 9.5, gap: 0.4 });
    text(`registrada por ${P(state.conclusion.by)?.codename} às ${fmtTime(state.conclusion.at)} · selo ${short(state.conclusion.hash)}`, { size: 7.5, color: [31, 79, 168], gap: 2 });
  } else {
    text("A equipe não registrou conclusão.", { size: 9, color: [120, 120, 114], gap: 2 });
  }

  heading("Integridade");
  text(check.ok
    ? `Registro íntegro: ${state.ledger.length} registros encadeados por SHA-256, cada decisão e texto autenticado com o PIN do autor. Selo final: ${check.head}`
    : `Atenção: registro alterado fora do jogo. ${check.problems.join(" ")}`, { size: 8, gap: 1 });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(BODY, "normal"); doc.setFontSize(7); doc.setTextColor(120, 120, 114);
    doc.text(pdfText(`Simulador Resgate na Serra · página ${i} de ${pages}`), 105, 290, { align: "center" });
  }
  const slug = state.teamName.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "") || "equipe";
  if (save) doc.save(`Relatorio_Resgate_na_Serra_${slug}.pdf`);
  return doc;
}

export { TOTAL_SECONDS };
