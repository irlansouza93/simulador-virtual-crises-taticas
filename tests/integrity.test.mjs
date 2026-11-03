import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pinProblem, createCredential, checkPin, PinGuard,
  appendEntry, verifyLedger, canonical
} from "../js/integrity.js";

test("PIN fraco é recusado", () => {
  assert.ok(pinProblem("123"));
  assert.ok(pinProblem("abcd"));
  assert.ok(pinProblem("1111"));
  assert.ok(pinProblem("1234"));
  assert.ok(pinProblem("9876"));
  assert.equal(pinProblem("4831"), null);
});

test("PIN é guardado só como hash e confere", async () => {
  const cred = await createCredential("4831");
  assert.ok(!JSON.stringify(cred).includes("4831"));
  assert.equal(await checkPin("4831", cred), true);
  assert.equal(await checkPin("4832", cred), false);
  assert.equal(await checkPin("1234", cred), false, "não existe PIN mestre");
});

test("mesmo PIN gera hashes diferentes por jogador (sal)", async () => {
  const a = await createCredential("4831");
  const b = await createCredential("4831");
  assert.notEqual(a.pinHash, b.pinHash);
});

test("3 erros bloqueiam o jogador por 30 s", () => {
  let now = 0;
  const g = new PinGuard({ now: () => now });
  g.fail("p1"); g.fail("p1");
  assert.equal(g.lockedFor("p1"), 0);
  g.fail("p1");
  assert.equal(g.lockedFor("p1"), 30000);
  assert.equal(g.lockedFor("p2"), 0, "bloqueio é individual");
  now = 30001;
  assert.equal(g.lockedFor("p1"), 0);
});

test("cadeia de registros detecta adulteração", async () => {
  const log = [];
  await appendEntry(log, { type: "decisao", actor: "p1", data: { missao: 1, opcao: "quantica" } });
  await appendEntry(log, { type: "parecer", actor: "p2", data: { texto: "Minha análise." } });
  await appendEntry(log, { type: "decisao", actor: "p3", data: { missao: 3, opcao: "classica" } });
  assert.equal((await verifyLedger(log)).ok, true);

  const forged = structuredClone(log);
  forged[1].data.texto = "Texto trocado por outro aluno.";
  assert.deepEqual(await verifyLedger(forged), { ok: false, brokenAt: 1 });

  const reassigned = structuredClone(log);
  reassigned[0].actor = "p2";
  assert.equal((await verifyLedger(reassigned)).ok, false);

  const removed = structuredClone(log);
  removed.splice(1, 1);
  assert.equal((await verifyLedger(removed)).ok, false);
});

test("serialização canônica independe da ordem das chaves", () => {
  assert.equal(canonical({ b: 1, a: [2, { d: 3, c: 4 }] }), canonical({ a: [2, { c: 4, d: 3 }], b: 1 }));
});

test("auditoria detecta texto trocado só no estado salvo", async () => {
  const { auditState, createCredential: cc, appendEntry: add } = await import("../js/integrity.js");
  const cred1 = await cc("4831"), cred2 = await cc("7290");
  const state = {
    players: [{ id: "p1", codename: "FALCÃO", name: "Ana", cred: cred1 }, { id: "p2", codename: "LINCE", name: "Bruno", cred: cred2 }],
    roles: { recon: "p1", nav: "p2", log: "p1", ge: "p2" },
    attempts: [], notes: {}, pareceres: {}, conclusion: null, ledger: []
  };
  await add(state.ledger, { type: "equipe", data: { jogadores: state.players.map(p => ({ id: p.id, codinome: p.codename, nome: p.name, credencial: p.cred.pinHash })), funcoes: state.roles } });
  const e = await add(state.ledger, { type: "parecer", actor: "p1", data: { texto: "Minha análise." } });
  state.pareceres.p1 = { text: "Minha análise.", at: e.at, hash: e.hash };
  assert.equal((await auditState(state)).ok, true);

  const edited = structuredClone(state);
  edited.pareceres.p1.text = "Texto escrito por outro aluno.";
  assert.equal((await auditState(edited)).ok, false);

  const swapped = structuredClone(state);
  swapped.players[1].cred = structuredClone(cred1);
  const r = await auditState(swapped);
  assert.equal(r.ok, false);
  assert.ok(r.problems.some(p => p.includes("PIN de LINCE")));

  const forgedNote = structuredClone(state);
  forgedNote.notes.m1 = { player: "p2", text: "nota inventada", hash: "x" };
  assert.equal((await auditState(forgedNote)).ok, false);
});
