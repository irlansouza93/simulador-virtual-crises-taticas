import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rollScenario, bestRoute, routeStats, countSimpleRoutes, PLANNED_ROUTE, edgeKey, fleetCombinations
} from "../js/routing.js";

test("cada partida sorteia deslizamentos e patrulhas de forma reproduzível", () => {
  assert.deepEqual(rollScenario(7), rollScenario(7));
  const s = rollScenario(7);
  assert.equal(s.landslides.length, 3);
  assert.equal(s.patrols.length, 2);
  assert.equal(new Set([...s.landslides, ...s.patrols]).size, 5);
});

test("a rota planejada sempre fica bloqueada por um deslizamento", () => {
  for (let seed = 1; seed < 200; seed++) {
    const s = rollScenario(seed);
    assert.ok(routeStats(s, PLANNED_ROUTE).blocked >= 1, `seed ${seed}`);
  }
});

test("a melhor rota nunca passa por via bloqueada e sempre existe", () => {
  for (let seed = 1; seed < 200; seed++) {
    const s = rollScenario(seed);
    const best = bestRoute(s);
    assert.ok(best, `seed ${seed}`);
    assert.equal(best.blocked, 0);
    assert.equal(best.path[0], "PC");
    assert.equal(best.path.at(-1), "ABR");
  }
});

test("a melhor rota é ótima entre todas as rotas simples", () => {
  const s = rollScenario(42);
  const best = bestRoute(s);
  assert.ok(countSimpleRoutes(s) > 100);
  // Busca exaustiva de verificação.
  let min = Infinity;
  const adj = {};
  for (const p of [...s.landslides]) adj[p] = true;
  const nodes = ["PC"];
  (function walk(path) {
    const u = path.at(-1);
    if (u === "ABR") { min = Math.min(min, routeStats(s, path).cost); return; }
    for (const v of ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","ABR"]) {
      if (path.includes(v)) continue;
      const st = routeStats(s, [u, v]);
      if (!st || st.blocked) continue;
      walk([...path, v]);
    }
  })(nodes);
  assert.ok(Math.abs(best.cost - min) < 1e-9);
});

test("combinações da frota passam de milhões", () => {
  assert.ok(fleetCombinations(countSimpleRoutes(rollScenario(1))) > 1e6);
  assert.equal(edgeKey("B", "A"), "A-B");
});
