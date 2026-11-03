// Main Tactical Simulation Logic & PDF Generator

const gameState = {
  teamName: "FORÇA-TAREFA QUÂNTICA",
  players: [
    { role: "Oficial de Reconhecimento e Sensores", name: "Irlan Pereira de Souza", email: "irlan.souza@eb.mil.br" },
    { role: "Oficial de Navegação Tática", name: "Diego Santana Gomes", email: "santana.diego@eb.mil.br" },
    { role: "Oficial de Logística e Computação", name: "Edson Jorge dos Santos", email: "edson.jorge@defesa.gov.br" },
    { role: "Oficial de Guerra Eletrônica e Criptografia", name: "Cursista Convidado / Operador 4", email: "operador4@defesa.gov.br" }
  ],
  currentMissionIndex: 0,
  missionsData: [
    {
      title: "Missão 1: Localizar o Abrigo Subterrâneo Oculto",
      operatorIdx: 0,
      briefing: "ALERTA TÁTICO: O abrigo médico está sob 40 metros de rocha compacta. Radares convencionais não conseguem penetrar e detonações sísmicas ativas alertariam as baterias adversárias.",
      prompt: "Qual recurso técnico de sensoriamento deve ser ativado?",
      options: [
        {
          id: "classic",
          title: "Radar de Penetração no Solo (GPR) Clássico de Alta Potência",
          desc: "Aumentar a irradiação eletromagnética em radiofrequência para tentar furar o maciço rochoso.",
          isCorrect: false,
          feedback: "FALHA OPERACIONAL! As ondas de rádio sofreram severa atenuação e espalhamento dielétrico na rocha. A emissão ativa revelou as coordenadas da equipe por radiogoniometria inimiga!"
        },
        {
          id: "quantum",
          title: "Gravimetria e Gradiometria Quântica por Átomos Frios",
          desc: "Medição de interferometria atômica passiva para aferir o déficit de massa gravitacional (Δρ < 0) da cavidade do abrigo.",
          isCorrect: true,
          feedback: "SUCESSO TÁTICO! A cavidade oca gerou anomalia gravitacional negativa de -42 microgals. Abrigo localizado com precisão centimétrica sem emitir nenhum sinal eletromagnético!"
        }
      ],
      techApplied: "Gravimetria Quântica por Interferometria de Átomos Frios + Magnetometria Atômica",
      physicsReason: "A gravidade não pode ser blindada pela rocha. Átomos frios resfriados por laser aferem variações do campo gravitacional com precisão extrema. O vazio do abrigo provoca déficit de massa (Δρ < 0) detectado de modo 100% passivo.",
      telemetry: "Anomalia: -42.8 μGal | Profundidade: 38.6m | Emissão RF: 0.00 dBm (Indetectável)"
    },
    {
      title: "Missão 2: Navegar sob Jamming Total de GPS",
      operatorIdx: 1,
      briefing: "INTERFERÊNCIA CRÍTICA: Transmissores inimigos saturaram as frequências L1/L2 GNSS. Telas de bordo perderam sinal. Desfiladeiros impedem visibilidade do horizonte.",
      prompt: "Como conduzir os veículos de resgate com precisão ininterrupta?",
      options: [
        {
          id: "classic",
          title: "Sistema Inercial Mecânico Convencional (Giroscópios e Acelerômetros Clássicos)",
          desc: "Continuar a navegação integrando as acelerações mecânicas sem sinal externo.",
          isCorrect: false,
          feedback: "DERIVA INERCIAL ACUMULADA! O atrito mecânico e o ruído térmico geraram erro cumulativo de 1.800 metros após 30 minutos em terreno montanhoso. Risco iminente de colisão!"
        },
        {
          id: "quantum",
          title: "Sistema de Navegação Inercial Quântico (QINS) e Bússola Atômica",
          desc: "Sensores de aceleração baseados em pacotes de ondas de matéria atômica sem partes mecânicas móveis.",
          isCorrect: true,
          feedback: "SUCESSO TÁTICO! Átomos frios em queda livre governam a aceleração linear e rotação angular. Deriva inercial zero! Rota corrigida passivamente pelo cruzamento com cartas geomagnéticas."
        }
      ],
      techApplied: "Sistema de Navegação Inercial Quântico (QINS) + Bússola Atômica",
      physicsReason: "Interferometria atômica de De Broglie com átomos em vácuo, livres de histerese mecânica ou deriva térmica. Operação 100% passiva e imune a jamming de rádio.",
      telemetry: "Taxa de Deriva: 0.0002 m/h | Alinhamento Inercial: 99.98% | Status GPS: BLOQUEADO (Ignorado)"
    },
    {
      title: "Missão 3: Otimizar Rotas Logísticas com Janelas Críticas",
      operatorIdx: 2,
      briefing: "URGÊNCIA CLÍNICA: Feridos graves demandam socorro em menos de 45 minutos. Múltiplos deslizamentos e zonas de patrulha criam milhões de combinações de trajetos possíveis.",
      prompt: "Como calcular a rota global ideal da frota em tempo hábil?",
      options: [
        {
          id: "classic",
          title: "Supercomputador Clássico com Algoritmos Heurísticos Sequenciais (Bits 0 e 1)",
          desc: "Processar exaustivamente as permutações de rota uma a uma em processadores clássicos.",
          isCorrect: false,
          feedback: "EXPLOSÃO COMBINATÓRIA! O problema VRP é NP-difícil. O algoritmo clássico estimou 3 horas de cálculo para convergência, extrapolando a janela de sobrevivência dos pacientes!"
        },
        {
          id: "quantum",
          title: "Processador Quântico com Algoritmo QAOA / Recozimento Quântico (Qubits)",
          desc: "Explorar superposição e interferência quântica simultânea no espaço de soluções.",
          isCorrect: true,
          feedback: "SUCESSO TÁTICO! Qubits em superposição exploraram 2ⁿ estados simultaneamente. Interferência destrutiva eliminou rotas de risco e amplificou o trajeto ótimo em 1.4 segundos!"
        }
      ],
      techApplied: "Computação Quântica Variacional (QAOA) com Registradores de Qubits",
      physicsReason: "Superposição quântica (|ψ⟩ = α|0⟩ + β|1⟩) e emaranhamento viabilizam paralelismo nativo. A interferência quântica canaliza a probabilidade para a configuração hamiltoniana de menor tempo.",
      telemetry: "Espaço de Estados: 2.4 x 10⁷ rotas | Tempo de Cálculo: 1.42s | Redução de Risco: 94.2%"
    },
    {
      title: "Missão 4: Comunicação Segura Inviolável contra Interceptação",
      operatorIdx: 3,
      briefing: "AMEAÇA DE ESPIONAGEM: O posto adversário grampeou cabos de fibra óptica e grava todo o espectro eletromagnético da região para decifração futura (Harvest Now, Decrypt Later).",
      prompt: "Como transmitir o plano de extração médica com garantia física absoluta de inviolabilidade?",
      options: [
        {
          id: "classic",
          title: "Criptografia Assimétrica Padrão Militar (RSA-4096 / Curvas Elípticas)",
          desc: "Cifrar a mensagem com chaves matemáticas clássicas e transmitir por rádio VHF ou fibra.",
          isCorrect: false,
          feedback: "VULNERABILIDADE A LONGO PRAZO! O sinal foi clonado passivamente e armazenado nos servidores adversários para ser quebrado pelo Algoritmo de Shor quando computadores quânticos operarem!"
        },
        {
          id: "quantum",
          title: "Distribuição Quântica de Chaves (QKD) com Cifra One-Time Pad",
          desc: "Transmissão da chave simétrica codificada na polarização de fótons únicos.",
          isCorrect: true,
          feedback: "SUCESSO TÁTICO ABSOLUTO! O espião tentou interceptar o enlace e causou colapso na função de onda dos fótons. Alarme QBER disparado, chave violada descartada e nova chave segura gerada!"
        }
      ],
      techApplied: "Distribuição Quântica de Chaves (QKD / Protocolo BB84) + One-Time Pad",
      physicsReason: "Princípio da Incerteza de Heisenberg (o ato de medir altera o fóton irreversivelmente) e Teorema do Não-Clonamento (impossível duplicar estado quântico desconhecido). Segurança inviolável pelas leis da física.",
      telemetry: "Taxa de Erro QBER: 1.1% (Dentro do limiar seguro) | Fótons Polarizados: 100% | Cifra: One-Time Pad"
    }
  ]
};

let sceneManager = null;

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  sceneManager = new TacticalScene("canvas-container");
  setupEventListeners();
  updateClock();
  setInterval(updateClock, 1000);
});

function updateClock() {
  const clockEl = document.getElementById("hud-clock");
  if (clockEl) {
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(" ")[0] + " ZULU";
  }
}

function setupEventListeners() {
  // Start Simulation from Setup Screen
  document.getElementById("btn-start-sim").addEventListener("click", () => {
    window.sound.beep(600, 0.1);
    // Read names from inputs
    for (let i = 0; i < 4; i++) {
      const nameInput = document.getElementById(`player-name-${i}`);
      const emailInput = document.getElementById(`player-email-${i}`);
      if (nameInput && nameInput.value.trim()) gameState.players[i].name = nameInput.value.trim();
      if (emailInput && emailInput.value.trim()) gameState.players[i].email = emailInput.value.trim();
    }
    const teamInput = document.getElementById("team-name-input");
    if (teamInput && teamInput.value.trim()) gameState.teamName = teamInput.value.trim().toUpperCase();

    showScreen("screen-war-room");
    loadMission(0);
  });

  // Sound toggle
  const soundBtn = document.getElementById("btn-toggle-sound");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      window.sound.muted = !window.sound.muted;
      soundBtn.innerText = window.sound.muted ? "🔇 SOM: OFF" : "🔊 SOM: ON";
    });
  }

  // Next Mission Button
  document.getElementById("btn-next-mission").addEventListener("click", () => {
    gameState.currentMissionIndex++;
    if (gameState.currentMissionIndex < gameState.missionsData.length) {
      loadMission(gameState.currentMissionIndex);
    } else {
      finishSimulation();
    }
  });

  // Generate PDF Report Button
  document.getElementById("btn-download-pdf").addEventListener("click", () => {
    generatePdfReport();
  });

  // Print Report Button
  document.getElementById("btn-print-report").addEventListener("click", () => {
    window.print();
  });

  // Restart Simulation
  document.getElementById("btn-restart-sim").addEventListener("click", () => {
    gameState.currentMissionIndex = 0;
    showScreen("screen-setup");
  });
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
}

function loadMission(idx) {
  const mission = gameState.missionsData[idx];
  const operator = gameState.players[mission.operatorIdx];

  // Update Stepper
  document.querySelectorAll(".step-pill").forEach((pill, i) => {
    pill.classList.remove("active", "completed");
    if (i === idx) pill.classList.add("active");
    else if (i < idx) pill.classList.add("completed");
  });

  // Update Banner & Briefing
  document.getElementById("active-operator-role").innerText = operator.role;
  document.getElementById("active-operator-name").innerText = operator.name;
  document.getElementById("mission-title-hud").innerText = mission.title;
  document.getElementById("mission-briefing-text").innerText = mission.briefing;
  document.getElementById("mission-prompt-text").innerText = mission.prompt;

  // Reset Feedback and Next button
  const feedbackBox = document.getElementById("decision-feedback");
  feedbackBox.className = "feedback-box";
  feedbackBox.innerText = "";
  document.getElementById("btn-next-mission").style.display = "none";

  // Build Options
  const container = document.getElementById("options-container");
  container.innerHTML = "";

  mission.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <div class="opt-title">${opt.title}</div>
      <div class="opt-desc">${opt.desc}</div>
    `;
    btn.addEventListener("click", () => handleOptionSelect(btn, opt, mission, idx));
    container.appendChild(btn);
  });

  // 3D Scene visual cue for the mission
  if (idx === 0) {
    sceneManager.clearJamming();
  } else if (idx === 1) {
    sceneManager.triggerJamming();
  } else if (idx === 2) {
    sceneManager.clearJamming();
  }
}

function handleOptionSelect(buttonEl, option, mission, idx) {
  const feedbackBox = document.getElementById("decision-feedback");
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => b.classList.remove("selected", "failed"));

  if (!option.isCorrect) {
    window.sound.alarm();
    buttonEl.classList.add("failed");
    feedbackBox.className = "feedback-box error";
    feedbackBox.innerText = option.feedback;
  } else {
    window.sound.success();
    buttonEl.classList.add("selected");
    feedbackBox.className = "feedback-box success";
    feedbackBox.innerText = option.feedback;

    // Trigger visual 3D reaction
    if (idx === 0) {
      sceneManager.triggerQuantumScan();
    } else if (idx === 1) {
      sceneManager.clearJamming();
      window.sound.beep(900, 0.15);
    } else if (idx === 2) {
      sceneManager.drawQuantumRoute();
    } else if (idx === 3) {
      sceneManager.triggerQKDBeam();
    }

    // Update Telemetry Bar
    document.getElementById("telemetry-active-text").innerText = mission.telemetry;

    // Show Next Button
    const nextBtn = document.getElementById("btn-next-mission");
    nextBtn.style.display = "inline-flex";
    nextBtn.innerText = idx === gameState.missionsData.length - 1 ? "GERAR RELATÓRIO OFICIAL »" : "PRÓXIMA MISSÃO »";
  }
}

function finishSimulation() {
  window.sound.success();
  showScreen("screen-report");
  populateReportView();
}

function populateReportView() {
  document.getElementById("rep-team-name").innerText = gameState.teamName;
  document.getElementById("rep-date").innerText = new Date().toLocaleDateString("pt-BR") + " - " + new Date().toLocaleTimeString("pt-BR");

  // Operators List
  const opsTable = document.getElementById("rep-operators-table");
  opsTable.innerHTML = "";
  gameState.players.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>Operador ${i + 1} (${p.role})</strong></td>
      <td>${p.name}</td>
      <td>${p.email}</td>
    `;
    opsTable.appendChild(tr);
  });

  // Missions Summary
  const missionsContainer = document.getElementById("rep-missions-summary");
  missionsContainer.innerHTML = "";
  gameState.missionsData.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "report-mission-item";
    div.innerHTML = `
      <h3>${m.title}</h3>
      <p><strong>Responsável:</strong> ${gameState.players[m.operatorIdx].name} (${gameState.players[m.operatorIdx].role})</p>
      <p><strong>Tecnologia Quântica Aplicada:</strong> ${m.techApplied}</p>
      <p><strong>Fundamentação Física Validada:</strong> ${m.physicsReason}</p>
      <p><strong>Telemetria Final:</strong> <code>${m.telemetry}</code></p>
    `;
    missionsContainer.appendChild(div);
  });
}

function generatePdfReport() {
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
  y += 8;

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);
  y += 6;

  // Metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(`Equipe / Grupo: ${gameState.teamName}`, 15, y);
  doc.text(`Data / Horário: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`, 130, y);
  y += 5;
  doc.text(`Status da Missão: SUCESSO PLENO (100% EFICIÊNCIA QUÂNTICA)`, 15, y);
  y += 7;

  // Table of Operators
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, 180, 6, "F");
  doc.text("FUNÇÃO OPERACIONAL", 18, y + 4.2);
  doc.text("OPERADOR / ALUNO", 85, y + 4.2);
  doc.text("CONTATO", 145, y + 4.2);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  gameState.players.forEach(p => {
    doc.text(p.role, 18, y + 4.5);
    doc.text(p.name, 85, y + 4.5);
    doc.text(p.email, 145, y + 4.5);
    y += 5.5;
  });
  y += 4;

  // Missions details
  gameState.missionsData.forEach((m, idx) => {
    if (y > 245) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(11, 61, 104);
    doc.text(m.title, 15, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(`• Oficial Responsável: ${gameState.players[m.operatorIdx].name} (${gameState.players[m.operatorIdx].role})`, 18, y);
    y += 4;

    const techLines = doc.splitTextToSize(`• Tecnologia Aplicada: ${m.techApplied}`, 172);
    doc.text(techLines, 18, y);
    y += techLines.length * 3.8;

    const physLines = doc.splitTextToSize(`• Justificativa Física: ${m.physicsReason}`, 172);
    doc.text(physLines, 18, y);
    y += physLines.length * 3.8;

    doc.setFont("courier", "normal");
    doc.text(`• Telemetria: ${m.telemetry}`, 18, y);
    y += 6;
  });

  // Footer validation
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento gerado automaticamente pelo Simulador Virtual de Crises Táticas (GitHub Pages).", 105, 285, { align: "center" });

  doc.save(`Relatorio_Tatico_Defesa_Quantica_${gameState.teamName.replace(/\s+/g, "_")}.pdf`);
}
