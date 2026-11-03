// Integridade e antifraude para tela compartilhada.
// - PIN nunca é guardado em texto: só o hash PBKDF2 com sal por jogador.
// - Cada ação relevante entra numa cadeia de registros (hash do anterior + conteúdo).
//   Qualquer alteração posterior no histórico quebra a verificação.
// Funciona no navegador e no Node 18+ (globalThis.crypto).

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();

export function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(text) {
  return toHex(await subtle.digest("SHA-256", enc.encode(text)));
}

export function randomSalt(bytes = 16) {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  return toHex(arr);
}

export async function hashPin(pin, salt, iterations = 60000) {
  const key = await subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations },
    key,
    256
  );
  return toHex(bits);
}

// Regras de PIN: 4 dígitos, nada de 0000/1111 nem sequências óbvias.
export function pinProblem(pin) {
  if (!/^\d{4}$/.test(pin)) return "O PIN precisa ter exatamente 4 números.";
  if (/^(\d)\1{3}$/.test(pin)) return "Evite números repetidos (ex.: 1111).";
  const seqUp = "0123456789", seqDown = "9876543210";
  if (seqUp.includes(pin) || seqDown.includes(pin)) return "Evite sequências (ex.: 1234).";
  return null;
}

// Compara dois hashes sem atalho por tamanho de prefixo.
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createCredential(pin) {
  const salt = randomSalt();
  return { salt, pinHash: await hashPin(pin, salt) };
}

export async function checkPin(pin, credential) {
  if (!credential) return false;
  return safeEqual(await hashPin(pin, credential.salt), credential.pinHash);
}

// Bloqueio progressivo: 3 erros seguidos travam o jogador por 30 s.
export class PinGuard {
  constructor({ maxAttempts = 3, lockMs = 30000, now = () => Date.now() } = {}) {
    this.maxAttempts = maxAttempts;
    this.lockMs = lockMs;
    this.now = now;
    this.state = {};
  }
  lockedFor(playerId) {
    const s = this.state[playerId];
    if (!s || !s.lockedUntil) return 0;
    return Math.max(0, s.lockedUntil - this.now());
  }
  fail(playerId) {
    const s = this.state[playerId] || (this.state[playerId] = { fails: 0, lockedUntil: 0 });
    s.fails++;
    if (s.fails >= this.maxAttempts) {
      s.fails = 0;
      s.lockedUntil = this.now() + this.lockMs;
    }
    return this.maxAttempts - s.fails;
  }
  succeed(playerId) {
    this.state[playerId] = { fails: 0, lockedUntil: 0 };
  }
}

// Serialização estável: mesma ordem de chaves sempre gera o mesmo hash.
export function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + canonical(value[k])).join(",") + "}";
}

export const GENESIS = "0".repeat(64);

export async function appendEntry(ledger, { type, actor = null, data = {}, at = new Date().toISOString() }) {
  const prev = ledger.length ? ledger[ledger.length - 1].hash : GENESIS;
  const body = { seq: ledger.length, type, actor, data, at, prev };
  const entry = { ...body, hash: await sha256Hex(canonical(body)) };
  ledger.push(entry);
  return entry;
}

export async function verifyLedger(ledger) {
  let prev = GENESIS;
  for (let i = 0; i < ledger.length; i++) {
    const { hash, ...body } = ledger[i];
    if (body.seq !== i || body.prev !== prev) return { ok: false, brokenAt: i };
    if (!safeEqual(await sha256Hex(canonical(body)), hash)) return { ok: false, brokenAt: i };
    prev = hash;
  }
  return { ok: true, head: prev };
}

// Confere o estado salvo contra a cadeia: texto, autor e credencial precisam bater
// com o que foi registrado. Editar só o estado (sem a cadeia) também é detectado.
export async function auditState(state) {
  const chain = await verifyLedger(state.ledger);
  if (!chain.ok) return { ok: false, brokenAt: chain.brokenAt, problems: [`Cadeia quebrada no registro ${chain.brokenAt + 1}.`] };
  const problems = [];
  const log = state.ledger;
  const team = log.find(e => e.type === "equipe");
  if (team) {
    const reg = team.data.jogadores;
    if (reg.length !== state.players.length) problems.push("Lista de jogadores alterada.");
    for (const p of state.players) {
      const r = reg.find(x => x.id === p.id);
      if (!r || r.nome !== p.name || r.codinome !== p.codename) problems.push(`Dados de ${p.codename} alterados.`);
      else if (r.credencial && r.credencial !== p.cred.pinHash) problems.push(`PIN de ${p.codename} trocado fora do jogo.`);
    }
    if (canonical(team.data.funcoes) !== canonical(state.roles)) problems.push("Funções alteradas.");
  }
  const decisions = log.filter(e => e.type === "decisao");
  const sameAttempts = decisions.length === state.attempts.length && decisions.every((e, i) => {
    const a = state.attempts[i];
    return e.actor === a.player && e.data.opcao === a.option && e.data.missao === a.mission && (e.data.resultado === "perda") === (a.kind === "classic");
  });
  if (!sameAttempts) problems.push("Decisões alteradas.");
  const lastBy = (type, match) => log.filter(e => e.type === type && match(e)).at(-1);
  for (const [mission, note] of Object.entries(state.notes || {})) {
    const e = lastBy("nota", x => x.data.missao === mission);
    if (!e || e.hash !== note.hash || e.actor !== note.player || e.data.texto !== note.text) problems.push(`Nota da missão ${mission} alterada.`);
  }
  for (const p of state.players) {
    const e = lastBy("parecer", x => x.actor === p.id);
    const sig = (state.pareceres || {})[p.id];
    if (!e && !sig) continue;
    if (!e || !sig || e.hash !== sig.hash || e.data.texto !== sig.text) problems.push(`Parecer de ${p.codename} alterado.`);
  }
  const conc = lastBy("conclusao", () => true);
  if (conc || state.conclusion) {
    const c = state.conclusion;
    if (!conc || !c || conc.hash !== c.hash || conc.actor !== c.by || conc.data.texto !== c.text) problems.push("Conclusão da equipe alterada.");
  }
  return { ok: problems.length === 0, head: chain.head, problems };
}
