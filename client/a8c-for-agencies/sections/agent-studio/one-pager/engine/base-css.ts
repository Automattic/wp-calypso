// The Ela page stylesheet — a 5×12 modular grid plus a fixed block vocabulary.
// Every block declared in the system prompt (b-headline, b-section, b-image,
// b-number, b-stat, b-table, b-quote, b-eyebrow, b-facts, b-display,
// b-container, b-small, b-logo) is styled here so the LLM never writes CSS.
//
// Token placeholders ({{BODY_FONT}}, {{H1_FONT}}, etc.) are substituted at
// render time using the brand pack's font roles.

export const BASE_CSS = `
.ela-page {
  --accent: {{BRAND_ACCENT}};
  --ink: #1A1A1A;
  --muted: #8A8A8A;
  --soft: #F5F5F5;
  --rule: #E5E5E5;
  --module-gap: 24px;
  --page-margin: 48px;
  width: 816px !important;
  height: 1056px !important;
  position: relative !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background: #fff;
  padding: var(--page-margin) !important;
  display: flex !important;
  flex-direction: column !important;
  font-family: {{BODY_FONT}};
  font-size: 16px;
  line-height: 24px;
  color: var(--ink);
}

.ela-page > .page-header { display: none !important; }

.ela-page > .page-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
  position: relative;
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  grid-template-rows: repeat(12, minmax(0, 1fr)) !important;
  column-gap: var(--module-gap) !important;
  row-gap: var(--module-gap) !important;
  align-content: stretch;
  grid-auto-rows: minmax(0, 1fr);
  grid-auto-flow: row dense;
}

.ela-page > .page-body > [data-bleed~="t"] { margin-top:    calc(-1 * var(--page-margin)); }
.ela-page > .page-body > [data-bleed~="r"] { margin-right:  calc(-1 * var(--page-margin)); }
.ela-page > .page-body > [data-bleed~="b"] { margin-bottom: calc(-1 * var(--page-margin)); }
.ela-page > .page-body > [data-bleed~="l"] { margin-left:   calc(-1 * var(--page-margin)); }
.ela-page > .page-body > [data-bleed~="l"]:not([data-bleed~="r"]),
.ela-page > .page-body > [data-bleed~="r"]:not([data-bleed~="l"]) {
  width: calc(100% + var(--page-margin)) !important;
  max-width: none !important;
  justify-self: start !important;
}
.ela-page > .page-body > [data-bleed~="l"][data-bleed~="r"] {
  width: calc(100% + 2 * var(--page-margin)) !important;
  max-width: none !important;
  justify-self: start !important;
}

.ela-page > .page-body > :not([data-span]),
.ela-page[data-role="cover"] > .page-body > :not([data-span]) {
  grid-column: 1 / -1;
}

.ela-page > .page-body > [data-span="1"] { grid-column: span 1; }
.ela-page > .page-body > [data-span="2"] { grid-column: span 2; }
.ela-page > .page-body > [data-span="3"] { grid-column: span 3; }
.ela-page > .page-body > [data-span="4"] { grid-column: span 4; }
.ela-page > .page-body > [data-span="5"] { grid-column: 1 / -1; }

.ela-page > .page-body > [data-rowspan="1"]  { grid-row: span 1; }
.ela-page > .page-body > [data-rowspan="2"]  { grid-row: span 2; }
.ela-page > .page-body > [data-rowspan="3"]  { grid-row: span 3; }
.ela-page > .page-body > [data-rowspan="4"]  { grid-row: span 4; }
.ela-page > .page-body > [data-rowspan="5"]  { grid-row: span 5; }
.ela-page > .page-body > [data-rowspan="6"]  { grid-row: span 6; }
.ela-page > .page-body > [data-rowspan="7"]  { grid-row: span 7; }
.ela-page > .page-body > [data-rowspan="8"]  { grid-row: span 8; }
.ela-page > .page-body > [data-rowspan="9"]  { grid-row: span 9; }
.ela-page > .page-body > [data-rowspan="10"] { grid-row: span 10; }
.ela-page > .page-body > [data-rowspan="11"] { grid-row: span 11; }
.ela-page > .page-body > [data-rowspan="12"] { grid-row: 1 / -1; }

.ela-page > .page-body > .b-section:not([data-rowspan]) { grid-row: span 8; }
.ela-page > .page-body > .b-small:not([data-rowspan]) { grid-row: span 4; }
.ela-page > .page-body > .b-headline:not([data-rowspan]) { grid-row: span 2; }
.ela-page > .page-body > .b-image:not([data-rowspan]) { grid-row: span 4; }
.ela-page > .page-body > .b-logo:not([data-rowspan]) { grid-row: span 1; }
.ela-page > .page-body > .b-number:not([data-rowspan]) { grid-row: span 2; }
.ela-page > .page-body > .b-eyebrow:not([data-rowspan]) { grid-row: span 1; }
.ela-page > .page-body > .b-quote:not([data-rowspan]) { grid-row: span 4; }
.ela-page > .page-body > .b-stat:not([data-rowspan]) { grid-row: span 4; }
.ela-page > .page-body > .b-table:not([data-rowspan]) { grid-row: span 6; }
.ela-page > .page-body > .b-container:not([data-rowspan]) { grid-row: span 5; }
.ela-page > .page-body > .b-display:not([data-rowspan]) { grid-row: span 2; }
.ela-page > .page-body > .b-facts:not([data-rowspan]) { grid-row: span 5; }

.ela-page > .page-body > .b-image {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.ela-page > .page-body > .b-image > img {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ela-page > .page-body > .b-section,
.ela-page > .page-body > .b-small,
.ela-page > .page-body > .b-quote,
.ela-page > .page-body > .b-stat,
.ela-page > .page-body > .b-table,
.ela-page > .page-body > .b-container,
.ela-page > .page-body > .b-display,
.ela-page > .page-body > .b-facts {
  overflow: hidden;
  min-height: 0;
}

.ela-page > .page-footer {
  flex: 0 0 auto;
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  line-height: 16px;
  color: var(--muted);
  letter-spacing: 0.04em;
}
.ela-page > .page-footer > img {
  height: 20px;
  width: auto;
  display: block;
  object-fit: contain;
}

.ela-page .b-headline {
  font-family: {{H2_FONT}};
  text-transform: {{H2_CASE}};
  font-size: 32px;
  line-height: 38px;
  font-weight: 600;
  letter-spacing: {{H2_TRACKING}};
  color: var(--ink);
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-wrap: pretty;
}
.ela-page .b-headline[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-headline[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-headline[data-level="1"] {
  font-family: {{H1_FONT}};
  text-transform: {{H1_CASE}};
  letter-spacing: {{H1_TRACKING}};
  font-size: 36px;
  line-height: 40px;
  font-weight: 600;
}
.ela-page .b-headline[data-level="2"] { font-size: 32px; line-height: 38px; }
.ela-page .b-headline[data-level="3"] { font-size: 24px; line-height: 30px; }
.ela-page .b-headline[data-level="4"] { font-size: 20px; line-height: 26px; }
.ela-page .b-headline[data-span="5"] { width: calc(4 / 5 * 100%); }
.ela-page > .page-body > .b-section[data-span="5"],
.ela-page > .page-body > .b-small[data-span="5"] { width: calc(4 / 5 * 100%); }

.ela-page .b-display {
  font-family: {{DISPLAY_FONT}};
  text-transform: {{DISPLAY_CASE}};
  letter-spacing: {{DISPLAY_TRACKING}};
  font-size: 56px;
  line-height: 56px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-wrap: pretty;
}
.ela-page .b-display[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-display[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-display[data-span="5"] { width: calc(4 / 5 * 100%); }

.ela-page .b-section,
.ela-page .b-small {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.ela-page .b-section[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-section[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-small[data-align="top"]      { justify-content: flex-start; }
.ela-page .b-small[data-align="bottom"]   { justify-content: flex-end; }
.ela-page .b-section > p {
  font-family: {{BODY_FONT}};
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: var(--ink);
  margin: 0;
  max-width: 66ch;
}
.ela-page .b-section > p + p { margin-top: 12px; }
.ela-page .b-small > p {
  font-family: {{BODY_FONT}};
  font-size: 12px;
  line-height: 18px;
  font-weight: 400;
  color: var(--muted);
  margin: 0;
  max-width: 80ch;
}
.ela-page .b-small > p + p { margin-top: 8px; }

.ela-page .b-section a,
.ela-page .b-small a,
.ela-page .b-headline a,
.ela-page .b-display a,
.ela-page .b-quote a,
.ela-page .b-quote > blockquote a,
.ela-page .b-eyebrow a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.ela-page .b-quote {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0;
  padding-left: 18px;
  border-left: 4px solid var(--accent);
  color: var(--ink);
}
.ela-page .b-quote[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-quote[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-quote > blockquote {
  margin: 0;
  font-family: {{H2_FONT}};
  text-transform: {{H2_CASE}};
  font-size: 32px;
  line-height: 38px;
  font-weight: 500;
  letter-spacing: {{H2_TRACKING}};
  text-wrap: pretty;
}
.ela-page .b-quote > figcaption {
  margin-top: 16px;
  font-family: {{EYEBROW_FONT}};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: {{EYEBROW_TRACKING}};
  text-transform: {{EYEBROW_CASE}};
  color: var(--muted);
}

.ela-page .b-table {
  margin: 0;
  padding: 0;
  min-height: 0;
  overflow: hidden;
  display: block;
}
.ela-page .b-table > table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-family: {{BODY_FONT}};
  font-size: 12px;
  line-height: 1.35;
  color: var(--ink);
}
.ela-page .b-table th,
.ela-page .b-table td {
  padding: 0.55em 0.7em;
  text-align: left;
  vertical-align: top;
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
  border-bottom: 1px solid var(--rule);
}
.ela-page .b-table th {
  background: var(--accent);
  color: #FFFFFF;
  font-weight: 700;
}
.ela-page .b-table tbody tr:nth-child(even) td { background: var(--soft); }

.ela-page .b-number {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  margin: 0;
  border-top: 1px solid var(--rule);
  padding-top: 12px;
}
.ela-page .b-number[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-number[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-number > strong {
  font-family: {{H1_FONT}};
  text-transform: {{H1_CASE}};
  font-size: 36px;
  line-height: 40px;
  font-weight: 600;
  letter-spacing: {{H1_TRACKING}};
  color: var(--accent);
  display: block;
  max-width: 100%;
  white-space: nowrap;
}
.ela-page .b-number > span {
  font-family: {{EYEBROW_FONT}};
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: {{EYEBROW_TRACKING}};
  text-transform: {{EYEBROW_CASE}};
  color: var(--muted);
}

.ela-page .b-eyebrow {
  font-family: {{EYEBROW_FONT}};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: {{EYEBROW_TRACKING}};
  text-transform: {{EYEBROW_CASE}};
  color: var(--accent);
  margin: 0;
  display: block;
}

.ela-page .b-stat {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  justify-content: flex-end;
  margin: 0;
}
.ela-page .b-stat[data-align="top"]    { justify-content: flex-start; }
.ela-page .b-stat[data-align="bottom"] { justify-content: flex-end; }
.ela-page .b-stat > strong {
  font-family: {{H1_FONT}};
  text-transform: {{H1_CASE}};
  font-size: 72px;
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--accent);
  display: block;
  white-space: nowrap;
  max-width: 100%;
}
.ela-page .b-stat > span {
  font-family: {{BODY_FONT}};
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: var(--ink);
  display: block;
  max-width: 36ch;
}

.ela-page .b-facts {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 24px;
  row-gap: 0;
  align-content: start;
}
.ela-page .b-facts > dt,
.ela-page .b-facts > dd {
  margin: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: 1px solid var(--rule);
}
.ela-page .b-facts > dt {
  font-family: {{EYEBROW_FONT}};
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  letter-spacing: {{EYEBROW_TRACKING}};
  text-transform: {{EYEBROW_CASE}};
  color: var(--muted);
  white-space: nowrap;
}
.ela-page .b-facts > dd {
  font-family: {{BODY_FONT}};
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  color: var(--ink);
  min-width: 0;
}

.ela-page .b-image {
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--soft);
}
.ela-page .b-image > img {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--soft);
}

.ela-page .b-logo {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 0;
  overflow: hidden;
}
.ela-page .b-logo > img {
  max-width: 100%;
  max-height: min(40px, 100%);
  height: auto;
  width: auto;
  object-fit: contain;
  display: block;
}

.ela-page[data-theme="ink"],
.ela-page[data-theme="brand"] {
  background: var(--page-bg) !important;
  --ink: var(--page-fg);
  --muted: rgba(255, 255, 255, 0.65);
  --rule: rgba(255, 255, 255, 0.18);
  --soft: rgba(255, 255, 255, 0.10);
  --accent: var(--page-accent, var(--page-fg));
  color: var(--ink);
}
.ela-page[data-theme="ink"] .b-image,
.ela-page[data-theme="brand"] .b-image,
.ela-page[data-theme="ink"] .b-image > img,
.ela-page[data-theme="brand"] .b-image > img {
  background: rgba(255, 255, 255, 0.06);
}
`;
