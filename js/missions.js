// Conteúdo das missões (Atividade 3). Textos curtos: a cena 3D mostra o resto.
// `anim` liga cada opção a uma sequência da cena (scene.js).

export const MISSIONS = [
  {
    id: "m1",
    role: "recon",
    title: "Abrigo oculto",
    place: "abrigo",
    situation: "Feridos num abrigo sob a serra. Qualquer emissão de rádio é triangulada pelo inimigo.",
    facts: [["Rocha", "40 m"], ["Emissão permitida", "0 dBm"], ["Postos de escuta", "2"]],
    ask: "Como localizar o abrigo?",
    options: [
      {
        id: "gpr", kind: "classic", name: "Radar de penetração no solo",
        line: "Ondas de rádio para enxergar dentro da rocha.",
        anim: "m1-gpr", lost: 5, tags: ["Posição revelada", "Fogo de artilharia"],
        result: "O sinal morre nos primeiros metros de rocha. A emissão foi triangulada e a artilharia atingiu sua posição."
      },
      {
        id: "thermal", kind: "classic", name: "Drone com câmera térmica",
        line: "Varredura de calor sobre a serra.",
        anim: "m1-thermal", lost: 4, tags: ["Drone abatido"],
        result: "40 m de rocha não deixam passar calor. O drone foi visto e abatido."
      },
      {
        id: "gravimeter", kind: "quantum", name: "Gravímetro quântico de átomos frios",
        line: "Mede a gravidade com átomos resfriados a laser. Não emite nada.",
        anim: "m1-grav",
        result: "Anomalia de −44,2 μGal: falta massa sob a serra. Abrigo a 39,8 m, encontrado sem emitir sinal."
      }
    ],
    readout: [["Anomalia", "−44,2 μGal"], ["Profundidade", "39,8 m"], ["Emissão", "0,00 dBm"]],
    physics: "A gravidade atravessa qualquer rocha e não pode ser bloqueada. Átomos frios em queda livre medem variações mínimas de g; a cavidade do abrigo tem déficit de massa (Δρ < 0) e aparece como anomalia negativa, de forma 100% passiva."
  },
  {
    id: "m2",
    role: "nav",
    title: "Vale sem GPS",
    place: "jammer",
    situation: "A torre inimiga bloqueia todo o sinal de satélite. A coluna precisa cruzar o desfiladeiro às cegas.",
    facts: [["Sinal GPS", "−160 dBW"], ["Bloqueio", "100 %"], ["Travessia", "25 min"]],
    ask: "Como a coluna se orienta?",
    options: [
      {
        id: "ins", kind: "classic", name: "Navegação inercial mecânica",
        line: "Giroscópios e acelerômetros clássicos.",
        anim: "m2-drift", lost: 5, tags: ["Deriva de 1.450 m", "Viatura no barranco"],
        result: "Atrito e ruído térmico somam erro a cada segundo: 1.450 m de desvio em 25 min. Uma viatura saiu da estrada."
      },
      {
        id: "antijam", kind: "classic", name: "GPS com antena anti-interferência",
        line: "Insistir no sinal de satélite.",
        anim: "m2-spoof", lost: 6, tags: ["Posição falsa", "Coluna desviada 3 km"],
        result: "O inimigo falsificou o sinal (spoofing). A posição pulou 3 km e a coluna seguiu na direção errada."
      },
      {
        id: "qins", kind: "quantum", name: "Inercial quântico + bússola atômica",
        line: "Interferometria de átomos frios, sem peças móveis.",
        anim: "m2-qins",
        result: "Deriva abaixo de 1 m/h. A coluna cruzou o vale guiada pela própria física, ignorando o bloqueio."
      }
    ],
    readout: [["Deriva", "0,0001 m/h"], ["Erro acumulado", "< 1 m"], ["GPS", "ignorado"]],
    physics: "Átomos resfriados no vácuo funcionam como sensores inerciais sem atrito nem histerese. A deriva é virtualmente nula e, cruzada com o mapa gravimétrico e magnético de bordo, mantém a navegação sem satélite."
  },
  {
    id: "m3",
    role: "log",
    title: "Rota contra o relógio",
    place: "rotas",
    situation: "Deslizamentos fecharam estradas e patrulhas se movem no vale. Três viaturas precisam chegar ao abrigo.",
    facts: "dynamic",
    ask: "Como calcular a rota da frota?",
    options: [
      {
        id: "brute", kind: "classic", name: "Supercomputador clássico",
        line: "Testar todas as combinações, uma por uma.",
        anim: "m3-brute", lost: 7, tags: ["Explosão combinatória"],
        result: "dynamic"
      },
      {
        id: "planned", kind: "classic", name: "Seguir a rota planejada",
        line: "Estrada principal, sem recalcular.",
        anim: "m3-planned", lost: 5, tags: ["Estrada bloqueada"],
        result: "dynamic"
      },
      {
        id: "qaoa", kind: "quantum", name: "Otimização quântica (QAOA)",
        line: "Qubits em superposição avaliam as rotas ao mesmo tempo.",
        anim: "m3-qaoa",
        result: "dynamic"
      }
    ],
    readout: "dynamic",
    physics: "Roteamento com restrições é NP-difícil: o tempo clássico cresce como O(2ⁿ). Qubits em superposição (|ψ⟩ = α|0⟩ + β|1⟩) e emaranhados exploram o espaço de rotas; a interferência cancela as rotas ruins e amplifica a melhor."
  },
  {
    id: "m4",
    role: "ge",
    title: "Mensagem inviolável",
    place: "fibra",
    situation: "O posto inimigo grampeou a fibra óptica e grava todo o espectro para decifrar depois.",
    facts: [["Ameaça", "Harvest Now, Decrypt Later"], ["Gravado", "2,4 TB/dia"], ["Envio", "relatório médico"]],
    ask: "Como enviar o relatório ao comando?",
    options: [
      {
        id: "rsa", kind: "classic", name: "Criptografia RSA-4096",
        line: "Cifra matemática pelo cabo.",
        anim: "m4-rsa", lost: 5, tags: ["Dados arquivados pelo inimigo", "Quebra futura (Shor)"],
        result: "A mensagem foi copiada sem deixar rastro e arquivada. Um computador quântico maduro quebra o RSA com o algoritmo de Shor."
      },
      {
        id: "vhf", kind: "classic", name: "Rádio VHF com salto de frequência",
        line: "Transmitir pelo ar, trocando de canal.",
        anim: "m4-vhf", lost: 5, tags: ["Espectro gravado", "Transmissor localizado"],
        result: "O inimigo grava o espectro inteiro: o salto não esconde nada. O transmissor ainda foi localizado."
      },
      {
        id: "qkd", kind: "quantum", name: "QKD (BB84) + one-time pad",
        line: "Chave enviada em fótons únicos.",
        anim: "m4-qkd",
        result: "Ao medir os fótons, o espião elevou o erro (QBER) para 25 %. A chave foi descartada e refeita com QBER de 0,8 %. Relatório enviado."
      }
    ],
    readout: [["QBER com espião", "25 %"], ["QBER final", "0,8 %"], ["Cifra", "one-time pad"]],
    physics: "Medir um fóton altera seu estado (incerteza e colapso da função de onda) e é impossível copiar um estado quântico desconhecido (não-clonagem). A espionagem eleva a QBER e é denunciada antes de qualquer dado real ser enviado."
  }
];

export const TOTAL_SECONDS = 45 * 60;
