// Som procedural (Web Audio API), sem arquivos externos.

class GameAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.ambient = null;
    try { this.muted = localStorage.getItem("sct.muted") === "1"; } catch {}
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return true;
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem("sct.muted", m ? "1" : "0"); } catch {}
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  tone({ freq = 600, to = null, dur = 0.12, type = "sine", vol = 0.08, at = 0 }) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime + at;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise({ dur = 0.3, vol = 0.05, filter = 1800, q = 0.8, at = 0 }) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime + at;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = filter; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  click() { this.tone({ freq: 1400, dur: 0.04, vol: 0.05, type: "triangle" }); }
  select() { this.tone({ freq: 520, to: 780, dur: 0.09, vol: 0.06, type: "triangle" }); }
  key() { this.tone({ freq: 900 + Math.random() * 120, dur: 0.03, vol: 0.04, type: "square" }); }
  pinOk() { this.tone({ freq: 660, dur: 0.08, vol: 0.07 }); this.tone({ freq: 990, dur: 0.12, vol: 0.07, at: 0.08 }); }
  pinFail() { this.tone({ freq: 220, to: 140, dur: 0.25, vol: 0.09, type: "sawtooth" }); }
  radio() { this.noise({ dur: 0.35, vol: 0.05, filter: 2400, q: 0.6 }); }
  tick() { this.tone({ freq: 1800, dur: 0.02, vol: 0.025, type: "square" }); }
  scan() { this.tone({ freq: 200, to: 1600, dur: 0.6, vol: 0.05, type: "triangle" }); }
  pulse() { this.tone({ freq: 90, to: 42, dur: 0.8, vol: 0.16 }); }
  impact() { this.noise({ dur: 0.9, vol: 0.2, filter: 160, q: 0.4 }); this.tone({ freq: 70, to: 30, dur: 0.7, vol: 0.18 }); }
  alarm() {
    for (let i = 0; i < 3; i++) this.tone({ freq: 620, to: 300, dur: 0.18, vol: 0.09, type: "sawtooth", at: i * 0.22 });
  }
  success() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone({ freq: f, dur: 0.28, vol: 0.07, at: i * 0.09 }));
  }
  type() { this.tone({ freq: 3000 + Math.random() * 600, dur: 0.012, vol: 0.02, type: "square" }); }

  // Ambiente: vento grave e filtrado, bem baixo.
  startAmbient() {
    if (!this.ensure() || this.ambient) return;
    const len = this.ctx.sampleRate * 4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 420;
    const g = this.ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3);
    src.connect(f).connect(g).connect(this.master);
    src.start();
    this.ambient = { src, g, f };
  }

  setTension(level) {
    // 0 = calmo, 1 = crítico: o vento fica mais agudo.
    if (!this.ambient) return;
    this.ambient.f.frequency.setTargetAtTime(420 + level * 900, this.ctx.currentTime, 1.5);
  }
}

export const sound = new GameAudio();
