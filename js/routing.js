// Malha viária da Missão 3: grafo real, deslizamentos e patrulhas sorteados por partida.
// Coordenadas no plano do mapa (x, z), 1 unidade = 50 m.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const METERS_PER_UNIT = 50;

export const NODES = {
  PC:  { x: -44, z: 40, label: "Posto de Comando" },
  A:   { x: -30, z: 34 },
  B:   { x: -36, z: 18 },
  C:   { x: -18, z: 24 },
  D:   { x: -24, z: 6 },
  E:   { x: -6,  z: 30 },
  F:   { x: -8,  z: 10 },
  G:   { x: 6,   z: 20 },
  H:   { x: -14, z: -8 },
  I:   { x: 4,   z: -2 },
  J:   { x: 18,  z: 8 },
  K:   { x: 2,   z: -20 },
  L:   { x: 18,  z: -12 },
  M:   { x: 34,  z: -4 },
  N:   { x: 16,  z: -30 },
  ABR: { x: 30,  z: -26, label: "Abrigo" }
};

// [de, para, tipo] — "estrada" é mais rápida que "trilha".
export const EDGES = [
  ["PC", "A", "estrada"], ["PC", "B", "trilha"], ["A", "C", "estrada"], ["A", "B", "trilha"],
  ["B", "D", "trilha"], ["C", "D", "trilha"], ["C", "E", "estrada"], ["C", "F", "estrada"],
  ["D", "F", "trilha"], ["D", "H", "trilha"], ["E", "G", "estrada"], ["F", "G", "trilha"],
  ["F", "I", "estrada"], ["F", "H", "trilha"], ["G", "J", "estrada"], ["H", "I", "trilha"],
  ["H", "K", "trilha"], ["I", "J", "trilha"], ["I", "L", "estrada"], ["I", "K", "trilha"],
  ["J", "M", "estrada"], ["J", "L", "trilha"], ["K", "L", "trilha"], ["K", "N", "trilha"],
  ["L", "ABR", "estrada"], ["L", "M", "trilha"], ["L", "N", "trilha"], ["M", "ABR", "trilha"],
  ["N", "ABR", "trilha"]
];

// km/h médios de viatura em cada tipo de via.
const SPEED = { estrada: 38, trilha: 16 };

export function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function edgeLengthMeters(a, b) {
  const p = NODES[a], q = NODES[b];
  return Math.hypot(p.x - q.x, p.z - q.z) * METERS_PER_UNIT;
}

// Sorteia o cenário da partida: 3 deslizamentos e 2 patrolas em vias diferentes.
// "Principal" é a rota planejada antes da crise; um deslizamento sempre cai nela.
export const PLANNED_ROUTE = ["PC", "A", "C", "F", "I", "L", "ABR"];

export function rollScenario(seed) {
  const rnd = mulberry32(seed);
  const plannedEdges = [];
  for (let i = 0; i < PLANNED_ROUTE.length - 1; i++) plannedEdges.push(edgeKey(PLANNED_ROUTE[i], PLANNED_ROUTE[i + 1]));
  const pool = EDGES.map(([a, b]) => edgeKey(a, b));
  const pick = (list) => list.splice(Math.floor(rnd() * list.length), 1)[0];

  const onPlanned = plannedEdges.filter(k => !k.includes("PC") && !k.includes("ABR"));
  const landslides = [pick(onPlanned)];
  const rest = pool.filter(k => !landslides.includes(k) && !k.includes("PC") && !k.includes("ABR"));
  while (landslides.length < 3) landslides.push(pick(rest));

  const patrolPool = pool.filter(k => !landslides.includes(k) && !k.includes("PC") && !k.includes("ABR"));
  const patrols = [pick(patrolPool), pick(patrolPool)];

  const scenario = { seed, landslides, patrols };
  // Garante que sempre existe ao menos uma rota possível.
  if (!bestRoute(scenario)) return rollScenario(seed + 1);
  return scenario;
}

function adjacency(scenario, { avoidBlocked = true } = {}) {
  const adj = {};
  for (const id of Object.keys(NODES)) adj[id] = [];
  for (const [a, b, kind] of EDGES) {
    const key = edgeKey(a, b);
    if (avoidBlocked && scenario.landslides.includes(key)) continue;
    const meters = edgeLengthMeters(a, b);
    const minutes = (meters / 1000) / SPEED[kind] * 60;
    const patrol = scenario.patrols.includes(key);
    const edge = { key, kind, meters, minutes, patrol };
    adj[a].push({ to: b, ...edge });
    adj[b].push({ to: a, ...edge });
  }
  return adj;
}

// Custo de uma rota: tempo + atraso grande para cruzar patrulha (desvio, espera, risco).
export const PATROL_PENALTY_MIN = 14;

export function routeStats(scenario, path) {
  const adj = adjacency(scenario, { avoidBlocked: false });
  let minutes = 0, meters = 0, patrols = 0, blocked = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const e = adj[path[i]].find(n => n.to === path[i + 1]);
    if (!e) return null;
    minutes += e.minutes;
    meters += e.meters;
    if (e.patrol) patrols++;
    if (scenario.landslides.includes(e.key)) blocked++;
  }
  return { path, minutes, meters, patrols, blocked, cost: minutes + patrols * PATROL_PENALTY_MIN };
}

// Dijkstra sobre o grafo sem vias bloqueadas.
export function bestRoute(scenario, from = "PC", to = "ABR") {
  const adj = adjacency(scenario);
  const dist = {}, prev = {}, done = new Set();
  for (const id of Object.keys(NODES)) dist[id] = Infinity;
  dist[from] = 0;
  while (true) {
    let u = null;
    for (const id of Object.keys(dist)) if (!done.has(id) && (u === null || dist[id] < dist[u])) u = id;
    if (u === null || dist[u] === Infinity) break;
    if (u === to) break;
    done.add(u);
    for (const e of adj[u]) {
      const c = dist[u] + e.minutes + (e.patrol ? PATROL_PENALTY_MIN : 0);
      if (c < dist[e.to]) { dist[e.to] = c; prev[e.to] = u; }
    }
  }
  if (dist[to] === Infinity) return null;
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return routeStats(scenario, path);
}

// Conta todas as rotas simples possíveis (sem repetir ponto) entre origem e destino.
export function countSimpleRoutes(scenario, from = "PC", to = "ABR") {
  const adj = adjacency(scenario);
  const seen = new Set([from]);
  let count = 0;
  (function walk(u) {
    if (u === to) { count++; return; }
    for (const e of adj[u]) {
      if (seen.has(e.to)) continue;
      seen.add(e.to);
      walk(e.to);
      seen.delete(e.to);
    }
  })(from);
  return count;
}

// Lista até `limit` rotas simples (para desenhar a superposição na cena).
export function listSimpleRoutes(scenario, limit = 60, from = "PC", to = "ABR") {
  const adj = adjacency(scenario);
  const out = [];
  const path = [from];
  (function walk(u) {
    if (out.length >= limit) return;
    if (u === to) { out.push([...path]); return; }
    for (const e of adj[u]) {
      if (path.includes(e.to)) continue;
      path.push(e.to);
      walk(e.to);
      path.pop();
    }
  })(from);
  return out;
}

// Uma frota de 3 viaturas, cada uma podendo partir em 4 janelas de horário:
// combinações = (rotas × janelas) ^ viaturas.
export const FLEET = 3;
export const DEPARTURE_WINDOWS = 4;

export function fleetCombinations(routes) {
  return Math.pow(routes * DEPARTURE_WINDOWS, FLEET);
}

// Tempo que uma busca exaustiva clássica gastaria, simulando cada combinação
// a 0,5 ms (com patrulhas e terreno). Retorna minutos.
export function classicalSearchMinutes(combinations, msPerCombination = 0.5) {
  return combinations * msPerCombination / 60000;
}
