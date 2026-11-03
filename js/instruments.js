// Instrumentos mostrados durante a execução de uma decisão.
// Cada um devolve onProgress(t), com t de 0 a 1, chamado pela sequência da cena.

const fmt = (n) => Math.round(n).toLocaleString("pt-BR");

export class Instruments {
  constructor(el) { this.el = el; }

  clear() { this.el.innerHTML = ""; this.el.className = "instrument"; }

  caption(text) {
    this.el.innerHTML = `<p class="inst-caption">${text}</p>`;
    return () => {};
  }

  // Perfil gravimétrico ao longo da varredura: o abrigo aparece como vale negativo.
  gravity() {
    this.el.classList.add("inst-grav");
    const W = 320, H = 120, N = 120;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const dip = -44.2 * Math.exp(-Math.pow((x - 0.56) / 0.09, 2));
      const noise = Math.sin(i * 1.7) * 1.6 + Math.sin(i * 0.43) * 2.2;
      pts.push([x, dip + noise]);
    }
    const y = (v) => 18 + (8 - v) / 60 * (H - 30);
    this.el.innerHTML = `
      <div class="inst-head"><span>Δg (μGal)</span><strong class="inst-value" data-v>0,0</strong></div>
      <svg viewBox="0 0 ${W} ${H}" class="inst-chart" aria-hidden="true">
        <line x1="0" x2="${W}" y1="${y(0)}" y2="${y(0)}" class="axis"/>
        <line x1="0" x2="${W}" y1="${y(-40)}" y2="${y(-40)}" class="axis dashed"/>
        <text x="4" y="${y(-40) - 4}" class="axis-label">−40</text>
        <polyline class="trace" points=""/>
      </svg>
      <p class="inst-foot">Varredura passiva · emissão 0,00 dBm</p>`;
    const line = this.el.querySelector(".trace");
    const val = this.el.querySelector("[data-v]");
    return (t) => {
      const n = Math.max(1, Math.floor(t * N));
      line.setAttribute("points", pts.slice(0, n + 1).map(([x, v]) => `${(x * W).toFixed(1)},${y(v).toFixed(1)}`).join(" "));
      const min = Math.min(...pts.slice(0, n + 1).map(p => p[1]));
      val.textContent = min.toFixed(1).replace(".", ",");
      this.el.classList.toggle("found", min < -40);
    };
  }

  // Busca exaustiva: mostra quantas combinações deu para testar no tempo da animação.
  bruteForce(ctx) {
    this.el.classList.add("inst-brute");
    const perSecond = 2000; // 0,5 ms por combinação
    this.el.innerHTML = `
      <div class="inst-head"><span>Combinações testadas</span><strong class="inst-value" data-n>0</strong></div>
      <div class="bar"><i data-bar></i></div>
      <p class="inst-foot">de ${fmt(ctx.combos)} · ${fmt(perSecond)} por segundo</p>`;
    const n = this.el.querySelector("[data-n]");
    const bar = this.el.querySelector("[data-bar]");
    return (t) => {
      const tested = t * 5.4 * perSecond;
      n.textContent = fmt(tested);
      bar.style.width = `${Math.max(0.4, (tested / ctx.combos) * 100)}%`;
    };
  }

  // Amplitudes: começam iguais (superposição) e a interferência concentra na melhor rota.
  qaoa(ctx) {
    this.el.classList.add("inst-qaoa");
    const qubits = Math.ceil(Math.log2(ctx.combos));
    const bars = 14, winner = 9;
    this.el.innerHTML = `
      <div class="inst-head"><span>${qubits} qubits · amplitude por rota</span><strong class="inst-value" data-p>|ψ⟩</strong></div>
      <div class="amps">${Array.from({ length: bars }, (_, i) => `<i class="${i === winner ? "win" : ""}"></i>`).join("")}</div>
      <p class="inst-foot" data-f>Superposição de todas as rotas</p>`;
    const amps = [...this.el.querySelectorAll(".amps i")];
    const foot = this.el.querySelector("[data-f]");
    const p = this.el.querySelector("[data-p]");
    return (t) => {
      amps.forEach((a, i) => {
        const base = 0.32 + 0.08 * Math.sin(i * 2.3 + t * 30);
        const h = i === winner ? base + (0.98 - base) * Math.pow(t, 1.6) : base * (1 - Math.pow(t, 1.3)) + 0.03;
        a.style.transform = `scaleY(${h.toFixed(3)})`;
      });
      if (t > 0.55) foot.textContent = "Interferência cancela rotas com bloqueio e patrulha";
      if (t >= 0.99) { foot.textContent = "Rota ótima encontrada em 1,3 s"; p.textContent = "100 %"; }
      else p.textContent = `${Math.round(7 + 93 * Math.pow(t, 1.6))} %`;
    };
  }

  // BB84: QBER normal, espião eleva o erro, chave descartada, nova chave limpa.
  qber(onAlarm) {
    this.el.classList.add("inst-qber");
    const bases = Array.from({ length: 16 }, () => (Math.random() < 0.5 ? "+" : "×"));
    this.el.innerHTML = `
      <div class="inst-head"><span>QBER (taxa de erro quântico)</span><strong class="inst-value" data-q>0,8 %</strong></div>
      <div class="gauge"><i data-g></i><b style="left:${11 / 30 * 100}%"></b><em style="left:${11 / 30 * 100}%">limite 11 %</em></div>
      <div class="photons">${bases.map(b => `<span>${b}</span>`).join("")}</div>
      <p class="inst-foot" data-f>Fótons únicos polarizados na fibra</p>`;
    const g = this.el.querySelector("[data-g]");
    const q = this.el.querySelector("[data-q]");
    const f = this.el.querySelector("[data-f]");
    const ph = [...this.el.querySelectorAll(".photons span")];
    let alarmed = false;
    return (t) => {
      let v;
      if (t < 0.45) { v = 0.8 + Math.sin(t * 40) * 0.3; f.textContent = "Fótons únicos polarizados na fibra"; }
      else if (t < 0.65) {
        const k = (t - 0.45) / 0.2;
        v = 0.8 + 24.2 * Math.min(1, k * 1.4);
        f.textContent = "Espião mediu os fótons: o estado colapsou";
        this.el.classList.add("alert");
        if (!alarmed && v > 11) { alarmed = true; onAlarm && onAlarm(); }
      } else {
        v = 0.8 + Math.sin(t * 30) * 0.2;
        this.el.classList.remove("alert");
        this.el.classList.add("clean");
        f.textContent = t < 0.8 ? "Chave descartada · gerando nova chave" : "Chave íntegra · relatório cifrado com one-time pad";
      }
      g.style.width = `${Math.min(100, (v / 30) * 100)}%`;
      q.textContent = `${v.toFixed(1).replace(".", ",")} %`;
      const lit = Math.floor(t * 64) % ph.length;
      ph.forEach((s, i) => s.classList.toggle("on", i === lit));
    };
  }
}
