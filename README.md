# 🛰️ Simulador Virtual de Crises Táticas: Defesa Quântica

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-00e5ff?style=for-the-badge&logo=github)](https://irlansouza93.github.io/simulador-virtual-crises-taticas/)
[![Status](https://img.shields.io/badge/Status-Operacional%20%7C%20Auditado-brightgreen?style=for-the-badge)](#)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-Exclusiva%20Militar%20/%20Educacional-blue?style=for-the-badge)](#)
[![Projeto CÓRTEX](https://img.shields.io/badge/Projeto-C%C3%93RTEX%20--%20CTEx%20/%20UVPR-darkgreen?style=for-the-badge)](https://www.gov.br/defesa)

> **Ambiente Gamificado e Interativo de Simulação Tática em Guerra Eletrônica e Aplicações Quânticas 2.0.**  
> Desenvolvido para equipes de 4 operadores cooperarem em tempo real, enfrentando cenários críticos de infiltração, sensoriamento passivo, navegação inercial sob *jamming*, otimização logística em relevo hostil e criptografia inviolável (QKD).

---

### 🌐 [CLIQUE AQUI PARA ACESSAR O SIMULADOR AO VIVO NO GITHUB PAGES](https://irlansouza93.github.io/simulador-virtual-crises-taticas/)

---

## 🎮 Destaques da Experiência e Gamificação

* **Visualização Tridimensional Dinâmica (Three.js):**
  * **Cenário de Relevo Realista:** Malha topográfica montanhosa com curvas de nível, desfiladeiros e grade tática de profundidade;
  * **Vetor Aéreo Stealth:** Caça de 5ª geração em patrulha contínua sobre a área de operações;
  * **Comboio Blindado Médico:** Viatura de resgate com farol direcional progressivo ao longo do terreno;
  * **Corte Transversal do Abrigo:** Câmara subterrânea sob 40 metros de rocha ígnea, com emissão de pulsos volumétricos de gravimetria quântica;
  * **Torre Adversária de Guerra Eletrônica:** Domo pulsante vermelho de saturação de sinal (*Jamming* de GPS);
  * **Posto Adversário de Escuta Óptica:** Grampo em cabo de fibra óptica demonstrando a ameaça *"Harvest Now, Decrypt Later"*;
  * **Obstáculos Dinâmicos:** Deslizamentos de rocha e corredores de patrulhas móveis com cones de alerta.
* **Sistema Antifraude & Autonomia Operacional:**
  * Cada operador define seu próprio **PIN de Acesso Tático (4 dígitos)** no credenciamento;
  * Nenhuma decisão de uma missão pode ser alterada ou autenticada por outro colega sem a inserção do respectivo PIN;
  * Geração de **Assinatura Criptográfica Individual (Hash SHA256)** para cada operador participante.
* **Tensão e Dinâmica de Tempo Real:**
  * **Cronômetro de Sobrevida Clínica (T-45:00 min):** Simula a janela de sobrevivência de feridos graves;
  * **Cards de Perda e Penalidade:** Escolhas clássicas acionam alertas visuais de colapso operacional e deduzem 5 minutos de sobrevida da equipe.
* **Relatório Oficial com Pareceres Humanos:**
  * Ao concluir as missões, cada operador dispõe de um campo aberto para redigir seu **parecer técnico e observações pessoais em suas próprias palavras**;
  * O relatório final gerado em PDF compila a telemetria, as leis físicas validadas e as considerações individuais autênticas dos 4 cursistas.

---

## 👥 Célula Tática Integrada (4 Operadores)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SALA DE OPERAÇÕES CONJUNTA                        │
├───────────────┬──────────────────────────┬─────────────────────────────┤
│ CALLSIGN      │ ESPECIALIDADE            │ MISSÃO DESIGNADA            │
├───────────────┼──────────────────────────┼─────────────────────────────┤
│ 🦅 FALCÃO     │ Reconhecimento Geofísico │ Missão 1: Gravimetria e NV  │
│ 🧭 SENTINELA  │ Navegação Autônoma       │ Missão 2: QINS e Bússola    │
│ ⚡ ORÁCULO    │ Logística & Otimização   │ Missão 3: QAOA e Qubits     │
│ 🔐 CIPHER     │ Guerra Eletrônica        │ Missão 4: Criptografia QKD  │
└───────────────┴──────────────────────────┴─────────────────────────────┘
```

1. **FALCÃO (Oficial de Reconhecimento Geofísico):** Identifica o abrigo subterrâneo sob 40 metros de rocha medindo a anomalia gravitacional negativa ($\Delta \rho < 0$) através de interferometria de átomos frios, operando de modo 100% passivo.
2. **SENTINELA (Oficial de Navegação Autônoma):** Conduz a frota sob saturação de *jamming* de GPS através do Sistema de Navegação Inercial Quântico (QINS) e Bússola Atômica com taxa de deriva quase nula.
3. **ORÁCULO (Oficial de Logística & Otimização):** Soluciona o problema de roteamento dinâmico NP-difícil da frota sob restrições temporais e barreiras de deslizamento através de processamento quântico variacional (QAOA) com *qubits*.
4. **CIPHER (Oficial de Guerra Eletrônica & Cripto):** Neutraliza a interceptação de dados por meio da Distribuição Quântica de Chaves (QKD) com cifra *One-Time Pad*, blindada pelo Princípio da Incerteza e pelo Teorema do Não-Clonamento.

---

## 🛠️ Pilha Tecnológica e Fontes Livres

* **Renderização 3D:** Three.js (WebGL com aceleração de hardware)
* **Tipografia Tática:** Google Fonts (*Orbitron*, *Rajdhani*, *Share Tech Mono*, *Inter*)
* **Síntese de Áudio:** Web Audio API (áudio procedural estéreo sem dependências de arquivos de som)
* **Geração de PDF:** jsPDF (compilação direta no navegador)
* **Design System:** Baseado nas diretrizes *Cyberpunk / Sci-Fi HUD* e *Dark Mode OLED* do `ui-ux-pro-max` e padrão de excelência de interface `impeccable`.

---

## 🚀 Execução Local

```bash
# Clone o repositório
git clone https://github.com/irlansouza93/simulador-virtual-crises-taticas.git

# Acesse a pasta do projeto
cd simulador-virtual-crises-taticas

# Inicie um servidor local (exemplo em Python):
python -m http.server 8000
```
Acesse `http://localhost:8000` em qualquer navegador.

---

## 📜 Referências Científicas e Doutrinárias

* **CENTER FOR STRATEGIC AND INTERNATIONAL STUDIES (CSIS).** *Quantum Sensing and the Future of Warfare: Five Essential Reforms to Stay Competitive*. Washington, D.C., 2023.
* **UNIVERSIDADE VIRTUAL DO PARANÁ (UVPR) / CENTRO TECNOLÓGICO DO EXÉRCITO (CTEX).** *Princípios de Tecnologias Quânticas: Aplicações Quânticas 2.0*, 2026.
