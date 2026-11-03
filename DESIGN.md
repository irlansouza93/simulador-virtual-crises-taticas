---
name: Resgate na Serra
description: A tactical-crisis browser game drawn as an operation map sheet in relief, with every decision marked in grease pencil on an acetate overlay.
colors:
  table: "#23281f"
  table-2: "#2f3529"
  paper: "#efe6cf"
  paper-2: "#e4d8b8"
  paper-3: "#d7c8a2"
  card-paper: "#fbf8ef"
  sepia: "#8a5a2b"
  sepia-2: "#6e4620"
  ink: "#1d1d1b"
  ink-2: "#4a463d"
  ink-3: "#6d675a"
  blue: "#1f4fa8"
  blue-2: "#173c82"
  blue-wash: "#dfe7f3"
  friendly-fill: "#cfdcf2"
  red: "#c8302a"
  red-2: "#a52520"
  hostile-fill: "#f4c9c3"
  loss-ink: "#fff6ee"
  acetate: "rgba(243, 245, 240, 0.93)"
  acetate-line: "rgba(31, 79, 168, 0.32)"
  water: "#5b8fc9"
  water-plane: "#4f85c4"
  veg: "#c9d6a3"
  road: "#d98b3a"
  road-casing: "#3b332b"
  miniature-friendly: "#5b7096"
  miniature-hostile: "#a8443a"
  olive: "#5f6648"
  tree: "#6d8650"
  night-lamp: "#ff5a3c"
  strata-floor: "#2a2620"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(64px, 9.5vw, 124px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
  loss-numeral:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(110px, 22vw, 220px)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.05
  readout:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\""
  button:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
  map-label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  body:
    fontFamily: "Barlow, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Barlow, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Barlow, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.08em"
  grease:
    fontFamily: "Caveat Brush, Segoe Print, cursive"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  mark: "2px"
  control: "3px"
  sheet: "4px"
  dial: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  collar: "60px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#2459bb"
    textColor: "{colors.paper}"
  button-primary-disabled:
    backgroundColor: "{colors.paper-3}"
    textColor: "{colors.ink-3}"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-2}"
  button-loss:
    backgroundColor: "{colors.loss-ink}"
    textColor: "{colors.red-2}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
    height: "48px"
  field-input:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "48px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 12px 4px 4px"
    height: "44px"
  chip-on:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
  calco-panel:
    backgroundColor: "{colors.acetate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "32px 36px 28px"
  title-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "0px"
    padding: "34px 36px 28px"
  option-card:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sheet}"
    padding: "20px 20px 22px"
    height: "172px"
  option-card-selected:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.ink}"
  ask-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.mark}"
    padding: "6px 18px"
  loss-card:
    backgroundColor: "{colors.red}"
    textColor: "{colors.loss-ink}"
    typography: "{typography.loss-numeral}"
    padding: "24px"
  collar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "{spacing.collar}"
    padding: "0 20px"
  toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
---

# Design System: Resgate na Serra

## Overview

**Creative North Star: "Carta Topográfica com Calco"**

The whole game is the operation's map sheet. A topographic sheet in relief fills the viewport as a sand-table block: cream map paper, sepia contour lines, a black UTM grid, blue water, olive vegetation tint and low-poly miniatures sitting on the terrain. Everything the players do is laid over that sheet on acetate: translucent calco panels pinned with blue registration crosses, APP-6 unit frames, and grease-pencil marks in blue (ours) and red (theirs). Documents of record (the sheet's title block, the briefing caption, the field report) are printed paper boxed in a double ink rule.

Density is that of a working briefing table, not a dashboard: one sheet of acetate at a time, large condensed type readable across a shared Google Meet screen, and the 3D relief always visible behind. State is shown on the map before it is written: GPS jamming hatches the valley red, the gravimetric anomaly rings the shelter in blue, the survival clock dims daylight toward a red night map-light. The world refuses the neon sci-fi HUD and the side-menu quiz; there is no glow, no gradient chrome and no glass beyond the acetate's own slight blur.

Consequence is total. A loss is not a toast or a modal: hostile red takes the entire field. A win is a blue grease tick drawn on acetate.

**Key Characteristics:**
- Full-bleed 3D relief sheet on a dark olive table, under a paper map collar along the top edge.
- Two material registers: acetate calco (transient work) and paper title block (record).
- Two grease pencils only: friendly blue and hostile red. No third state hue.
- Three type voices: printed condensed map type, plain body prose, and hand-drawn Caveat Brush for marks a person made.
- Hand-drawn SVG strokes animate in as if drawn (stroke-dashoffset), never fade in as icons.
- Day-to-night lighting is driven by the survival clock, not by decoration.

## Colors

A cartographer's palette: warm map paper and sepia relief, black survey ink, and exactly two grease pencils, blue for friendly and red for hostile.

### Primary
- **Friendly Grease Blue** (`blue`): our side and our decisions. Primary buttons, the current and completed marks on the mission rail, the selected option card, focus outlines, caret, friendly APP-6 frames, friendly hand labels, gravimetric anomaly rings in the terrain, the success tick, signed report sections, and the "ok" stamp. Deep variant **Survey Blue** (`blue-2`) borders blue buttons and sets italic water names; **Blue Wash** (`blue-wash`) is the faint tint under a selected card or current rail step; **Friendly Frame Fill** (`friendly-fill`) fills the blue APP-6 rectangle.

### Secondary
- **Hostile Grease Red** (`red`): the enemy, losses and time cost. Hostile APP-6 diamonds and hand labels, the jamming hatch and dome, landslide X marks, the grease circle around Jogar, strike-throughs on failed cards, the clock when critical (10:00 or less) and when hit, and the full-field loss card. **Deep Red** (`red-2`) is the text on the loss card's button; **Hostile Frame Fill** (`hostile-fill`) fills the red APP-6 diamond. **Loss Ink** (`loss-ink`) is the warm off-white used for all type set on the red field.

### Tertiary
- **Relief Sepia** (`sepia`): contour lines, rock strata on the block's sides, report section rules, the briefing step number, option-card pictograms and the scrollbar thumb. **Dark Sepia** (`sepia-2`) sets relief names (ridges, hills) and report section headings, and traces instrument charts.

### Neutral
- **Map Paper** (`paper`): the collar, title blocks, ghost buttons, chips, the toast, and the terrain's base colour in the shader. **Paper Shade** (`paper-2`) for hover on paper controls; **Paper Fold** (`paper-3`) for dividers, table rules and the disabled primary button.
- **Card Paper** (`card-paper`): the brighter stock used for inputs, option cards, portrait frames, keypad keys, instrument wells and chart backgrounds.
- **Survey Ink** (`ink`): text, ink rules (the double rule, 1.5px card borders), the UTM grid in the terrain, and the ask bar. **Ink 2** (`ink-2`) for secondary prose and field labels; **Ink 3** (`ink-3`) for hints, metadata and table headings (4.52:1 on paper; reserve it for text on paper or acetate, never on Paper Fold).
- **Table Olive** (`table`, `table-2`): the dark surface the sheet rests on; the body background is a radial gradient from `table-2` to `table`, and `table` is the browser theme colour.
- **Acetate** (`acetate`) and **Acetate Edge** (`acetate-line`): the translucent overlay sheet and its faint blue edge, also used for internal hairlines inside calco panels.

### Terrain and miniature colours (js/scene.js)
- **Water Tint** (`water`) is the shader's water colour under the river; the transparent **Water Plane** (`water-plane`, 0.85 opacity) sits just below the water level.
- **Vegetation Tint** (`veg`) is mixed into the paper by a per-vertex vegetation attribute; trees are **Tree Green** (`tree`) low-poly icosahedrons.
- Roads are an orange **Road** (`road`) ribbon over a darker **Road Casing** (`road-casing`); trails are a dashed casing-colour ribbon; the fibre-optic line is a dark blue tube (#2b4f86).
- Miniature bodies are muted, never the grease colours: **Friendly Miniature** (`miniature-friendly`) and **Hostile Miniature** (`miniature-hostile`), plus **Olive Drab** (`olive`) for tents. The grease colours are reserved for the APP-6 markers floating above them.
- **Night Map-Light** (`night-lamp`) is the red-orange point light that rises as daylight falls; **Strata Floor** (`strata-floor`) closes the bottom of the relief block.

### Named Rules
**The Two Pencils Rule.** Blue means ours, red means theirs or lost. Nothing else carries state colour: no green for success, no amber for warning. A third state hue is a different world.

**The Full-Field Red Rule.** A loss commits the entire viewport to Hostile Grease Red with Loss Ink type. Red never appears as a small modal on paper for a loss.

**The Paper Never Glows Rule.** Night is the paper dimming, not a neon. The terrain and strata multiply toward (0.82, 0.60, 0.55) x 0.7 and a red map-light rises; nothing emits light of its own except the photons and markers the story needs.

## Typography

**Display Font:** Barlow Condensed 500–800 (with Arial Narrow)
**Body Font:** Barlow 400–700, italic 400 (with Segoe UI)
**Hand Font:** Caveat Brush 400 (with Segoe Print)

**Character:** Barlow Condensed is the printed map: sheet titles, place names, readouts and buttons in tight uppercase, like a military sheet's collar. Barlow carries the prose plainly. Caveat Brush is the grease pencil: it appears only where a person drew on the acetate.

### Hierarchy
- **Display** (800, clamp(64px, 9.5vw, 124px), 0.86, uppercase): the title on the start title block only.
- **Loss Numeral** (800, clamp(110px, 22vw, 220px), 0.85, tabular): the minutes lost, alone on the red field.
- **Headline** (800, 40px, 1.0, uppercase): calco panel headings; 56px on the report head, 48px on the control hand-off, 30px on the situation panel and PIN box.
- **Title** (700, 24px, 1.05, uppercase): option card names; 20–21px for role names, report mission heads and how-to steps.
- **Readout** (700–800, 32px clock / 24–34px instrument and fact values, tabular numerals): every number with its honest physical unit.
- **Button** (700, 19px, 0.04em, uppercase): all buttons; 22px on the execute button, 26px on Jogar.
- **Label** (600, 15px, 0.08em, uppercase): field labels and the sheet-step footer (0.1em, blue).
- **Map Label** (600, 13px, 0.14em, uppercase, paper halo): place names floating over the terrain. Relief names use 12px at 0.3em in Dark Sepia; water names use Barlow italic 14px in Survey Blue; spot heights use Barlow 12px.
- **Body** (400, 17px, 1.5): prose; 16px under 760px. Situation text runs to 62ch, report prose to 70–75ch.
- **Lede** (400, 19px, 1.45, 46ch): the start block's one line of situation.
- **Caption** (400–600, 12px, 0.08em, uppercase): definition-list terms, table headings, metadata.
- **Grease** (Caveat Brush 400, 28px): loss tags, XP gain, "Falhou" (30px), hostile and friendly map labels (20–21px), the loss tally on the rail (18px). Grease text is set slightly rotated (-2deg to -12deg).

### Named Rules
**The Three Hands Rule.** Printed type (Barlow Condensed) is the map; plain type (Barlow) is the briefing; hand type (Caveat Brush) is only what someone marked on the acetate. Caveat Brush never sets instructions, buttons, headings or body copy.

**The Honest Unit Rule.** Every readout is a tabular numeral with its physical unit (m, dBm, μGal, %, minutes). No unitless scores, no progress percentages invented for drama.

## Layout

The 3D relief is a fixed full-bleed stage; the map collar is a fixed 60px strip (56px under 760px) along the top, laid out as a three-column grid: sheet title and sheet number left, mission rail centre, survival clock and sound toggle right. Every screen is an absolutely positioned layer inset below the collar with 24px padding (16px on phones), and only its contents take pointer events, so the terrain stays draggable around the panels.

Panels anchor to edges, not the centre, so the relief stays readable: the start title block (max 560px) sits bottom-left with the three drawn how-to steps (190px each) bottom-right; the decision layout (max 1100px) is bottom-aligned with the situation calco, the ask bar and three option cards in a row; the running instrument calco (420px) and the briefing caption (760px) sit bottom-centre. Forms use calco widths of 480px (narrow) and 860px (wide). The report is a 920px paper sheet in its own scroll. When a decision panel is up, the camera framing shifts so the mission target sits above the cards.

Spacing has no token scale in code; the observed rhythm is 6, 10, 16, 24 and 36px, with 12–18px gaps between cards and 22px under headings.

Breakpoints: 1280px hides the sheet number; 1100px collapses rail names to the current step and stacks facts; 860px stacks the start screen and player sheet into one column; 760px is the phone layout (single-column options, sticky full-width execute button, hidden how-to subtitles, smaller headings). A short-height rule (760px tall and wider than 760px) tightens option cards and the display title. Print shows only the report on white.

## Elevation & Depth

Depth is physical: sheets laid on a table, and a relief block with real 3D lighting. UI elevation uses one soft, ambient drop shadow for anything lying on the map, and tonal steps of paper for everything else. There are no glows, no hard offset shadows and no stacked elevation levels; a selected option card rises (translateY -8px) and gains a 3px blue ring rather than a heavier shadow.

The 3D scene is lit by a warm hemisphere light (sky #fff6e2, ground #4a4436) and a warm sun from the north-west (#fff1d6). Terrain shading is computed in the shader as 0.6 + 0.5 x the sun term; shadow maps are off. A vignette darkens the stage edges toward the table colour.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 22px 48px -18px rgba(12, 14, 9, 0.6), 0 3px 10px rgba(12, 14, 9, 0.22)`): calco panels, title blocks, how-to steps, the report, the toast and the ask bar.
- **Dealt Card** (`box-shadow: 0 10px 24px -14px rgba(12, 14, 9, 0.7), 0 2px 4px -1px rgba(12, 14, 9, 0.2)`): option cards at rest; on hover `0 22px 30px -16px rgba(12, 14, 9, 0.75)` with a 6px lift.
- **Pressed Control** (`box-shadow: 0 6px 14px -6px rgba(12, 14, 9, 0.55)`): primary buttons and the checked player-count tile; collapses to `0 2px 6px -3px` on press.
- **Collar** (`box-shadow: 0 6px 18px -8px rgba(12, 14, 9, 0.5)`): the map collar over the stage.
- **Focus Halo** (`box-shadow: 0 0 0 3px rgba(31, 79, 168, 0.22)`): focused inputs, with a blue border.

### Named Rules
**The Sheet Stack Rule.** Anything on the map is a sheet with the one Sheet shadow. Lift communicates selection; colour of the shadow never changes except the selected card's blue-tinted drop.

## Shapes

Drafting-table geometry. Corners are nearly square: 2px for marks and small frames, 3px for controls and fields, 4px for acetate sheets and option cards. Paper title blocks are square-cornered with a 3px double ink rule. Circles are reserved for things that are round in the world: option keys (A/B/C), the operator arrow buttons, PIN dots and clock dials in diagrams.

Signature forms: four blue registration crosses (circle plus crosshair, 16px) inset 8px from each corner of an acetate sheet; APP-6 frames (friendly rectangle 54x36 in a 60 box, hostile diamond) with a 3px stroke in the grease colour over a pale fill and a black glyph; the rail's state marks (outlined square, blue flag triangle, filled square with a paper X); the rotated double-bordered report stamp; and freehand grease strokes (the loose ellipse around Jogar, the X strike across a failed card, the success tick) drawn with round caps.

## Components

### Buttons
Printed, firm and square-shouldered, like labels on a field case.
- **Shape:** near-square (3px), 2px ink border, minimum 48px tall.
- **Primary:** Friendly Grease Blue with Map Paper text and a Survey Blue border, 10px 22px padding, Pressed Control shadow.
- **Hover / Active:** lifts 1px and brightens to #2459bb; presses down 1px with a tighter shadow. Transitions 0.15s on the shared ease-out.
- **Disabled:** Paper Fold fill, Ink 3 text, no shadow.
- **Ghost:** Map Paper fill, ink border and ink text; hover to Paper Shade. Used for Voltar, Pular, Acelerar, Imprimir.
- **Loss:** Loss Ink fill with Deep Red text, sitting on the red field.
- **Grease-circled Jogar:** the primary button at 26px with a hand-drawn red ellipse that draws itself in over 1.1s after a 1s delay.
- **Link:** blue underlined text with 3px offset, 44px tap height.

### Chips (role assignment)
- **Style:** Map Paper with a 1.5px Ink 2 border, 3px corners, a 34x36 portrait well on the left, condensed 16px name.
- **State:** checked turns Friendly Grease Blue with paper text and a Survey Blue border; focus draws a 3px blue outline.

### Calco Panels (acetate)
- **Corner Style:** 4px.
- **Background:** Acetate with a 3px backdrop blur and a 1px Acetate Edge border.
- **Shadow Strategy:** Sheet.
- **Registration:** four blue registration crosses at the corners.
- **Internal Padding:** 32px 36px 28px (26px 20px 20px on phones); headings 40px with 22px below.
- **Entrance:** slides up 24px from a -0.6deg tilt over 0.55s.
- **Use:** every transient working surface: team, operator and role forms, the hand-off, the situation, the running instrument, the success note, the map key (Legenda), the PIN box.

### Paper Title Blocks
- **Corner Style:** square, 3px double ink rule.
- **Background:** Map Paper with the Sheet shadow.
- **Use:** documents of record only: the start title block, the briefing caption, the field report. The map collar is the same material with a 3px double rule on its bottom edge.

### Inputs / Fields
- **Style:** Card Paper, 1.5px Ink 2 border, 3px corners, 48px tall, 18px text; blue caret.
- **Focus:** border turns Friendly Grease Blue with the Focus Halo.
- **Error:** 15px semibold red message under the field, hidden when empty. PIN fields set 26px digits at 0.5em tracking.

### Option Cards (decision)
- **Style:** Card Paper, 1.5px ink border, 4px corners, minimum 172px tall, a circled letter key, a sepia line pictogram top-right, a 24px title and 16px description.
- **Motion:** dealt onto the table: each card rises 60px from a fanned rotation ((i-1) x 4deg) with a 90ms stagger.
- **Selected:** Blue Wash fill, blue border and 3px blue ring, lifted 8px, key filled blue.
- **Failed:** dimmed to 0.72 on Paper Shade, text struck in translucent red, a red grease X across the card and "Falhou" in Caveat Brush.

### Navigation (mission rail)
- **Style:** four condensed uppercase steps in the collar, each with a 16px mark.
- **States:** pending is an outlined square in Ink 3; current is a blue flag triangle with blue text on Blue Wash; done is a filled blue square with a paper X in ink text; each classical (losing) attempt adds a red grease tally after the name.
- **Mobile:** names collapse to the current step under 1100px and to marks only under 760px.

### Survival Clock
Condensed 32px tabular numerals under a 10px "Sobrevida" caption. Paused turns Ink 3; at 10:00 or less it turns red; a time penalty flashes the clock solid red with paper text and a 1.12 scale over 0.9s.

### Loss Card
The whole viewport turns Hostile Grease Red, wiped in from the left (clip-path) over 0.5s. Inside, a 760px column: the minutes lost in the Loss Numeral, a 24px sentence, Caveat Brush tags for what went wrong, the Loss button, and a hairline-ruled caption naming the operator. Children stagger in 0.1s apart. A darker red (rgba(120, 18, 14, 0.9)) field below the collar marks the clinical window expiring.

### APP-6 Unit Markers
Friendly units are a blue rectangle frame over Friendly Frame Fill; hostile units are a red diamond over Hostile Frame Fill; both carry a black role glyph (recon, navigation, logistics, electronic warfare, medical, jammer, listening post, patrol). The same SVG renders in the map key, the role board and, as 128px sprites drawn without depth test, floating 4–8 units above the miniature they mark.

### Instruments
Readout wells inside the running calco: Card Paper chart areas with an Ink 3 axis, a dashed blue threshold and a Dark Sepia trace that turns blue when the target is found; bars and gauges in blue, switching to red on alert; a photon strip of 16 cells lit blue (red when intercepted).

### Relief Sheet (3D terrain)
The terrain is a 128 x 128 unit sheet in a custom shader, with these conventions:
- **Base:** Map Paper mixed toward Vegetation Tint by the per-vertex vegetation value (x 0.8), lightened low and darkened high (1.03 to 0.90 over 0–34 units), and Water Tint below the water level (1.1 units, mixed at 0.9).
- **Contours:** sepia minor contours every 1.25 units at 0.42 strength (1px antialiased via fwidth); major contours every 6.25 units (every fifth) at 0.85 strength and 1.7px. Contours stop at the waterline.
- **UTM grid:** an ink grid every 10 units at 0.28 strength, over land and water.
- **Strata:** the block's sides are sepia and paper rock bands with a sine warp, closed underneath by Strata Floor.
- **Mission overlays:** the gravimetric anomaly draws five blue concentric rings with a 0.22 blue wash; GPS jamming draws a slowly moving red diagonal hatch (0.1 strength) inside a red edge ring and a translucent red ringed dome; the shelter reveal cuts a hole in the sheet.
- **Night map-light:** daylight is set from the survival clock as 0.25 + 0.75 x (seconds left / 2700) and eases toward it at 2% per frame. Sun intensity runs 0.5 + 2.0 x day, hemisphere 0.45 + 1.1 x day, and the red map-light (1 - day) x 900. Terrain and strata blend toward their night tint as day falls; the map never goes fully dark.
- **Labels:** place names are HTML overlays projected onto the terrain with a paper halo; they fade to 0.4 on the report screen.
- **Camera:** 38deg field of view with a barely perceptible azimuth sway (0.03 rad over a ~2 minute period); a short decaying shake on impacts. Both are disabled under reduced motion.

### Motion vocabulary
One easing curve, `cubic-bezier(0.16, 1, 0.3, 1)`, for every entrance and state change. Entrances: sheet-in (0.55s, 24px rise from -0.6deg), deal (0.6s, fanned and staggered), wipe (0.5s clip-path, loss only), fade (0.2–0.4s, overlays). Marks: draw (stroke-dashoffset, 0.7–1.1s) for every grease stroke. Feedback: hit (0.9s clock flash), shake (0.4s on a wrong PIN), swap (0.38s operator portrait). Under reduced motion every animation collapses to an instant end state, transitions to 0.12s, drawn strokes appear complete, and the camera holds still.

## Do's and Don'ts

### Do:
- **Do** put every transient working surface on an acetate calco with four registration crosses, and every document of record on paper with the 3px double ink rule.
- **Do** keep state colour to the two grease pencils: Friendly Grease Blue for ours and success, Hostile Grease Red for hostile, loss and lost time.
- **Do** show a mission's state on the relief first (rings, hatching, routes, markers) and in the panel second.
- **Do** draw grease marks as SVG strokes with round caps that animate in with stroke-dashoffset.
- **Do** set every readout in tabular condensed numerals with its physical unit.
- **Do** mark units with APP-6 frames: blue rectangle for friendly, red diamond for hostile, black glyph inside.
- **Do** tie scene lighting to the survival clock: daylight from 1.0 down to 0.25, with the red map-light rising as it falls.
- **Do** keep contours sepia (minor 1.25, major 6.25 units) and the UTM grid ink at 10-unit spacing on any new terrain.
- **Do** honour reduced motion: end states instantly, no camera sway or shake.

### Don't:
- **Don't** build a neon sci-fi HUD: no glow, bloom, scanlines, cyan-on-black or glassmorphism beyond the acetate's 3px blur.
- **Don't** turn decisions into a side-menu quiz; options are cards dealt onto the map.
- **Don't** introduce a third state hue (green success, amber warning).
- **Don't** set Caveat Brush on buttons, headings, instructions or body copy.
- **Don't** paint miniatures in the grease colours; the bodies stay muted and the APP-6 marker carries the side.
- **Don't** show a loss as a small modal or toast; it takes the whole field in red.
- **Don't** set Hostile Grease Red as body-size text on paper; it measures 4.32:1 there and needs 18.66px bold or larger.
- **Don't** use hard offset shadows or more than the one Sheet shadow for anything lying on the map.
