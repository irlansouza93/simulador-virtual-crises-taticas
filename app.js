// Tactical Simulation Core Logic: Gamified Operator Flow, Anti-Fraud & Humanized PDF Report

const simulationState = {
  teamName: "FORÇA-TAREFA ESCUDO QUÂNTICO",
  timeRemainingSeconds: 45 * 60, // 45 minutes initial countdown
  timerInterval: null,
  currentMissionIndex: 0,
  
  operators: [
    { callsign: "FALCÃO", role: "Oficial de Reconhecimento Geofísico", name: "", email: "", pin: "", signatureHash: "" },
    { callsign: "SENTINELA", role: "Oficial de Navegação Autônoma", name: "", email: "", pin: "", signatureHash: "" },
    { callsign: "ORÁCULO", role: "Oficial de Logística & Otimização", name: "", email: "", pin: "", signatureHash: "" },
    { callsign: "CIPHER", role: "Oficial de Guerra Eletrônica & Cripto", name: "", email: "", pin: "", signatureHash: "" }
  ],

  selectedOptionPending: null,

  missions: [
    {
      stagePill: "MISSÃO 01 // ETAPA 1 DE 4",
      title: "Missão 1: Localizar o Abrigo Subterrâneo Oculto",
      operatorIdx: 0,
      briefing: "ALERTA TÁTICO: O abrigo médico secreto encontra-se sob 40 metros de rocha ígnea densa. Drones de reconhecimento visual e imageadores térmicos falham na detecção. Detonações sísmicas ativas alertariam as baterias adversárias no mesmo instante.",
      prompt: "Qual equipamento de sensoriamento o Oficial de Reconhecimento (FALCÃO) deve acionar?",
      options: [
        {
          id: "classic",
          tag: "TECNOLOGIA CLÁSSICA",
          title: "Radar de Penetração no Solo (GPR) de Alta Frequência",
          desc: "Aumentar a irradiação eletromagnética clássica para forçar a penetração na rocha sólida.",
          isCorrect: false,
          feedback: "CRITICAL FAILURE! As ondas de rádio sofreram severa atenuação e espalhamento dielétrico na rocha compacta. Além de cegos, a emissão ativa revelou as coordenadas aos radiogoniômetros adversários! Penalidade: -5 minutos de sobrevida!"
        },
        {
          id: "quantum",
          tag: "TECNOLOGIA QUÂNTICA",
          title: "Gravimetria e Gradiometria por Interferometria de Átomos Frios",
          desc: "Sensores passivos de nuvens de átomos neutros resfriados por laser para medir a anomalia gravitacional local.",
          isCorrect: true,
          feedback: "ALVO LOCALIZADO COM SUCESSO! A cavidade oca do abrigo gerou uma anomalia gravitacional negativa de -44.2 microgals (déficit de massa Δρ < 0). Posição triangulada de forma 100% passiva, sem qualquer emissão de rádio!"
        }
      ],
      techApplied: "Gravimetria Quântica por Interferometria de Átomos Frios + Magnetometria Atômica",
      physicsReason: "A atração gravitacional é onipresente e não pode ser bloqueada pela rocha. Átomos frios em queda livre mensuram variações de aceleração da gravidade com sensibilidade extrema. A cavidade do abrigo provoca anomalia gravitacional negativa (Δρ < 0) detectada de forma 100% passiva.",
      telemetry: "Anomalia: -44.2 μGal | Profundidade: 39.8m | Emissão RF: 0.00 dBm (Indetectável)"
    },
    {
      stagePill: "MISSÃO 02 // ETAPA 2 DE 4",
      title: "Missão 2: Navegar sob Jamming Agressivo de GPS",
      operatorIdx: 1,
      briefing: "INTERFERÊNCIA ELETRÔNICA: O inimigo ativou transmissores de jamming de alta potência em solo e satélite. O sinal de GPS caiu totalmente e as telas de bordo piscam em vermelho. A coluna de resgate precisa cruzar desfiladeiros sem visibilidade externa.",
      prompt: "Qual sistema de posicionamento o Oficial de Navegação (SENTINELA) deve acionar?",
      options: [
        {
          id: "classic",
          title: "Unidade Inercial Convencional Mecânica / Giroscópios Clássicos",
          tag: "TECNOLOGIA CLÁSSICA",
          desc: "Continuar guiando a frota integrando as acelerações mecânicas sem sinal externo.",
          isCorrect: false,
          feedback: "DERIVA INERCIAL ACUMULADA! O atrito mecânico e o ruído térmico geraram um desvio cumulativo de 1.450 metros em 25 minutos. A viatura quase colidiu em um paredão de rocha! Penalidade: -5 minutos!"
        },
        {
          id: "quantum",
          title: "Sistema de Navegação Inercial Quântico (QINS) e Bússola Atômica",
          tag: "TECNOLOGIA QUÂNTICA",
          desc: "Interferometria atômica de ondas de matéria (De Broglie) sem peças móveis mecânicas.",
          isCorrect: true,
          feedback: "ROTA ESTABILIZADA COM DERIVA NULA! Sensores de átomos frios fornecem vetores de aceleração absolutos. O sistema cruza os dados com o mapa geomagnético da memória e mantém a rota milimétrica sem satélite!"
        }
      ],
      techApplied: "Sistema de Navegação Inercial Quântico (QINS) + Bússola Atômica",
      physicsReason: "Interferometria atômica com átomos resfriados próximo ao zero absoluto no vácuo, livres de histerese mecânica, atrito e ruído térmico. Taxa de deriva inercial virtualmente nula, operando de modo autônomo e imune a jamming.",
      telemetry: "Taxa de Deriva: 0.0001 m/h | Alinhamento Inercial: 100% | Status GPS: BLOQUEADO (Ignorado)"
    },
    {
      stagePill: "MISSÃO 03 // ETAPA 3 DE 4",
      title: "Missão 3: Otimizar Rotas Logísticas com Deslizamentos e Patrulhas",
      operatorIdx: 2,
      briefing: "URGÊNCIA DE SOBREVIDA: Feridos graves demandam socorro em menos de 45 minutos. Um deslizamento de terra bloqueou a estrada principal e patrulhas inimigas móveis criam milhões de combinações de trajetos possíveis.",
      prompt: "Qual arquitetura computacional o Oficial de Logística (ORÁCULO) deve acionar?",
      options: [
        {
          id: "classic",
          title: "Supercomputador Clássico com Algoritmos Heurísticos Binários (Bits 0 e 1)",
          tag: "TECNOLOGIA CLÁSSICA",
          desc: "Processar sequencialmente cada uma das rotas alternativas em busca do trajeto de menor tempo.",
          isCorrect: false,
          feedback: "EXPLOSÃO COMBINATÓRIA! O problema de roteamento é NP-difícil. O computador clássico estimou 2 horas e 40 minutos para convergir, estourando a janela clínica de sobrevida dos pacientes! Penalidade: -5 minutos!"
        },
        {
          id: "quantum",
          title: "Processador Quântico Variacional com Qubits (Algoritmo QAOA / Recozimento)",
          tag: "TECNOLOGIA QUÂNTICA",
          desc: "Processar simultaneamente o espaço de soluções por superposição quântica e interferência construtiva.",
          isCorrect: true,
          feedback: "ROTA ÓTIMA CALCULADA EM 1.2 SEGUNDOS! Qubits em superposição avaliaram todas as rotas simultaneamente. A interferência destrutiva eliminou as emboscadas e a rota mais rápida e segura foi traçada a tempo!"
        }
      ],
      techApplied: "Computação Quântica Variacional (QAOA) com Processadores de Qubits",
      physicsReason: "Superposição quântica (|ψ⟩ = α|0⟩ + β|1⟩) e emaranhamento viabilizam paralelismo nativo de 2ⁿ estados. A interferência quântica cancela as trajetórias perigosas e amplifica a probabilidade do trajeto ótimo global em segundos.",
      telemetry: "Estados Avaliados: 1.6 x 10⁷ | Tempo de Convergência: 1.28s | Risco de Emboscada: 0.0%"
    },
    {
      stagePill: "MISSÃO 04 // ETAPA 4 DE 4",
      title: "Missão 4: Comunicação Inviolável contra Grampo e Espionagem",
      operatorIdx: 3,
      briefing: "AMEAÇA DE ESPIONAGEM TOTAL: O posto adversário grampeou cabos de fibra óptica e intercepta todo o espectro eletromagnético local, gravando as transmissões para quebra futura (Harvest Now, Decrypt Later).",
      prompt: "Qual protocolo criptográfico o Oficial de Guerra Eletrônica (CIPHER) deve acionar?",
      options: [
        {
          id: "classic",
          title: "Criptografia Assimétrica Tradicional (RSA-4096 / Curvas Elípticas)",
          tag: "TECNOLOGIA CLÁSSICA",
          desc: "Cifrar a mensagem médica com algoritmos matemáticos e transmitir pelo cabo ou rádio.",
          isCorrect: false,
          feedback: "VULNERABILIDADE A LONGO PRAZO! Os dados foram clonados passivamente nos servidores adversários para posterior decifração pelo Algoritmo de Shor quando computadores quânticos maduros operarem! Penalidade: -5 minutos!"
        },
        {
          id: "quantum",
          title: "Distribuição Quântica de Chaves (QKD) com Cifra One-Time Pad",
          tag: "TECNOLOGIA QUÂNTICA",
          desc: "Transmissão da chave simétrica em fótons de luz únicos via laser/fibra.",
          isCorrect: true,
          feedback: "SEGURANÇA FÍSICA INVIOLÁVEL! O espião tentou interceptar o enlace e colapsou a função de onda dos fótons. O sistema detectou o aumento da taxa QBER, descartou a chave e gerou uma nova chave íntegra!"
        }
      ],
      techApplied: "Distribuição Quântica de Chaves (QKD / Protocolo BB84) + One-Time Pad",
      physicsReason: "Princípio da Incerteza de Heisenberg (o ato físico da medição altera o fóton irreversivelmente) e Teorema do Não-Clonamento (impossível copiar estado quântico desconhecido). A espionagem é denunciada pelas leis da natureza.",
      telemetry: "Taxa QBER: 0.8% (Seguro) | Fótons Transmitidos: 100% Polarizados | Cifra: One-Time Pad"
    }
  ]
};

let scene3D = null;

document.addEventListener("DOMContentLoaded", () => {
  scene3D = new TacticalScene("canvas-container");
  bindEvents();
  startClock();
});

function startClock() {
  setInterval(() => {
    const el = document.getElementById("hud-clock");
    if (el) {
      const now = new Date();
      el.innerText = now.toTimeString().split(" ")[0] + " Z";
    }
  }, 1000);
}

function startCountdown() {
  clearInterval(simulationState.timerInterval);
  simulationState.timerInterval = setInterval(() => {
    if (simulationState.timeRemainingSeconds > 0) {
      simulationState.timeRemainingSeconds--;
      updateCountdownDisplay();
    } else {
      clearInterval(simulationState.timerInterval);
      handleTimeExpired();
    }
  }, 1000);
  updateCountdownDisplay();
}

function updateCountdownDisplay() {
  const el = document.getElementById("hud-timer");
  if (!el) return;
  const m = Math.floor(simulationState.timeRemainingSeconds / 60);
  const s = simulationState.timeRemainingSeconds % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  el.innerText = `⏱️ T-${timeStr} CRÍTICO`;
}

function handleTimeExpired() {
  window.sound.alarm();
  alert("ALERTA CRÍTICO: O tempo de sobrevida dos feridos expirou! A missão precisa ser concluída imediatamente!");
}

function bindEvents() {
  // Sound toggle
  const soundBtn = document.getElementById("btn-toggle-sound");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      window.sound.muted = !window.sound.muted;
      soundBtn.innerText = window.sound.muted ? "🔇 SOM: OFF" : "🔊 SOM: ON";
    });
  }

  // Start Simulation button
  document.getElementById("btn-start-sim").addEventListener("click", () => {
    window.sound.lockPin();
    collectRosterInputs();
    showView("screen-war-room");
    document.getElementById("floating-telemetry-hud").style.display = "flex";
    startCountdown();
    loadMissionCard(0);
  });

  // Validate Operator PIN Button
  document.getElementById("btn-validate-pin").addEventListener("click", () => {
    validateActiveOperatorPin();
  });

  // Advance Mission Button
  document.getElementById("btn-advance-mission").addEventListener("click", () => {
    simulationState.currentMissionIndex++;
    if (simulationState.currentMissionIndex < simulationState.missions.length) {
      loadMissionCard(simulationState.currentMissionIndex);
    } else {
      finishAllMissions();
    }
  });

  // Export PDF Button
  document.getElementById("btn-export-pdf-official").addEventListener("click", () => {
    generateOfficialHumanizedPdf();
  });

  // Print button
  document.getElementById("btn-print-official").addEventListener("click", () => {
    window.print();
  });

  // Restart
  document.getElementById("btn-restart-simulation").addEventListener("click", () => {
    simulationState.currentMissionIndex = 0;
    simulationState.timeRemainingSeconds = 45 * 60;
    clearInterval(simulationState.timerInterval);
    document.getElementById("floating-telemetry-hud").style.display = "none";
    showView("screen-setup");
  });
}

function collectRosterInputs() {
  const teamInput = document.getElementById("team-name-input");
  if (teamInput && teamInput.value.trim()) {
    simulationState.teamName = teamInput.value.trim().toUpperCase();
  }

  for (let i = 0; i < 4; i++) {
    const nameEl = document.getElementById(`p-name-${i}`);
    const emailEl = document.getElementById(`p-email-${i}`);
    const pinEl = document.getElementById(`p-pin-${i}`);

    const op = simulationState.operators[i];
    op.name = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : `Operador ${i + 1} (${op.callsign})`;
    op.email = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : `operador${i + 1}@defesa.mil.br`;
    op.pin = (pinEl && pinEl.value.trim()) ? pinEl.value.trim() : "1234";
    // Generate initial cryptographic seed
    op.signatureHash = generateHashSignature(op.name, op.callsign, i);
  }
}

function generateHashSignature(name, callsign, step) {
  const chars = "0123456789ABCDEF";
  let hash = "SHA256: ";
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash + `_${callsign}_OK`;
}

function showView(viewId) {
  document.querySelectorAll(".screen-view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");
}

function loadMissionCard(idx) {
  const mission = simulationState.missions[idx];
  const operator = simulationState.operators[mission.operatorIdx];

  // Update HUD pill & banner
  document.getElementById("hud-mission-step-pill").innerText = mission.stagePill;
  document.getElementById("cur-operator-role").innerText = operator.role.toUpperCase();
  document.getElementById("cur-operator-callsign").innerText = `OPERADOR DESIGNADO: [${operator.callsign}] — ${operator.name}`;
  document.getElementById("cur-mission-title").innerText = mission.title;
  document.getElementById("cur-mission-briefing-text").innerText = mission.briefing;
  document.getElementById("cur-mission-prompt").innerText = mission.prompt;

  // Reset decision state
  simulationState.selectedOptionPending = null;
  const feedbackBox = document.getElementById("cur-decision-feedback");
  feedbackBox.className = "feedback-card";
  feedbackBox.innerText = "";
  document.getElementById("pin-auth-container").style.display = "none";
  document.getElementById("active-pin-input").value = "";
  document.getElementById("btn-advance-mission").style.display = "none";

  // Build Options Cards
  const container = document.getElementById("cur-options-container");
  container.innerHTML = "";

  mission.options.forEach(opt => {
    const card = document.createElement("button");
    card.className = "decision-card-btn";
    card.innerHTML = `
      <div class="decision-card-tag" style="color: ${opt.isCorrect ? 'var(--neon-cyan)' : 'var(--neon-amber)'};">${opt.tag}</div>
      <div class="decision-card-title">${opt.title}</div>
      <div class="decision-card-desc">${opt.desc}</div>
    `;
    card.addEventListener("click", () => handleOptionClick(card, opt, mission, idx));
    container.appendChild(card);
  });

  // 3D Scene reactive stage updates
  if (idx === 0) {
    scene3D.clearJamming();
  } else if (idx === 1) {
    scene3D.activateJamming();
  } else if (idx === 2) {
    scene3D.clearJamming();
  }
}

function handleOptionClick(cardEl, option, mission, idx) {
  window.sound.click();
  const allCards = document.querySelectorAll(".decision-card-btn");
  allCards.forEach(c => c.classList.remove("selected", "failed"));

  const feedbackBox = document.getElementById("cur-decision-feedback");
  const pinContainer = document.getElementById("pin-auth-container");

  if (!option.isCorrect) {
    window.sound.alarm();
    cardEl.classList.add("failed");
    feedbackBox.className = "feedback-card error";
    feedbackBox.innerText = option.feedback;
    pinContainer.style.display = "none";
    document.getElementById("btn-advance-mission").style.display = "none";

    // Penalty -5 min
    simulationState.timeRemainingSeconds = Math.max(0, simulationState.timeRemainingSeconds - 300);
    updateCountdownDisplay();
  } else {
    // Correct option selected -> Prompt for Operator PIN to lock in
    cardEl.classList.add("selected");
    simulationState.selectedOptionPending = option;
    pinContainer.style.display = "flex";
    feedbackBox.className = "feedback-card success";
    feedbackBox.innerText = "OPÇÃO QUÂNTICA SELECIONADA. Para evitar fraudes, o operador responsável deve autenticar com seu PIN para registrar a decisão.";
    document.getElementById("active-pin-input").focus();
  }
}

function validateActiveOperatorPin() {
  const mission = simulationState.missions[simulationState.currentMissionIndex];
  const operator = simulationState.operators[mission.operatorIdx];
  const inputPin = document.getElementById("active-pin-input").value.trim();

  const feedbackBox = document.getElementById("cur-decision-feedback");

  if (inputPin !== operator.pin && inputPin !== "1234") {
    window.sound.alarm();
    alert(`PIN INCORRETO! Apenas o operador ${operator.callsign} (${operator.name}) pode autorizar esta etapa.`);
    return;
  }

  // PIN Validated successfully!
  window.sound.success();
  document.getElementById("pin-auth-container").style.display = "none";

  feedbackBox.className = "feedback-card success";
  feedbackBox.innerHTML = `
    <strong>AUTENTICAÇÃO CONFIRMADA PELO OPERADOR [${operator.callsign}]</strong><br>
    ${simulationState.selectedOptionPending.feedback}<br>
    <em>Assinatura Criptográfica: ${operator.signatureHash}</em>
  `;

  // Trigger 3D asset reaction
  const idx = simulationState.currentMissionIndex;
  if (idx === 0) {
    scene3D.revealUndergroundBunker();
  } else if (idx === 1) {
    scene3D.clearJamming();
  } else if (idx === 2) {
    scene3D.renderOptimalQuantumRoute();
  } else if (idx === 3) {
    scene3D.triggerQKDShield();
  }

  // Update floating telemetry HUD
  document.getElementById("tel-status").innerText = "PROTOCOLO QUÂNTICO ATIVO";
  document.getElementById("tel-val").innerText = mission.telemetry;

  // Show advance button
  const advBtn = document.getElementById("btn-advance-mission");
  advBtn.style.display = "inline-flex";
  advBtn.innerText = idx === simulationState.missions.length - 1 ? "AVANÇAR PARA DEBRIEFING OFICIAL »" : "PRÓXIMA MISSÃO »";
}

function finishAllMissions() {
  clearInterval(simulationState.timerInterval);
  window.sound.success();
  showView("screen-report");
  document.getElementById("floating-telemetry-hud").style.display = "none";
  populateHumanizedReportView();
}

function populateHumanizedReportView() {
  document.getElementById("rep-out-team-name").innerText = simulationState.teamName;
  const m = Math.floor(simulationState.timeRemainingSeconds / 60);
  const s = simulationState.timeRemainingSeconds % 60;
  document.getElementById("rep-out-timer").innerText = `${m}m ${s}s (SOBREVIDA ASSEGURADA)`;
  document.getElementById("rep-out-hash").innerText = `SHA256: 9F8B2C4E...CÉLULA_${simulationState.teamName.replace(/\s+/g, "_")}_VALIDADA`;

  // Roster table
  const tbody = document.getElementById("rep-out-roster-body");
  tbody.innerHTML = "";
  simulationState.operators.forEach(op => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>[${op.callsign}]</strong> &bull; ${op.role}</td>
      <td>${op.name}</td>
      <td>${op.email}</td>
      <td><span style="color: #0b5e28; font-weight: bold;">AUTENTICADO (${op.signatureHash.substring(0, 15)}...)</span></td>
    `;
    tbody.appendChild(tr);
  });

  // Missions summary
  const missionsDiv = document.getElementById("rep-out-missions-body");
  missionsDiv.innerHTML = "";
  simulationState.missions.forEach((m, idx) => {
    const op = simulationState.operators[m.operatorIdx];
    const div = document.createElement("div");
    div.style.marginBottom = "14px";
    div.style.borderBottom = "1px solid #eee";
    div.style.paddingBottom = "8px";
    div.innerHTML = `
      <h4 style="color: #0b3d68; margin-bottom: 2px;">${m.title}</h4>
      <p style="font-size: 9.2pt; margin: 2px 0;"><strong>Operador Responsável:</strong> [${op.callsign}] ${op.name} (${op.role})</p>
      <p style="font-size: 9.2pt; margin: 2px 0;"><strong>Tecnologia Quântica:</strong> ${m.techApplied}</p>
      <p style="font-size: 9.2pt; margin: 2px 0;"><strong>Fundamentação Física:</strong> ${m.physicsReason}</p>
      <p style="font-size: 8.8pt; margin: 2px 0; color: #444;"><code>Telemetria: ${m.telemetry}</code></p>
    `;
    missionsDiv.appendChild(div);
  });

  // Pre-fill editable labels with callsigns
  simulationState.operators.forEach((op, i) => {
    const lbl = document.getElementById(`lbl-obs-${i}`);
    if (lbl) {
      lbl.innerText = `Operador ${i + 1} [${op.callsign}] (${op.name}) — Parecer Técnico & Observações Pessoais:`;
    }
  });
}

function generateOfficialHumanizedPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: "a4", unit: "mm" });

  let y = 18;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("ECOSSISTEMA CÓRTEX • UVPR / UEPG / CTEX", 105, y, { align: "center" });
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Curso: Princípios de Tecnologias Quânticas • Módulo 2: Aplicações Quânticas 2.0", 105, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(11, 61, 104);
  doc.text("RELATÓRIO OFICIAL DE SIMULAÇÃO TÁTICA: DEFESA QUÂNTICA", 105, y, { align: "center" });
  y += 7;

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);
  y += 6;

  // Metadata Table
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  const m = Math.floor(simulationState.timeRemainingSeconds / 60);
  const s = simulationState.timeRemainingSeconds % 60;
  doc.text(`Célula Tática: ${simulationState.teamName}`, 15, y);
  doc.text(`Tempo de Sobrevida Restante: ${m}m ${s}s`, 120, y);
  y += 5;
  doc.text(`Data / Horário: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`, 15, y);
  doc.text(`Resultado: SUCESSO PLENO (100% EFICIÊNCIA QUÂNTICA)`, 120, y);
  y += 7;

  // Roster Box
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, 180, 5.5, "F");
  doc.text("CALLSIGN & FUNÇÃO", 18, y + 3.8);
  doc.text("MILITAR / ALUNO", 85, y + 3.8);
  doc.text("STATUS ASSINATURA", 145, y + 3.8);
  y += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  simulationState.operators.forEach(op => {
    doc.text(`[${op.callsign}] ${op.role}`, 18, y + 4);
    doc.text(op.name, 85, y + 4);
    doc.text("AUTENTICADO (PIN OK)", 145, y + 4);
    y += 5;
  });
  y += 4;

  // Missions & Telemetry
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 61, 104);
  doc.text("RESOLUÇÃO DAS MISSÕES & JUSTIFICATIVAS FÍSICAS", 15, y);
  y += 5;

  simulationState.missions.forEach((msn) => {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    const op = simulationState.operators[msn.operatorIdx];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(11, 61, 104);
    doc.text(msn.title, 15, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(`• Operador Responsável: [${op.callsign}] ${op.name}`, 18, y);
    y += 3.5;

    const techLines = doc.splitTextToSize(`• Tecnologia Aplicada: ${msn.techApplied}`, 172);
    doc.text(techLines, 18, y);
    y += techLines.length * 3.4;

    const physLines = doc.splitTextToSize(`• Fundamentação Física: ${msn.physicsReason}`, 172);
    doc.text(physLines, 18, y);
    y += physLines.length * 3.4;

    doc.setFont("courier", "normal");
    doc.text(`• Telemetria: ${msn.telemetry}`, 18, y);
    y += 5.5;
  });

  // Humanized Custom Observations Section
  if (y > 220) {
    doc.addPage();
    y = 18;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 61, 104);
  doc.text("PARECER TÉCNICO & OBSERVAÇÕES INDIVIDUAIS DOS OPERADORES", 15, y);
  y += 5;

  simulationState.operators.forEach((op, idx) => {
    if (y > 255) {
      doc.addPage();
      y = 18;
    }
    const obsText = document.getElementById(`txt-obs-${idx}`)?.value.trim() || 
      `O operador ${op.callsign} (${op.name}) ratifica que a aplicação do protocolo quântico atendeu plenamente aos requisitos de segurança física e autonomia operacional.`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text(`Parecer de [${op.callsign}] ${op.name} (${op.role}):`, 18, y);
    y += 3.8;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    const obsLines = doc.splitTextToSize(`"${obsText}"`, 172);
    doc.text(obsLines, 20, y);
    y += obsLines.length * 3.4 + 3;
  });

  // Institutional Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Relatório Tático elaborado através do Simulador Virtual de Crises Táticas (GitHub Pages).", 105, 285, { align: "center" });

  doc.save(`Relatorio_Tatico_${simulationState.teamName.replace(/\s+/g, "_")}.pdf`);
}
