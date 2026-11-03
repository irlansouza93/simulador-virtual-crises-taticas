// Operadores selecionáveis. Retratos desenhados em SVG no traço de manual de campanha.
// O codinome é do personagem; o nome real é sempre digitado pelo jogador.

const INK = "#1d1d1b";

export const CHARACTERS = [
  { id: "falcao",    codename: "FALCÃO",    trait: "Olho de longo alcance",  skin: "#d9ae86", uniform: "#6f7253", gear: "helmet",   extras: ["goggles"] },
  { id: "sentinela", codename: "SENTINELA", trait: "Nunca perde o rumo",     skin: "#8d5a3b", uniform: "#5f6648", gear: "beret",    extras: ["mustache"] },
  { id: "oraculo",   codename: "ORÁCULO",   trait: "Calcula antes de todos", skin: "#f0cfb1", uniform: "#646a52", gear: "headset",  extras: ["glasses", "bun"] },
  { id: "cipher",    codename: "CIPHER",    trait: "Fala em código",         skin: "#b07a52", uniform: "#4f5444", gear: "cap",      extras: ["longhair"] },
  { id: "lince",     codename: "LINCE",     trait: "Enxerga no escuro",      skin: "#c99a72", uniform: "#6b6a4b", gear: "boonie",   extras: ["paint"] },
  { id: "trovao",    codename: "TROVÃO",    trait: "Abre caminho",           skin: "#5e3b28", uniform: "#585c45", gear: "none",     extras: ["beard"] },
  { id: "vigia",     codename: "VIGIA",     trait: "Não dorme em serviço",   skin: "#e2b893", uniform: "#707559", gear: "helmet",   extras: ["longhair"] },
  { id: "artico",    codename: "ÁRTICO",    trait: "Frio sob pressão",       skin: "#c48d63", uniform: "#5d6151", gear: "balaclava", extras: [] }
];

export function characterById(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

let uid = 0;

export function portraitSVG(id, { size = 120, title } = {}) {
  const c = characterById(id);
  const k = `p${++uid}`;
  const has = (x) => c.extras.includes(x);
  const parts = [];

  parts.push(`<defs>
    <pattern id="${k}h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="0.7" opacity="0.35"/>
    </pattern>
  </defs>`);

  // Cabelo longo atrás da cabeça
  if (has("longhair")) parts.push(`<path d="M37 52 C 34 80, 36 100, 44 108 L 76 108 C 84 100, 86 80, 83 52 Z" fill="#2b2420" stroke="${INK}" stroke-width="1.6"/>`);
  if (has("bun")) parts.push(`<ellipse cx="60" cy="27" rx="10" ry="8" fill="#3a2a1f" stroke="${INK}" stroke-width="1.6"/>`);

  // Ombros e farda
  parts.push(`<path d="M8 140 C 12 106, 32 95, 60 95 C 88 95, 108 106, 112 140 Z" fill="${c.uniform}" stroke="${INK}" stroke-width="2"/>`);
  parts.push(`<path d="M8 140 C 12 106, 32 95, 60 95 C 88 95, 108 106, 112 140 Z" fill="url(#${k}h)"/>`);
  parts.push(`<path d="M44 96 L 60 116 L 76 96" fill="none" stroke="${INK}" stroke-width="1.8"/>`);
  parts.push(`<rect x="22" y="118" width="16" height="9" rx="1" fill="none" stroke="${INK}" stroke-width="1.4"/>`);

  // Pescoço, orelhas, rosto
  parts.push(`<path d="M50 78 L 50 97 C 54 101, 66 101, 70 97 L 70 78 Z" fill="${c.skin}" stroke="${INK}" stroke-width="1.8"/>`);
  parts.push(`<ellipse cx="40" cy="62" rx="4" ry="6.5" fill="${c.skin}" stroke="${INK}" stroke-width="1.6"/>`);
  parts.push(`<ellipse cx="80" cy="62" rx="4" ry="6.5" fill="${c.skin}" stroke="${INK}" stroke-width="1.6"/>`);
  parts.push(`<path d="M40 56 C 40 34, 80 34, 80 56 C 80 74, 72 86, 60 86 C 48 86, 40 74, 40 56 Z" fill="${c.skin}" stroke="${INK}" stroke-width="2"/>`);
  // sombra lateral do rosto
  parts.push(`<path d="M72 46 C 78 54, 78 72, 66 84 C 74 80, 80 70, 80 56 C 80 50, 77 47, 72 46 Z" fill="${INK}" opacity="0.12"/>`);

  if (c.gear === "balaclava") {
    parts.push(`<path d="M38 58 C 36 30, 84 30, 82 58 C 82 78, 74 90, 60 90 C 46 90, 38 78, 38 58 Z" fill="#2f312b" stroke="${INK}" stroke-width="2"/>`);
    parts.push(`<rect x="44" y="52" width="32" height="12" rx="5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`);
  }

  // Olhos e sobrancelhas
  parts.push(`<ellipse cx="52" cy="58" rx="2.3" ry="2" fill="${INK}"/><ellipse cx="68" cy="58" rx="2.3" ry="2" fill="${INK}"/>`);
  parts.push(`<path d="M46 52 L 56 51 M 64 51 L 74 52" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`);

  if (c.gear !== "balaclava") {
    parts.push(`<path d="M60 60 L 58 70 L 62 70.5" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`);
    parts.push(`<path d="M54 77 C 57 78.5, 63 78.5, 66 77" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`);
  }

  if (has("mustache")) parts.push(`<path d="M51 74 C 55 71, 65 71, 69 74 C 64 75, 56 75, 51 74 Z" fill="#241a14" stroke="${INK}" stroke-width="1.2"/>`);
  if (has("beard")) parts.push(`<path d="M41 64 C 42 80, 50 90, 60 90 C 70 90, 78 80, 79 64 C 76 74, 70 80, 66 80 C 62 76, 58 76, 54 80 C 50 80, 44 74, 41 64 Z" fill="#1f1712" stroke="${INK}" stroke-width="1.4"/>`);
  if (has("glasses")) parts.push(`<g fill="none" stroke="${INK}" stroke-width="1.6"><circle cx="52" cy="58" r="6"/><circle cx="68" cy="58" r="6"/><path d="M58 58 L 62 58 M 46 57 L 41 55 M 74 57 L 79 55"/></g>`);
  if (has("paint")) parts.push(`<g stroke="#3c4a2c" stroke-width="3" stroke-linecap="round" opacity="0.85"><path d="M44 66 L 52 62"/><path d="M68 62 L 76 66"/><path d="M45 72 L 51 69"/><path d="M69 69 L 75 72"/></g>`);

  // Cobertura de cabeça
  switch (c.gear) {
    case "helmet":
      parts.push(`<path d="M34 56 C 32 26, 88 26, 86 56 C 82 50, 38 50, 34 56 Z" fill="#596046" stroke="${INK}" stroke-width="2"/>`);
      parts.push(`<path d="M34 56 C 32 26, 88 26, 86 56 C 82 50, 38 50, 34 56 Z" fill="url(#${k}h)"/>`);
      parts.push(`<path d="M38 56 L 46 82 M 82 56 L 74 82" stroke="${INK}" stroke-width="1.6"/>`);
      parts.push(`<rect x="55" y="33" width="10" height="7" rx="1" fill="#2a2c25" stroke="${INK}" stroke-width="1.3"/>`);
      if (has("goggles")) parts.push(`<path d="M42 44 C 50 40, 70 40, 78 44 L 77 49 C 70 46, 50 46, 43 49 Z" fill="#9fb3b8" stroke="${INK}" stroke-width="1.5"/>`);
      break;
    case "beret":
      parts.push(`<path d="M34 50 C 32 30, 74 22, 92 38 C 88 46, 52 50, 34 50 Z" fill="#7a2e26" stroke="${INK}" stroke-width="2"/>`);
      parts.push(`<path d="M36 50 C 52 52, 72 50, 84 46" fill="none" stroke="${INK}" stroke-width="2.4"/>`);
      parts.push(`<circle cx="44" cy="42" r="3.4" fill="#c9b27a" stroke="${INK}" stroke-width="1.2"/>`);
      break;
    case "headset":
      parts.push(`<path d="M42 46 C 40 36, 50 32, 60 32 C 70 32, 80 36, 78 46 C 72 40, 48 40, 42 46 Z" fill="#3a2a1f" stroke="${INK}" stroke-width="1.6"/>`);
      parts.push(`<path d="M37 58 C 35 22, 85 22, 83 58" fill="none" stroke="${INK}" stroke-width="3.2"/>`);
      parts.push(`<rect x="31" y="54" width="9" height="15" rx="3" fill="#2a2c25" stroke="${INK}" stroke-width="1.4"/>`);
      parts.push(`<rect x="80" y="54" width="9" height="15" rx="3" fill="#2a2c25" stroke="${INK}" stroke-width="1.4"/>`);
      parts.push(`<path d="M36 68 C 38 80, 46 82, 54 80" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="55" cy="80" r="2.4" fill="${INK}"/>`);
      break;
    case "cap":
      parts.push(`<path d="M38 50 C 36 28, 84 28, 82 50 Z" fill="#4a4f3d" stroke="${INK}" stroke-width="2"/>`);
      parts.push(`<path d="M40 50 C 50 46, 74 46, 96 52 C 86 56, 60 55, 40 50 Z" fill="#3c4032" stroke="${INK}" stroke-width="1.8"/>`);
      parts.push(`<path d="M56 34 L 56 48" stroke="${INK}" stroke-width="1"/>`);
      break;
    case "boonie":
      parts.push(`<ellipse cx="60" cy="47" rx="36" ry="7.5" fill="#6e6b48" stroke="${INK}" stroke-width="2"/>`);
      parts.push(`<path d="M42 47 C 40 28, 80 28, 78 47 Z" fill="#6e6b48" stroke="${INK}" stroke-width="2"/>`);
      parts.push(`<path d="M42 47 C 40 28, 80 28, 78 47 Z" fill="url(#${k}h)"/>`);
      parts.push(`<path d="M42 42 C 54 40, 66 40, 78 42" stroke="${INK}" stroke-width="2.2" fill="none"/>`);
      break;
    case "none":
      parts.push(`<path d="M41 50 C 42 34, 78 34, 79 50 C 74 42, 46 42, 41 50 Z" fill="${INK}" opacity="0.28"/>`);
      break;
  }

  if (has("longhair") && c.gear !== "helmet") parts.push(`<path d="M40 52 C 44 40, 54 38, 62 40" fill="none" stroke="#2b2420" stroke-width="3"/>`);

  const label = title ? `<title>${title}</title>` : "";
  return `<svg viewBox="0 0 120 140" width="${size}" height="${Math.round(size * 140 / 120)}" role="img" aria-label="${title || c.codename}" xmlns="http://www.w3.org/2000/svg">${label}${parts.join("")}</svg>`;
}

// Símbolos táticos (molduras APP-6): amigo = retângulo azul, hostil = losango vermelho.
export const ROLES = [
  { id: "recon", name: "Reconhecimento", mission: 0, glyph: "recon" },
  { id: "nav",   name: "Navegação",      mission: 1, glyph: "nav" },
  { id: "log",   name: "Logística",      mission: 2, glyph: "log" },
  { id: "ge",    name: "Guerra Eletrônica", mission: 3, glyph: "ge" }
];

export function roleSymbolSVG(glyph, { size = 44, hostile = false } = {}) {
  const color = hostile ? "#c8302a" : "#1f4fa8";
  const fill = hostile ? "#f4c9c3" : "#cfdcf2";
  const frame = hostile
    ? `<path d="M30 3 L 57 30 L 30 57 L 3 30 Z" fill="${fill}" stroke="${color}" stroke-width="3"/>`
    : `<rect x="3" y="12" width="54" height="36" fill="${fill}" stroke="${color}" stroke-width="3"/>`;
  const g = {
    recon: `<path d="M5 47 L 55 13" stroke="${INK}" stroke-width="2.4"/><circle cx="30" cy="30" r="5" fill="none" stroke="${INK}" stroke-width="2.2"/>`,
    nav: `<path d="M30 16 L 36 34 L 30 30 L 24 34 Z" fill="${INK}"/><circle cx="30" cy="30" r="13" fill="none" stroke="${INK}" stroke-width="1.8"/>`,
    log: `<path d="M3 38 L 57 38" stroke="${INK}" stroke-width="2.4"/><circle cx="20" cy="27" r="4" fill="${INK}"/><circle cx="40" cy="27" r="4" fill="${INK}"/>`,
    ge: `<path d="M34 15 L 24 31 L 32 31 L 26 45 L 38 27 L 30 27 Z" fill="${INK}"/>`,
    med: `<path d="M30 17 L 30 43 M 17 30 L 43 30" stroke="${INK}" stroke-width="4"/>`,
    jam: `<path d="M18 30 C 22 22, 26 38, 30 30 C 34 22, 38 38, 42 30" fill="none" stroke="${INK}" stroke-width="2.6"/>`,
    eye: `<path d="M14 30 C 22 20, 38 20, 46 30 C 38 40, 22 40, 14 30 Z" fill="none" stroke="${INK}" stroke-width="2.2"/><circle cx="30" cy="30" r="4" fill="${INK}"/>`,
    patrol: `<path d="M16 38 L 30 20 L 44 38" fill="none" stroke="${INK}" stroke-width="2.6"/>`
  }[glyph] || "";
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${frame}${g}</svg>`;
}
