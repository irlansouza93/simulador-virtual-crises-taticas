import { MapWorld } from "./scene.js";
import { sound } from "./audio.js";
import { CHARACTERS, characterById, portraitSVG, ROLES, roleSymbolSVG } from "./characters.js";
import { MISSIONS, TOTAL_SECONDS } from "./missions.js";
import { pinProblem, createCredential, checkPin, PinGuard, appendEntry, auditState } from "./integrity.js";
import {
  rollScenario, bestRoute, countSimpleRoutes, fleetCombinations, classicalSearchMinutes,
  routeStats, PLANNED_ROUTE, FLEET, DEPARTURE_WINDOWS
} from "./routing.js";
import { Instruments } from "./instruments.js";
import { renderReport, exportPdf } from "./report.js";

const $ = (id) => document.getElementById(id);
const KEY = "sct.save.v2";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- estado ----------
function freshState() {
  return {
    v: 2, phase: "start", teamName: "", count: 4, players: [], roles: {},
    seed: Math.floor(Math.random() * 1e9), missionIndex: 0, secondsLeft: TOTAL_SECONDS,
    attempts: [], notes: {}, pareceres: {}, conclusion: null, ledger: [],
    startedAt: null, finishedAt: null, expired: false
  };
}
let state = freshState();
const guard = new PinGuard();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.v === 2 ? s : null;
  } catch { return null; }
}
async function log(type, actor, data) {
  await appendEntry(state.ledger, { type, actor, data });
  save();
}

const playerById = (id) => state.players.find(p => p.id === id);
const ownerOf = (mission) => playerById(state.roles[mission.role]);
const roleName = (roleId) => ROLES.find(r => r.id === roleId).name;
const rolesOf = (pid) => ROLES.filter(r => state.roles[r.id] === pid).map(r => r.name);

// ---------- mundo 3D ----------
const world = new MapWorld($("stage"), $("labels"), { reducedMotion });
world.focus("intro", { duration: 0 });
const instruments = new Instruments($("instrument"));
// Gancho só para testes locais; não existe na versão publicada.
if (["localhost", "127.0.0.1"].includes(location.hostname)) window.__game = { world, get state() { return state; } };

// ---------- telas ----------
function show(screen) {
  document.body.dataset.screen = screen;
  world.frameShiftTarget = screen === "mission" ? 0.2 : 0;
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === `s-${screen}`));
  const first = document.querySelector(`#s-${screen} [autofocus], #s-${screen} input:not([type=radio]), #s-${screen} .btn-primary`);
  if (first && screen !== "brief") setTimeout(() => first.focus({ preventScroll: true }), 60);
}
function showPanel(id) {
  for (const p of ["handoff", "decision", "running", "success"]) $(p).hidden = p !== id;
}

let toastTimer;
function toast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ---------- relógio ----------
function fmt(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function clockRunning() {
  return state.phase === "decide" || state.phase === "play";
}
function renderClock() {
  $("clock-value").textContent = fmt(state.secondsLeft);
  const c = $("clock");
  c.classList.toggle("critical", state.secondsLeft <= 600);
  c.classList.toggle("paused", !clockRunning());
  world.setDaylight(0.25 + 0.75 * state.secondsLeft / TOTAL_SECONDS);
  sound.setTension(1 - state.secondsLeft / TOTAL_SECONDS);
}
setInterval(() => {
  if (!clockRunning() || state.secondsLeft <= 0) return;
  state.secondsLeft--;
  if (state.secondsLeft <= 600 && state.secondsLeft % 2 === 0) sound.tick();
  if (state.secondsLeft <= 0) expire();
  renderClock();
  if (state.secondsLeft % 5 === 0) save();
}, 1000);

function spendTime(minutes) {
  const from = state.secondsLeft;
  state.secondsLeft = Math.max(0, state.secondsLeft - minutes * 60);
  const to = state.secondsLeft;
  const c = $("clock");
  c.classList.remove("hit");
  void c.offsetWidth;
  c.classList.add("hit");
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 900);
    $("clock-value").textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step); else renderClock();
  };
  requestAnimationFrame(step);
  if (to <= 0) expire();
}
function expire() {
  if (state.expired) return;
  state.expired = true;
  save();
  sound.alarm();
  const e = $("expired");
  e.hidden = false;
  setTimeout(() => { e.hidden = true; }, 5200);
}

// ---------- trilho de missões ----------
function renderRail() {
  const rail = $("rail");
  rail.innerHTML = "";
  MISSIONS.forEach((m, i) => {
    const li = document.createElement("li");
    const fails = state.attempts.filter(a => a.mission === m.id && a.kind === "classic").length;
    const done = state.attempts.some(a => a.mission === m.id && a.kind === "quantum");
    const current = !done && i === state.missionIndex && ["handoff", "decide", "play", "loss"].includes(state.phase);
    li.className = done ? "done" : current ? "current" : i < state.missionIndex ? "done" : "locked";
    li.innerHTML = `<span class="rail-mark" aria-hidden="true"></span><span class="rail-name">${i + 1}. ${m.title}</span>${fails ? `<span class="rail-fails" aria-label="${fails} tentativa(s) com perda">${"|".repeat(fails)}</span>` : ""}`;
    li.setAttribute("aria-current", current ? "step" : "false");
    rail.appendChild(li);
  });
}

// ---------- PIN ----------
function buildKeypad() {
  const kp = $("keypad");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];
  kp.innerHTML = keys.map(k => {
    if (k === "del") return `<button type="button" data-k="del" aria-label="Apagar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 H20 V18 H9 L3 12 Z M12 9 l6 6 M18 9 l-6 6"/></svg></button>`;
    if (k === "ok") return `<button type="button" data-k="ok" class="ok" aria-label="Confirmar">OK</button>`;
    return `<button type="button" data-k="${k}">${k}</button>`;
  }).join("");
}
buildKeypad();

let pinResolve = null, pinPlayer = null, pinBusy = false;
function askPin(player, reason) {
  return new Promise(resolve => {
    pinResolve = resolve;
    pinPlayer = player;
    $("pin-portrait").innerHTML = portraitSVG(player.characterId, { size: 76 });
    $("pin-title").textContent = `PIN de ${player.codename}`;
    $("pin-reason").textContent = reason;
    $("pin-error").textContent = "";
    $("pin-input").value = "";
    renderPinDots();
    $("pin-modal").hidden = false;
    setTimeout(() => $("pin-input").focus(), 30);
    updateLock();
  });
}
function closePin(result) {
  $("pin-modal").hidden = true;
  const r = pinResolve;
  pinResolve = null;
  r && r(result);
}
function renderPinDots() {
  const n = $("pin-input").value.length;
  [...$("pin-dots").children].forEach((d, i) => d.classList.toggle("on", i < n));
}
let lockTimer;
function updateLock() {
  clearInterval(lockTimer);
  const tick = () => {
    const ms = guard.lockedFor(pinPlayer.id);
    $("pin-modal").classList.toggle("locked", ms > 0);
    if (ms > 0) $("pin-error").textContent = `Bloqueado por ${Math.ceil(ms / 1000)} s após 3 erros.`;
    else { if ($("pin-modal").classList.contains("was-locked")) $("pin-error").textContent = ""; clearInterval(lockTimer); }
    $("pin-modal").classList.toggle("was-locked", ms > 0);
  };
  tick();
  lockTimer = setInterval(tick, 500);
}
async function submitPin() {
  if (pinBusy || !pinPlayer) return;
  const pin = $("pin-input").value;
  if (pin.length !== 4 || guard.lockedFor(pinPlayer.id) > 0) return;
  pinBusy = true;
  // A credencial precisa ser a mesma registrada na cadeia quando a equipe foi formada.
  const team = state.ledger.find(e => e.type === "equipe");
  const reg = team && team.data.jogadores.find(j => j.id === pinPlayer.id);
  if (reg && reg.credencial && reg.credencial !== pinPlayer.cred.pinHash) {
    pinBusy = false;
    $("pin-error").textContent = "Credencial alterada fora do jogo. Acesso recusado.";
    sound.pinFail();
    return;
  }
  const ok = await checkPin(pin, pinPlayer.cred);
  pinBusy = false;
  if (ok) {
    guard.succeed(pinPlayer.id);
    sound.pinOk();
    closePin(true);
  } else {
    const left = guard.fail(pinPlayer.id);
    sound.pinFail();
    $("pin-input").value = "";
    renderPinDots();
    const box = document.querySelector(".pin-box");
    box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
    $("pin-error").textContent = left > 0 ? `PIN incorreto. ${left} tentativa(s) antes do bloqueio.` : "";
    updateLock();
  }
}
$("keypad").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const k = b.dataset.k, inp = $("pin-input");
  if (k === "del") inp.value = inp.value.slice(0, -1);
  else if (k === "ok") return submitPin();
  else if (inp.value.length < 4) inp.value += k;
  sound.key();
  renderPinDots();
  if (inp.value.length === 4) submitPin();
  inp.focus();
});
$("pin-input").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  sound.key();
  renderPinDots();
  if (e.target.value.length === 4) submitPin();
});
$("pin-input").addEventListener("keydown", e => { if (e.key === "Escape") closePin(false); });
$("pin-cancel").addEventListener("click", () => closePin(false));

// ---------- som ----------
function renderSound() {
  const b = $("btn-sound");
  b.setAttribute("aria-pressed", String(!sound.muted));
  b.setAttribute("aria-label", sound.muted ? "Som desligado" : "Som ligado");
  b.classList.toggle("muted", sound.muted);
}
$("btn-sound").addEventListener("click", () => { sound.setMuted(!sound.muted); renderSound(); sound.click(); });
renderSound();

document.addEventListener("click", e => {
  if (e.target.closest("button")) { sound.startAmbient(); }
}, { capture: true });

// ---------- início ----------
const saved = loadSaved();
if (saved && saved.phase !== "start" && saved.players.length) {
  $("btn-resume").hidden = false;
  $("btn-resume").textContent = `Continuar: ${saved.teamName}`;
}
$("btn-play").addEventListener("click", () => {
  sound.select();
  state = freshState();
  save();
  world.focus("overview");
  show("team");
});
$("btn-resume").addEventListener("click", async () => {
  sound.select();
  state = saved;
  const check = await auditState(state);
  if (!check.ok) toast("Atenção: o registro salvo foi alterado fora do jogo.");
  resume();
});
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => { sound.click(); show(b.dataset.back); world.focus("intro"); }));

function resume() {
  world.setScenario(rollScenario(state.seed));
  world.dropLandslides(false);
  world.setJamming(!state.attempts.some(a => a.mission === "m2" && a.kind === "quantum"));
  if (state.attempts.some(a => a.mission === "m1" && a.kind === "quantum")) {
    world.uniforms.uAnomaly.value.w = 1;
    world.revealShelter(true);
    world.uniforms.uHole.value.z = world.cut.R;
  }
  renderRail();
  renderClock();
  if (state.phase === "report" || state.finishedAt) return openReport();
  if (state.phase === "team" || state.phase === "player" || state.phase === "roles" || !state.players.length) {
    state = freshState();
    return show("team");
  }
  if (state.phase === "brief") return startBriefing();
  startMission(state.missionIndex);
}

// ---------- equipe ----------
$("form-team").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("team-name").value.trim();
  if (!name) {
    $("team-name-error").textContent = "Dê um nome para a equipe.";
    $("team-name").focus();
    sound.pinFail();
    return;
  }
  $("team-name-error").textContent = "";
  sound.select();
  state.teamName = name;
  state.count = Number(new FormData(e.target).get("count"));
  state.players = [];
  state.phase = "player";
  openPlayer(0);
});
$("team-name").addEventListener("input", () => { $("team-name-error").textContent = ""; });

// ---------- operador ----------
let playerIndex = 0, charIndex = 0;
const takenChars = () => state.players.map(p => p.characterId);

function openPlayer(i) {
  playerIndex = i;
  $("player-step").textContent = `Jogador ${i + 1} de ${state.count}`;
  $("p-name").value = "";
  $("p-pin").value = "";
  $("p-pin2").value = "";
  $("p-name-error").textContent = "";
  $("p-pin-error").textContent = "";
  charIndex = CHARACTERS.findIndex(c => !takenChars().includes(c.id));
  renderChar(true);
  world.focus("base");
  show("player");
  $("player-submit").textContent = i + 1 < state.count ? "Confirmar e passar a vez" : "Confirmar operador";
}
function renderChar(resetCodename = false) {
  const c = CHARACTERS[charIndex];
  const card = $("char-card");
  card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
  $("char-portrait").innerHTML = portraitSVG(c.id, { size: 168, title: c.codename });
  const taken = takenChars().includes(c.id);
  $("char-taken").hidden = !taken;
  card.classList.toggle("is-taken", taken);
  if (resetCodename || !$("p-codename").dataset.edited) { $("p-codename").value = c.codename; $("p-codename").dataset.edited = ""; }
  $("p-trait").textContent = c.trait;
  $("char-dots").innerHTML = CHARACTERS.map((x, i) => `<li class="${i === charIndex ? "on" : ""} ${takenChars().includes(x.id) ? "taken" : ""}"></li>`).join("");
}
function stepChar(d) {
  sound.click();
  charIndex = (charIndex + d + CHARACTERS.length) % CHARACTERS.length;
  renderChar();
}
$("char-prev").addEventListener("click", () => stepChar(-1));
$("char-next").addEventListener("click", () => stepChar(1));
$("s-player").addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowLeft") stepChar(-1);
  if (e.key === "ArrowRight") stepChar(1);
});
$("p-codename").addEventListener("input", e => { e.target.dataset.edited = "1"; });
for (const id of ["p-pin", "p-pin2"]) $(id).addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); $("p-pin-error").textContent = ""; });
$("p-name").addEventListener("input", () => { $("p-name-error").textContent = ""; });

$("form-player").addEventListener("submit", async e => {
  e.preventDefault();
  const c = CHARACTERS[charIndex];
  if (takenChars().includes(c.id)) { toast("Esse operador já foi escolhido. Use as setas."); sound.pinFail(); return; }
  const name = $("p-name").value.trim();
  const codename = ($("p-codename").value.trim() || c.codename).toUpperCase();
  const pin = $("p-pin").value, pin2 = $("p-pin2").value;
  let bad = false;
  if (!name) { $("p-name-error").textContent = "Digite seu nome. Ele vai no relatório."; bad = true; }
  const problem = pinProblem(pin);
  if (problem) { $("p-pin-error").textContent = problem; bad = true; }
  else if (pin !== pin2) { $("p-pin-error").textContent = "Os dois PINs não conferem."; bad = true; }
  if (state.players.some(p => p.codename === codename)) { $("p-name-error").textContent = "Outro jogador já usa esse codinome."; bad = true; }
  if (!bad) {
    for (const p of state.players) {
      if (await checkPin(pin, p.cred)) { $("p-pin-error").textContent = "Escolha outro PIN: cada jogador precisa de um diferente."; bad = true; break; }
    }
  }
  if (bad) { sound.pinFail(); return; }
  $("player-submit").disabled = true;
  const cred = await createCredential(pin);
  $("player-submit").disabled = false;
  state.players.push({ id: `p${playerIndex + 1}`, characterId: c.id, codename, name, cred, xp: 0, medals: [] });
  save();
  sound.pinOk();
  $("p-pin").value = ""; $("p-pin2").value = "";
  if (playerIndex + 1 < state.count) {
    toast(`${codename} pronto. Passe o teclado para o próximo jogador.`);
    openPlayer(playerIndex + 1);
  } else {
    openRoles();
  }
});
$("player-back").addEventListener("click", () => {
  sound.click();
  if (playerIndex === 0) { show("team"); return; }
  state.players.pop();
  openPlayer(playerIndex - 1);
});

// ---------- funções ----------
function openRoles() {
  state.phase = "roles";
  ROLES.forEach((r, i) => { state.roles[r.id] = state.players[i % state.players.length].id; });
  renderRoles();
  world.focus("overview");
  show("roles");
}
function renderRoles() {
  const board = $("role-board");
  board.innerHTML = ROLES.map(r => {
    const m = MISSIONS[r.mission];
    const chips = state.players.map(p => `
      <label class="chip ${state.roles[r.id] === p.id ? "on" : ""}">
        <input type="radio" name="role-${r.id}" value="${p.id}" ${state.roles[r.id] === p.id ? "checked" : ""}>
        <span class="chip-face">${portraitSVG(p.characterId, { size: 34 })}</span>
        <span>${p.codename}</span>
      </label>`).join("");
    return `<li class="role-row">
      <div class="role-id">${roleSymbolSVG(r.glyph, { size: 46 })}<div><strong>${r.name}</strong><span>Missão ${r.mission + 1} · ${m.title}</span></div></div>
      <div class="role-chips" role="radiogroup" aria-label="Jogador da função ${r.name}">${chips}</div>
    </li>`;
  }).join("");
}
$("role-board").addEventListener("change", e => {
  const role = e.target.name.replace("role-", "");
  state.roles[role] = e.target.value;
  sound.click();
  renderRoles();
});
$("roles-back").addEventListener("click", () => {
  sound.click();
  state.players.pop();
  openPlayer(state.count - 1);
});
$("btn-briefing").addEventListener("click", async () => {
  const unassigned = state.players.filter(p => !rolesOf(p.id).length);
  if (unassigned.length) { toast(`${unassigned.map(p => p.codename).join(", ")} ficou sem função.`); sound.pinFail(); return; }
  sound.select();
  state.startedAt = new Date().toISOString();
  await log("equipe", null, {
    equipe: state.teamName,
    jogadores: state.players.map(p => ({ id: p.id, codinome: p.codename, nome: p.name, personagem: p.characterId, credencial: p.cred.pinHash })),
    funcoes: state.roles, cenario: state.seed
  });
  world.setScenario(rollScenario(state.seed));
  startBriefing();
});

// ---------- briefing ----------
let briefSkip = false;
async function startBriefing() {
  state.phase = "brief";
  save();
  show("brief");
  briefSkip = false;
  const steps = [
    ["abrigo", "Feridos graves estão num abrigo sob 40 m de rocha. Precisam de socorro em menos de 45 minutos.", () => world.pulseShelterHint()],
    ["jammer", "Uma torre inimiga bloqueia todo o sinal de GPS no vale.", () => world.setJamming(true)],
    ["rotas", "Deslizamentos fecharam estradas e patrulhas circulam pelo vale.", () => world.dropLandslides(!reducedMotion)],
    ["fibra", "O posto inimigo grampeou a fibra óptica e grava tudo para decifrar depois.", () => { world.photonMode = "rsa"; world.photons.forEach(p => { p.mesh.visible = true; p.mesh.material.color.setHex(0xe8c35a); }); }],
    ["overview", "Cada um decide na sua vez, com o próprio PIN. O relógio começa agora.", null]
  ];
  for (let i = 0; i < steps.length; i++) {
    if (briefSkip) break;
    const [place, text, fx] = steps[i];
    $("brief-step").textContent = `${i + 1}/${steps.length}`;
    typeText($("brief-text"), text);
    sound.radio();
    world.focus(place, { duration: 1600 });
    if (fx) fx();
    await waitOrSkip(i === 2 ? 4600 : 3800);
  }
  if (briefSkip) {
    world.setJamming(true);
    if (!world.landslideObjs.length) world.dropLandslides(false);
  }
  world.photonMode = "off";
  world.photons.forEach(p => { p.mesh.visible = false; });
  startMission(0);
}
function waitOrSkip(ms) {
  return new Promise(res => {
    const t0 = performance.now();
    const timer = setInterval(() => {
      if (briefSkip || performance.now() - t0 > ms) { clearInterval(timer); res(); }
    }, 100);
  });
}
let typeTimer;
function typeText(el, text) {
  clearInterval(typeTimer);
  if (reducedMotion) { el.textContent = text; return; }
  let i = 0;
  el.textContent = "";
  typeTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i % 3 === 0) sound.type();
    if (i >= text.length) clearInterval(typeTimer);
  }, 22);
}
$("brief-skip").addEventListener("click", () => { briefSkip = true; sound.click(); });

// ---------- missões ----------
let current = null;      // missão ativa
let selected = null;     // opção escolhida
let routeCtx = null;     // dados reais da Missão 3

function m3Context() {
  const scenario = rollScenario(state.seed);
  const routes = countSimpleRoutes(scenario);
  const combos = fleetCombinations(routes);
  const best = bestRoute(scenario);
  const planned = routeStats(scenario, PLANNED_ROUTE);
  return { scenario, routes, combos, best, planned, classicMin: classicalSearchMinutes(combos) };
}

function fmtBig(n) { return Math.round(n).toLocaleString("pt-BR"); }
function fmtDuration(min) {
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 60 * 48) return `${Math.round(min / 60)} h`;
  return `${Math.round(min / 60 / 24).toLocaleString("pt-BR")} dias`;
}

function startMission(i) {
  state.missionIndex = i;
  current = MISSIONS[i];
  selected = null;
  if (current.id === "m3") routeCtx = m3Context();
  world.clearTemp();
  const owner = ownerOf(current);
  state.phase = "handoff";
  save();
  renderRail();
  renderClock();
  show("mission");
  showPanel("handoff");
  $("handoff-mission").textContent = `Missão ${i + 1} de 4 · ${current.title}`;
  $("handoff-portrait").innerHTML = portraitSVG(owner.characterId, { size: 132 });
  $("handoff-title").textContent = `Vez de ${owner.codename}`;
  $("handoff-sub").textContent = `${owner.name} · ${roleName(current.role)}`;
  world.focus(current.place);
  sound.radio();
  $("btn-take").focus();
}

$("btn-take").addEventListener("click", async () => {
  const owner = ownerOf(current);
  const ok = await askPin(owner, `Só ${owner.codename} pode decidir a missão ${state.missionIndex + 1}.`);
  if (!ok) return;
  await log("controle", owner.id, { missao: current.id });
  openDecision();
});

function seededOrder(list, seed) {
  const arr = [...list];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const OPTION_ICONS = {
  gpr: "M4 18 C 8 10, 16 10, 20 18 M7 18 C 9 13, 15 13, 17 18 M12 18 L 12 6",
  thermal: "M5 8 h14 v8 h-14z M9 16 l-2 4 M15 16 l2 4 M12 10 a2 2 0 1 0 0.01 0",
  gravimeter: "M12 3 v4 M8 7 h8 v12 h-8z M12 11 a1.6 1.6 0 1 0 0.01 0 M12 15 a1.6 1.6 0 1 0 0.01 0",
  ins: "M12 4 a8 8 0 1 0 0.01 0 M12 4 v16 M4 12 h16",
  antijam: "M12 20 v-8 M6 6 a8 8 0 0 1 12 0 M8.5 8.5 a4.5 4.5 0 0 1 7 0 M4 4 l16 16",
  qins: "M12 4 a8 8 0 1 0 0.01 0 M12 7 l3 7 l-3 -2 l-3 2 z",
  brute: "M4 6 h16 M4 10 h16 M4 14 h16 M4 18 h16 M8 4 v16 M16 4 v16",
  planned: "M4 18 L 10 10 L 14 14 L 20 6 M17 6 h3 v3",
  qaoa: "M4 12 C 8 4, 16 20, 20 12 M4 12 C 8 20, 16 4, 20 12",
  rsa: "M7 11 h10 v9 h-10z M9 11 v-3 a3 3 0 0 1 6 0 v3",
  vhf: "M12 20 v-9 M8 7 a6 6 0 0 1 8 0 M5 4 a10 10 0 0 1 14 0 M12 11 a1.5 1.5 0 1 0 0.01 0",
  qkd: "M4 12 h16 M8 8 l-4 4 l4 4 M16 8 l4 4 l-4 4 M12 6 v12"
};

function openDecision() {
  state.phase = "decide";
  save();
  renderRail();
  renderClock();
  showPanel("decision");
  const owner = ownerOf(current);
  $("sit-who").innerHTML = portraitSVG(owner.characterId, { size: 64 }) + `<span>${owner.codename}</span>`;
  $("sit-title").textContent = current.title;
  $("sit-text").textContent = current.situation;
  let facts = current.facts;
  if (facts === "dynamic") {
    facts = [["Deslizamentos", `${routeCtx.scenario.landslides.length}`], ["Patrulhas", `${routeCtx.scenario.patrols.length}`], ["Rotas possíveis", fmtBig(routeCtx.routes)], [`Combinações (${FLEET} viaturas × ${DEPARTURE_WINDOWS} horários)`, fmtBig(routeCtx.combos)]];
  }
  $("sit-facts").innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("sit-ask").textContent = current.ask;
  const failed = new Set(state.attempts.filter(a => a.mission === current.id).map(a => a.option));
  const opts = seededOrder(current.options, state.seed + state.missionIndex * 7);
  $("options").innerHTML = opts.map((o, i) => `
    <button type="button" class="option ${failed.has(o.id) ? "failed" : ""}" role="radio" aria-checked="false" data-id="${o.id}" ${failed.has(o.id) ? "disabled aria-disabled=\"true\"" : ""} style="--i:${i}">
      <span class="option-key">${String.fromCharCode(65 + i)}</span>
      <svg class="option-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${OPTION_ICONS[o.id]}"/></svg>
      <strong>${o.name}</strong>
      <span>${o.line}</span>
      ${failed.has(o.id) ? `<svg class="strike" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M8 10 L 92 90 M 92 12 L 10 88"/></svg><em class="option-failed">Falhou</em>` : ""}
    </button>`).join("");
  $("btn-execute").disabled = true;
  selected = null;
  world.focus(current.place, { duration: 1200 });
}

$("options").addEventListener("click", e => {
  const b = e.target.closest(".option");
  if (!b || b.disabled) return;
  selectOption(b);
});
$("options").addEventListener("keydown", e => {
  const list = [...$("options").querySelectorAll(".option:not([disabled])")];
  const i = list.indexOf(document.activeElement);
  if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
});
document.addEventListener("keydown", e => {
  if (state.phase !== "decide" || !$("pin-modal").hidden || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
  const idx = "abc".indexOf(e.key.toLowerCase());
  if (idx >= 0) {
    const b = $("options").children[idx];
    if (b && !b.disabled) { selectOption(b); b.focus(); }
  }
  if (e.key === "Enter" && selected && document.activeElement.classList.contains("option")) $("btn-execute").click();
});
function selectOption(b) {
  sound.select();
  $("options").querySelectorAll(".option").forEach(o => { o.classList.toggle("selected", o === b); o.setAttribute("aria-checked", String(o === b)); });
  selected = current.options.find(o => o.id === b.dataset.id);
  $("btn-execute").disabled = false;
}

$("btn-execute").addEventListener("click", () => {
  if (!selected) return;
  runOption(selected);
});

async function runOption(opt) {
  state.phase = "play";
  save();
  renderClock();
  showPanel("running");
  $("running-name").textContent = opt.name;
  sound.scan();
  const owner = ownerOf(current);
  const ctx = {};
  instruments.clear();
  if (opt.anim === "m1-grav") ctx.onProgress = instruments.gravity();
  else if (opt.anim === "m3-brute") ctx.onProgress = instruments.bruteForce(routeCtx);
  else if (opt.anim === "m3-qaoa") { ctx.onProgress = instruments.qaoa(routeCtx); ctx.best = routeCtx.best; }
  else if (opt.anim === "m4-qkd") ctx.onProgress = instruments.qber(() => sound.alarm());
  else instruments.caption(opt.line);

  world.resetMission(current.id);
  await world.play(opt.anim, ctx);

  if (opt.kind === "classic") {
    await onLoss(opt, owner);
  } else {
    await onSuccess(opt, owner);
  }
}

function lossText(opt) {
  if (current.id !== "m3") return opt.result;
  if (opt.id === "brute") {
    return `${fmtBig(routeCtx.combos)} combinações. Testar uma a uma levaria cerca de ${fmtDuration(routeCtx.classicMin)}. A janela clínica não espera.`;
  }
  return `A rota planejada tem ${routeCtx.planned.blocked} trecho(s) bloqueado(s) por deslizamento. O comboio parou e ficou exposto à patrulha.`;
}

async function onLoss(opt, owner) {
  state.phase = "loss";
  spendTime(opt.lost);
  state.attempts.push({ mission: current.id, option: opt.id, name: opt.name, kind: "classic", player: owner.id, lost: opt.lost, at: new Date().toISOString(), left: state.secondsLeft });
  await log("decisao", owner.id, { missao: current.id, opcao: opt.id, resultado: "perda", minutos: opt.lost });
  renderRail();
  sound.alarm();
  sound.impact();
  $("loss-who").textContent = `Missão ${state.missionIndex + 1} · decisão de ${owner.codename}`;
  $("loss-min").textContent = `−${opt.lost} min`;
  $("loss-tags").innerHTML = opt.tags.map(t => `<li>${t}</li>`).join("");
  $("loss-text").textContent = lossText(opt);
  const L = $("loss");
  L.hidden = false;
  L.classList.remove("in"); void L.offsetWidth; L.classList.add("in");
  $("btn-retry").focus();
}

$("btn-retry").addEventListener("click", () => {
  sound.click();
  $("loss").hidden = true;
  world.resetMission(current.id);
  openDecision();
});

async function onSuccess(opt, owner) {
  const fails = state.attempts.filter(a => a.mission === current.id && a.kind === "classic").length;
  let travel = 0;
  if (current.id === "m3") travel = Math.round(routeCtx.best.minutes);
  if (travel) spendTime(travel);
  state.attempts.push({ mission: current.id, option: opt.id, name: opt.name, kind: "quantum", player: owner.id, lost: travel, at: new Date().toISOString(), left: state.secondsLeft });
  await log("decisao", owner.id, { missao: current.id, opcao: opt.id, resultado: "sucesso", viagem: travel });
  if (current.id === "m2") world.setJamming(false);

  const xp = fails === 0 ? 100 : fails === 1 ? 60 : 30;
  owner.xp += xp;
  if (fails === 0) owner.medals.push(`Primeira tentativa · ${current.title}`);
  state.phase = "note";
  save();
  renderRail();
  renderClock();
  sound.success();

  showPanel("success");
  $("success-title").textContent = fails ? "Missão cumprida" : "Missão cumprida de primeira";
  let readout = current.readout;
  let text = opt.result;
  if (current.id === "m3") {
    const b = routeCtx.best;
    text = `Rota ótima calculada em 1,3 s entre ${fmtBig(routeCtx.combos)} combinações. Comboio chegou ao abrigo.`;
    readout = [["Rota", b.path.map(n => n === "PC" ? "PC" : n === "ABR" ? "Abrigo" : n).join(" → ")], ["Distância", `${(b.meters / 1000).toFixed(1).replace(".", ",")} km`], ["Viagem", `${travel} min`], ["Patrulhas na rota", `${b.patrols}`]];
  }
  $("success-text").textContent = text;
  $("success-readout").innerHTML = readout.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("success-xp").textContent = `${owner.codename} +${xp} XP`;
  $("note-label").textContent = `Nota de campo de ${owner.codename}: com suas palavras, por que essa escolha funcionou?`;
  $("note-text").value = "";
  $("note-text").focus();
}

async function finishNote(text) {
  const owner = ownerOf(current);
  if (text) {
    const at = new Date().toISOString();
    const entry = await appendEntry(state.ledger, { type: "nota", actor: owner.id, data: { missao: current.id, texto: text }, at });
    state.notes[current.id] = { player: owner.id, text, at, hash: entry.hash };
    owner.xp += 20;
    toast(`Nota assinada por ${owner.codename} (+20 XP)`);
  }
  save();
  if (state.missionIndex < MISSIONS.length - 1) startMission(state.missionIndex + 1);
  else finishGame();
}
$("btn-save-note").addEventListener("click", () => {
  const text = $("note-text").value.trim();
  if (!text) { toast("Escreva a nota ou siga sem nota."); $("note-text").focus(); return; }
  sound.pinOk();
  finishNote(text);
});
$("btn-skip-note").addEventListener("click", () => { sound.click(); finishNote(""); });

async function finishGame() {
  state.finishedAt = new Date().toISOString();
  await log("fim", null, { sobrevidaSegundos: state.secondsLeft, expirou: state.expired });
  openReport();
}

// ---------- relatório ----------
const reportHandlers = {
  askPin, log, save, toast, sound,
  getState: () => state
};
function openReport() {
  state.phase = "report";
  save();
  renderRail();
  renderClock();
  world.setDaylight(0.25 + 0.75 * state.secondsLeft / TOTAL_SECONDS);
  world.focus("report", { duration: 2400 });
  show("report");
  renderReport($("report"), reportHandlers);
}
$("btn-pdf").addEventListener("click", () => { sound.click(); exportPdf(state); });
$("btn-print").addEventListener("click", () => { sound.click(); window.print(); });
$("btn-new").addEventListener("click", () => {
  if (!confirm("Começar uma nova partida? O relatório atual continua salvo só se você baixar o PDF.")) return;
  try { localStorage.removeItem(KEY); } catch {}
  location.reload();
});

$("btn-fast").addEventListener("click", () => { world.skip(); sound.click(); });

$("map-key-toggle").addEventListener("click", () => {
  const key = $("map-key");
  const open = !key.classList.toggle("closed");
  $("map-key-toggle").setAttribute("aria-expanded", String(open));
  try { localStorage.setItem("sct.key", open ? "1" : "0"); } catch {}
});
try {
  const pref = localStorage.getItem("sct.key");
  if (pref === "0" || (pref === null && innerWidth < 1100)) { $("map-key").classList.add("closed"); $("map-key-toggle").setAttribute("aria-expanded", "false"); }
} catch {}

renderRail();
renderClock();
show("start");
