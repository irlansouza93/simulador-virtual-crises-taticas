# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS without a build step, Three.js loaded from CDN, published on GitHub Pages (https://irlansouza93.github.io/simulador-virtual-crises-taticas/). Confirmed by the user.

## Users

Students of the course "Princípios de Tecnologias Quânticas" (Ecossistema CÓRTEX, UVPR / UEPG / CTEx), mostly military and defense staff. They play in teams of 1 to 4 during a synchronous class on Google Meet, around one shared screen. Many are not gamers, so the first screen must teach how to play in seconds.

## Product Purpose

A browser game that turns Atividade 3 ("Sala de Crise Tática") into a playable simulation: a rescue team must find a hidden underground shelter, cross a GPS-jammed valley, route a medical convoy before the 45-minute survival window closes, and send the report without being intercepted. Each mission contrasts a classical technology that fails with the quantum one that works. Success: every student makes their own decision, feels the consequence, and writes their own conclusion in the final report.

## Positioning

Not a quiz with a 3D wallpaper: each decision plays out in the simulated terrain (convoys, aircraft, landslides, patrols, wiretaps), and the clock is the real constraint.

## Operating Context

- One shared computer, screen-shared on Google Meet; students take turns at the keyboard.
- Four fixed roles, one per mission: Reconhecimento (M1 gravimetria), Navegação (M2 QINS), Logística (M3 otimização quântica), Guerra Eletrônica (M4 QKD). With fewer than 4 students, one student can hold more than one role.
- The final report is exported as PDF and submitted to the AVA forum for peer review.

## Capabilities and Constraints

- Anti-fraud on a shared screen: each student sets a personal 4-digit PIN; only that PIN unlocks their mission decision and their own report text. No master PIN, no default PIN.
- No pre-filled names, team names, or mock people. Every name comes from the players.
- Report text in the "parecer" sections is written by the students; nothing is auto-generated in their voice.
- 45-minute survival countdown; wrong (classical) choices cost time.
- Fonts must be free (Google Fonts or similar).

## Brand Commitments

Content of the four missions as in `../atividade3_proposta_final.md` (scenario, technologies, physical justifications). Institutional names: Ecossistema CÓRTEX, UVPR / UEPG / CTEx.

## Evidence on Hand

Mission content and physics justifications in `../atividade3_proposta_final.md`. No testimonials, scores, or real telemetry exist; simulated values are presented as simulation.

## Product Principles

1. Show, don't tell: every mission state is visible in the scene before it is written.
2. Each student owns their decision and their words.
3. Teach in seconds: the first screen is enough to start playing.
4. Consequence over correction: a wrong choice plays out, costs time, and is recorded honestly.

## Accessibility & Inclusion

Readable on a shared Meet screen (large type, high contrast), playable by mouse or keyboard, respects reduced motion, works on laptop and phone widths.
