// Body layouts — the 22 base patterns the LLM picks from, plus a right-rail
// mirror of each so the page can flip its empty column. Ported verbatim from
// the prototype's bodyLayouts.ts. Each layout owns its grid placement, prompt
// example, and picking rule; the LLM reads the formatted examples and rules
// in the system prompt, never invents geometry.

/* eslint-disable @typescript-eslint/no-unused-vars */

export type BodyBlockType =
	| 'headline'
	| 'display'
	| 'body'
	| 'small-body'
	| 'blurb'
	| 'image'
	| 'logo'
	| 'number'
	| 'table'
	| 'spacer'
	| 'eyebrow'
	| 'quote'
	| 'stat'
	| 'facts'
	| 'container';

export interface BodyBlock {
	type: BodyBlockType;
	col: number;
	row: number;
	colSpan: number;
	rowSpan: number;
	align?: 'top' | 'bottom';
	level?: 1 | 2 | 3 | 4;
	tableRows?: number;
	tableCols?: number;
	display?: boolean;
	size?: 'body' | 'small';
	bleed?: { t?: boolean; r?: boolean; b?: boolean; l?: boolean };
	direction?: 'v' | 'h';
	fill?: 'none' | 'soft' | 'ink' | 'brand';
	padding?: number;
	gap?: number;
	crossAlign?: 'start' | 'center' | 'end' | 'stretch';
	rule?: 't' | 'r' | 'b' | 'l';
	children?: BodyBlock[];
}

export interface BodyLayout {
	id: string;
	label: string;
	description: string;
	blocks: BodyBlock[];
	promptTitle: string;
	promptExample: string;
	pickingRule: string;
	rail?: 'left' | 'right';
	mirrorable?: boolean;
	mirrorOf?: string;
	usesImages?: boolean;
	maxPerDocument?: number;
}

const BODY_LAYOUT_BASES: BodyLayout[] = [
	{
		id: 'A',
		label: 'A · Section start',
		description: 'Headline (rows 1-2) · breathing rows 3-4 · body (rows 5-12).',
		promptTitle: 'Section start (headline + body)',
		pickingRule: 'A when a section opens with a confident headline + body.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'body', col: 2, row: 5, colSpan: 4, rowSpan: 8, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Headline text</section>
<section class="b-section" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <p>Paragraph one.</p>
  <p>Paragraph two.</p>
</section>`,
	},
	{
		id: 'B',
		label: 'B · Continuation',
		description: 'Body only, full page (rows 1-12). Used when text spills over.',
		promptTitle: 'Continuation (body only, no anchor)',
		pickingRule: 'B when prose continues from the previous page (no new anchor needed).',
		blocks: [ { type: 'body', col: 2, row: 1, colSpan: 4, rowSpan: 12, align: 'top' } ],
		promptExample: `<section class="b-section" data-span="4" data-rowspan="12" style="grid-column: 2 / -1;">
  <p>Paragraph one.</p>
  <p>Paragraph two.</p>
</section>`,
	},
	{
		id: 'C',
		label: 'C · Number band',
		description: 'Headline (rows 1-2) · 4 numbers across (rows 4-5) · body (rows 6-12).',
		promptTitle: 'Section start with number band (headline + 4 numbers + body)',
		pickingRule: 'C when the source has 4 strong figures that anchor the section.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'number', col: 2, row: 4, colSpan: 1, rowSpan: 2, align: 'bottom' },
			{ type: 'number', col: 3, row: 4, colSpan: 1, rowSpan: 2, align: 'bottom' },
			{ type: 'number', col: 4, row: 4, colSpan: 1, rowSpan: 2, align: 'bottom' },
			{ type: 'number', col: 5, row: 4, colSpan: 1, rowSpan: 2, align: 'bottom' },
			{ type: 'body', col: 2, row: 6, colSpan: 4, rowSpan: 7, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Headline text</section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 4;"><strong>VALUE</strong><span>Label</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 3; grid-row: 4;"><strong>VALUE</strong><span>Label</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 4; grid-row: 4;"><strong>VALUE</strong><span>Label</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 5; grid-row: 4;"><strong>VALUE</strong><span>Label</span></section>
<section class="b-section" data-span="4" data-rowspan="7" style="grid-column: 2 / -1; grid-row: 6 / -1;">
  <p>Paragraph one.</p>
</section>`,
	},
	{
		id: 'D',
		label: 'D · One image',
		description: 'Image (rows 1-4, full width) · body (rows 5-12). No breathing row.',
		promptTitle: 'One image + body (NO breathing rows, image fills rows 1-4)',
		pickingRule: 'D when one image carries the page above the body.',
		usesImages: true,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 4, rowSpan: 4 },
			{ type: 'body', col: 2, row: 5, colSpan: 4, rowSpan: 8, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="4" data-rowspan="4" style="grid-column: 2 / -1;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-section" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <p>Paragraph one.</p>
</section>`,
	},
	{
		id: 'E',
		label: 'E · Two images',
		description: 'Two images side-by-side (rows 1-4) · body (rows 5-12).',
		promptTitle: 'Two images + body (NO breathing rows, images fill rows 1-4)',
		pickingRule:
			'E when two images compare or pair (e.g., before/after, two products, two scenes).',
		usesImages: true,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 2, rowSpan: 4 },
			{ type: 'image', col: 4, row: 1, colSpan: 2, rowSpan: 4 },
			{ type: 'body', col: 2, row: 5, colSpan: 4, rowSpan: 8, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 2 / span 2;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 4 / span 2;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-section" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <p>Paragraph one.</p>
</section>`,
	},
	{
		id: 'F',
		label: 'F · Image + side notes',
		description: 'Image (rows 1-4) · body (rows 5-12) · two short side blurbs in column 1.',
		promptTitle: 'Image + body with two side-note blurbs in column 1',
		pickingRule:
			'F when an image page also has a short caption AND a side note next to the body: captions, sources, or asides that are NOT inline prose.',
		usesImages: true,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 4, rowSpan: 4 },
			{ type: 'body', col: 2, row: 5, colSpan: 4, rowSpan: 8, align: 'top' },
			{ type: 'small-body', col: 1, row: 1, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'small-body', col: 1, row: 5, colSpan: 1, rowSpan: 2, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="4" data-rowspan="4" style="grid-column: 2 / -1;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-section" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <p>Main paragraph one.</p>
</section>
<section class="b-small" data-span="1" data-rowspan="2" style="grid-column: 1; grid-row: 1;">
  <p>Side note next to the image: caption, source, or aside.</p>
</section>
<section class="b-small" data-span="1" data-rowspan="2" style="grid-column: 1; grid-row: 5;">
  <p>Side note next to the body: caption, source, or aside.</p>
</section>`,
	},
	{
		id: 'G',
		label: 'G · Image plate',
		description: 'Tall image (rows 1-8) with a short side note in column 1. Quiet bottom band.',
		promptTitle: 'Image plate: tall image with a single side note, rows 9-12 empty',
		pickingRule:
			'G as a quiet image plate page: tall image with a caption, then negative space below. RARE: use AT MOST ONCE per document and only as a deliberate section opener or breather. NEVER use Pattern G if the brief still has body content to surface.',
		usesImages: true,
		maxPerDocument: 1,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 4, rowSpan: 8 },
			{ type: 'small-body', col: 1, row: 1, colSpan: 1, rowSpan: 2, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="4" data-rowspan="8" style="grid-column: 2 / -1;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-small" data-span="1" data-rowspan="2" style="grid-column: 1; grid-row: 1;">
  <p>Caption: what the image shows, or a short pull-out from the source.</p>
</section>`,
	},
	{
		id: 'H',
		label: 'H · Stat callout',
		description:
			'Two-tone HStack at the page bottom: VStack soft (eyebrow + headline + small body) + VStack ink (stat).',
		promptTitle: 'Stat callout: headline + framing paragraph + two-tone HStack with one hero stat',
		pickingRule:
			"H when ONE hero figure plus a framing sentence is the section's anchor: a two-tone callout. At most one Pattern H per document; it's a tonal accent, not a workhorse.",
		maxPerDocument: 1,
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'small-body', col: 2, row: 5, colSpan: 4, rowSpan: 2, align: 'top' },
			{
				type: 'container',
				col: 2,
				row: 8,
				colSpan: 4,
				rowSpan: 5,
				direction: 'h',
				fill: 'none',
				padding: 0,
				gap: 0,
				crossAlign: 'stretch',
				children: [
					{
						type: 'container',
						col: 1,
						row: 1,
						colSpan: 1,
						rowSpan: 1,
						direction: 'v',
						fill: 'soft',
						padding: 32,
						gap: 12,
						crossAlign: 'start',
						children: [
							{ type: 'eyebrow', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
							{ type: 'headline', col: 1, row: 1, colSpan: 1, rowSpan: 1, level: 2 },
							{ type: 'small-body', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
						],
					},
					{
						type: 'container',
						col: 1,
						row: 1,
						colSpan: 1,
						rowSpan: 1,
						direction: 'v',
						fill: 'ink',
						padding: 32,
						gap: 12,
						crossAlign: 'start',
						children: [ { type: 'stat', col: 1, row: 1, colSpan: 1, rowSpan: 1 } ],
					},
				],
			},
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Section headline</section>
<section class="b-section" data-span="4" data-rowspan="3" style="grid-column: 2 / -1; grid-row: 5 / span 3;">
  <p>One short paragraph framing the figure (~50 words). The framework paginates if longer.</p>
</section>
<aside class="b-container" data-direction="h" data-fill="none" data-span="4" data-rowspan="4" style="grid-column: 2 / -1; grid-row: 9 / span 4;">
  <aside class="b-container" data-direction="v" data-fill="soft" data-align-cross="start">
    <span class="b-eyebrow">ECOSYSTEM</span>
    <section class="b-headline" data-level="3">The largest CMS ecosystem</section>
    <section class="b-small"><p>WordPress powers the largest developer talent pool, agency network, and extension marketplace of any CMS platform.</p></section>
  </aside>
  <aside class="b-container" data-direction="v" data-fill="ink" data-align-cross="start">
    <aside class="b-stat"><strong>43%</strong><span>of all websites run on WordPress. Source: W3Techs.</span></aside>
  </aside>
</aside>`,
	},
	{
		id: 'I',
		label: 'I · Table',
		description: 'Headline (rows 1-2) · variable table (rows 5-12).',
		promptTitle: 'Table page (headline + structured table)',
		pickingRule:
			'I when the source has true rows and columns: criteria weights, checklists, scorecards, or pipe-delimited table data.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{
				type: 'table',
				col: 2,
				row: 5,
				colSpan: 4,
				rowSpan: 8,
				tableRows: 6,
				tableCols: 3,
			},
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Comparison headline</section>
<section class="b-table" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <table>
    <thead>
      <tr><th>Criterion</th><th>Weight</th><th>Rationale</th></tr>
    </thead>
    <tbody>
      <tr><td>Architecture and composability</td><td>15%</td><td>Foundation for everything else.</td></tr>
      <tr><td>Security and compliance</td><td>15%</td><td>Non-negotiable for regulated teams.</td></tr>
    </tbody>
  </table>
</section>`,
	},
	{
		id: 'J',
		label: 'J · Pull quote',
		description: 'Large quote (cols 2-3) paired with compact body copy (cols 4-5).',
		promptTitle: 'Pull quote page (large quote + compact body)',
		pickingRule:
			'J when the source contains a sentence labeled "Pull quote" or one short sentence that can carry a section as a quote. Use at most one Pattern J per document.',
		maxPerDocument: 1,
		blocks: [
			{ type: 'quote', col: 2, row: 3, colSpan: 2, rowSpan: 6, align: 'top' },
			{ type: 'body', col: 4, row: 3, colSpan: 2, rowSpan: 6, align: 'top' },
		],
		promptExample: `<figure class="b-quote" data-span="2" data-rowspan="6" data-align="top" style="grid-column: 2 / span 2; grid-row: 3 / span 6;">
  <blockquote>Run one site for a month. Then decide with real traffic, not marketing claims.</blockquote>
</figure>
<section class="b-section" data-span="2" data-rowspan="6" style="grid-column: 4 / span 2; grid-row: 3 / span 6;">
  <p>Short body copy that explains the quoted idea and carries the surrounding source facts.</p>
</section>`,
	},
	{
		id: 'K',
		label: 'K · Tier comparison',
		description: 'Headline (rows 1-2) · four-column comparison table (rows 5-12).',
		promptTitle: 'Tier comparison (headline + four-column table)',
		pickingRule:
			'K when the source compares plans, tiers, packages, or options in four compact columns. Use this instead of Pattern I for pricing or tier comparisons.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'table', col: 2, row: 5, colSpan: 4, rowSpan: 8, tableRows: 5, tableCols: 4 },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Plan comparison</section>
<section class="b-table" data-span="4" data-rowspan="8" style="grid-column: 2 / -1; grid-row: 5 / -1;">
  <table>
    <thead>
      <tr><th>Plan</th><th>Price</th><th>Capacity</th><th>Best fit</th></tr>
    </thead>
    <tbody>
      <tr><td>Single Site</td><td>$25</td><td>1 site</td><td>One client trial</td></tr>
      <tr><td>Agency</td><td>$90</td><td>10 sites</td><td>Small agency book</td></tr>
    </tbody>
  </table>
</section>`,
	},
	{
		id: 'L',
		label: 'L · Timeline',
		description: 'Headline plus four numbered steps, each with a short explanation.',
		promptTitle: 'Timeline (headline + four numbered steps)',
		pickingRule:
			'L when the source describes a sequence, rollout, migration process, trial steps, or timeline with 3-4 ordered actions.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'number', col: 2, row: 5, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'small-body', col: 3, row: 5, colSpan: 3, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 2, row: 7, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'small-body', col: 3, row: 7, colSpan: 3, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 2, row: 9, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'small-body', col: 3, row: 9, colSpan: 3, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 2, row: 11, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'small-body', col: 3, row: 11, colSpan: 3, rowSpan: 2, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Thirty-day trial sequence</section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 5;"><strong>01</strong><span>Start</span></section>
<section class="b-small" data-span="3" data-rowspan="2" style="grid-column: 3 / -1; grid-row: 5;"><p>Pick one client site and provide credentials for migration.</p></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 7;"><strong>02</strong><span>Migrate</span></section>
<section class="b-small" data-span="3" data-rowspan="2" style="grid-column: 3 / -1; grid-row: 7;"><p>The white-glove team moves the site and validates it.</p></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 9;"><strong>03</strong><span>Measure</span></section>
<section class="b-small" data-span="3" data-rowspan="2" style="grid-column: 3 / -1; grid-row: 9;"><p>Watch response time, support speed, customer satisfaction.</p></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 11;"><strong>04</strong><span>Decide</span></section>
<section class="b-small" data-span="3" data-rowspan="2" style="grid-column: 3 / -1; grid-row: 11;"><p>Use the trial results to decide whether to migrate more sites.</p></section>`,
	},
	{
		id: 'M',
		label: 'M · Evidence panel',
		description: 'Hero stat, explanatory body, and three supporting numbers.',
		promptTitle: 'Evidence panel (hero stat + supporting numbers)',
		pickingRule:
			'M when the source has one hero metric with 2-3 supporting figures that together make an evidence cluster.',
		blocks: [
			{ type: 'stat', col: 2, row: 1, colSpan: 2, rowSpan: 4, align: 'bottom' },
			{ type: 'headline', col: 4, row: 1, colSpan: 2, rowSpan: 2, align: 'bottom', level: 3 },
			{ type: 'small-body', col: 4, row: 4, colSpan: 2, rowSpan: 4, align: 'top' },
			{ type: 'number', col: 2, row: 10, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 3, row: 10, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 4, row: 10, colSpan: 1, rowSpan: 2, align: 'top' },
		],
		promptExample: `<aside class="b-stat" data-span="2" data-rowspan="4" data-align="bottom" style="grid-column: 2 / span 2;">
  <strong>98.5%</strong><span>four-week customer satisfaction score</span>
</aside>
<section class="b-headline" data-level="3" data-span="2" data-rowspan="2" style="grid-column: 4 / span 2;">The proof point to verify</section>
<section class="b-small" data-span="2" data-rowspan="4" style="grid-column: 4 / span 2; grid-row: 4 / span 4;">
  <p>Use one hero metric and a few supporting figures when the source gives a compact evidence cluster.</p>
</section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 10;"><strong>2:09</strong><span>chat response</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 3; grid-row: 10;"><strong>5.2ms</strong><span>static response</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 4; grid-row: 10;"><strong>$239</strong><span>security value</span></section>`,
	},
	{
		id: 'N',
		label: 'N · Proof plate',
		description: 'Image-led proof page with a number row and compact body copy.',
		promptTitle: 'Proof plate (image + numbers + body)',
		pickingRule:
			'N when an uploaded image should be paired with a metric band and compact proof copy. Use at most one Pattern N per document.',
		usesImages: true,
		maxPerDocument: 1,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 4, rowSpan: 4 },
			{ type: 'number', col: 2, row: 6, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 3, row: 6, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 4, row: 6, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'number', col: 5, row: 6, colSpan: 1, rowSpan: 2, align: 'top' },
			{ type: 'body', col: 2, row: 8, colSpan: 4, rowSpan: 5, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="4" data-rowspan="4" style="grid-column: 2 / -1;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 2; grid-row: 6;"><strong>98.5%</strong><span>CSAT</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 3; grid-row: 6;"><strong>2:09</strong><span>chat response</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 4; grid-row: 6;"><strong>5.2ms</strong><span>static response</span></section>
<section class="b-number" data-span="1" data-rowspan="2" style="grid-column: 5; grid-row: 6;"><strong>$239</strong><span>security value</span></section>
<section class="b-section" data-span="4" data-rowspan="5" style="grid-column: 2 / -1; grid-row: 8 / -1;">
  <p>Compact proof copy below a cinematic image and metric band.</p>
</section>`,
	},
	{
		id: 'O',
		label: 'O · Display divider',
		description:
			'Rare type-led divider: large display phrase, short supporting note, generous negative space.',
		promptTitle: 'Display divider (rare type-led moment)',
		pickingRule:
			'O when the source has a named moment, manifesto line, section break, or major transition that deserves one rare display-register body page. Use at most one Pattern O per document, and only when the phrase comes from the source.',
		maxPerDocument: 1,
		blocks: [
			{ type: 'display', col: 2, row: 2, colSpan: 4, rowSpan: 4, align: 'bottom' },
			{ type: 'small-body', col: 2, row: 8, colSpan: 3, rowSpan: 3, align: 'top' },
		],
		promptExample: `<section class="b-display" data-span="4" data-rowspan="4" data-align="bottom" style="grid-column: 2 / -1; grid-row: 2 / span 4;">The practical first step</section>
<section class="b-small" data-span="3" data-rowspan="3" style="grid-column: 2 / span 3; grid-row: 8 / span 3;">
  <p>Use this page only for a source-authored transition or named idea that benefits from a deliberate pause.</p>
</section>`,
	},
	{
		id: 'P',
		label: 'P · Dense brief',
		description:
			'Compact briefing page: anchor headline, fact sheet, body explanation, and source note.',
		promptTitle: 'Dense brief (headline + facts + compact body)',
		pickingRule:
			'P when a section combines label-value metadata with a short explanatory paragraph, such as partner profiles, project scopes, decision briefs, or account summaries.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'facts', col: 2, row: 4, colSpan: 2, rowSpan: 6, align: 'top' },
			{ type: 'body', col: 4, row: 4, colSpan: 2, rowSpan: 6, align: 'top' },
			{ type: 'small-body', col: 2, row: 11, colSpan: 4, rowSpan: 2, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Partner profile</section>
<dl class="b-facts" data-span="2" data-rowspan="6" style="grid-column: 2 / span 2; grid-row: 4 / span 6;">
  <dt>Partner</dt><dd>Northstar Digital</dd>
  <dt>Industry</dt><dd>Healthcare</dd>
  <dt>Need</dt><dd>Secure WordPress migration</dd>
</dl>
<section class="b-section" data-span="2" data-rowspan="6" style="grid-column: 4 / span 2; grid-row: 4 / span 6;">
  <p>Use the body slot for the brief explanation that surrounds the label-value facts.</p>
</section>
<section class="b-small" data-span="4" data-rowspan="2" style="grid-column: 2 / -1; grid-row: 11 / span 2;">
  <p>Use the note for a source, caveat, decision criterion, or next step from the brief.</p>
</section>`,
	},
	{
		id: 'Q',
		label: 'Q · Two-column comparison',
		description: 'Two mirrored text columns with h3 anchors and compact body copy.',
		promptTitle: 'Two-column comparison (paired subheads + body)',
		pickingRule:
			'Q when the source compares two options, audiences, phases, risks, or positions in prose.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'headline', col: 2, row: 4, colSpan: 2, rowSpan: 2, align: 'bottom', level: 3 },
			{ type: 'body', col: 2, row: 6, colSpan: 2, rowSpan: 6, align: 'top' },
			{ type: 'headline', col: 4, row: 4, colSpan: 2, rowSpan: 2, align: 'bottom', level: 3 },
			{ type: 'body', col: 4, row: 6, colSpan: 2, rowSpan: 6, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Two paths to compare</section>
<section class="b-headline" data-level="3" data-span="2" data-rowspan="2" style="grid-column: 2 / span 2; grid-row: 4 / span 2;">Path one</section>
<section class="b-section" data-span="2" data-rowspan="6" style="grid-column: 2 / span 2; grid-row: 6 / span 6;">
  <p>Use this column for the source facts about the first option, audience, phase, or risk.</p>
</section>
<section class="b-headline" data-level="3" data-span="2" data-rowspan="2" style="grid-column: 4 / span 2; grid-row: 4 / span 2;">Path two</section>
<section class="b-section" data-span="2" data-rowspan="6" style="grid-column: 4 / span 2; grid-row: 6 / span 6;">
  <p>Use this column for the source facts about the paired option, audience, phase, or risk.</p>
</section>`,
	},
	{
		id: 'R',
		label: 'R · Quote + number',
		description: 'Large quote on the left, hero stat and compact explanation on the right.',
		promptTitle: 'Quote plus number (pull quote + hero metric + body)',
		pickingRule:
			'R when one quotable source sentence and one important metric belong together. Use at most one Pattern R per document and never invent quote or metric text.',
		maxPerDocument: 1,
		blocks: [
			{ type: 'quote', col: 2, row: 1, colSpan: 2, rowSpan: 8, align: 'top' },
			{ type: 'stat', col: 4, row: 2, colSpan: 2, rowSpan: 4, align: 'bottom' },
			{ type: 'body', col: 4, row: 7, colSpan: 2, rowSpan: 5, align: 'top' },
		],
		promptExample: `<figure class="b-quote" data-span="2" data-rowspan="8" data-align="top" style="grid-column: 2 / span 2; grid-row: 1 / span 8;">
  <blockquote>Use the exact quotable sentence from the source.</blockquote>
</figure>
<aside class="b-stat" data-span="2" data-rowspan="4" data-align="bottom" style="grid-column: 4 / span 2; grid-row: 2 / span 4;">
  <strong>43%</strong><span>source-backed metric label</span>
</aside>
<section class="b-section" data-span="2" data-rowspan="5" style="grid-column: 4 / span 2; grid-row: 7 / span 5;">
  <p>Explain why the quote and metric matter using only surrounding source facts.</p>
</section>`,
	},
	{
		id: 'S',
		label: 'S · Callout led',
		description:
			'Headline and hero stat share the top half, with short framing copy and body below.',
		promptTitle: 'Callout led (headline + hero stat + supporting body)',
		pickingRule:
			'S when a section has one strong headline idea and one source-backed figure, but does not need the heavier two-tone treatment of Pattern H.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 2, rowSpan: 4, align: 'bottom' },
			{ type: 'stat', col: 4, row: 1, colSpan: 2, rowSpan: 4, align: 'bottom' },
			{ type: 'small-body', col: 2, row: 6, colSpan: 4, rowSpan: 2, align: 'top' },
			{ type: 'body', col: 2, row: 9, colSpan: 4, rowSpan: 4, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="2" data-rowspan="4" data-align="bottom" style="grid-column: 2 / span 2; grid-row: 1 / span 4;">The proof point to verify</section>
<aside class="b-stat" data-span="2" data-rowspan="4" data-align="bottom" style="grid-column: 4 / span 2; grid-row: 1 / span 4;">
  <strong>98.5%</strong><span>four-week customer satisfaction score</span>
</aside>
<section class="b-small" data-span="4" data-rowspan="2" style="grid-column: 2 / -1; grid-row: 6 / span 2;">
  <p>Use this line for the short source sentence that frames the figure.</p>
</section>
<section class="b-section" data-span="4" data-rowspan="4" style="grid-column: 2 / -1; grid-row: 9 / -1;">
  <p>Use the body copy for the supporting facts, caveats, and recommendation.</p>
</section>`,
	},
	{
		id: 'T',
		label: 'T · Profile sheet',
		description: 'Fact-sheet dominant page with a short conclusion or action at the bottom.',
		promptTitle: 'Profile sheet (headline + dominant facts + conclusion)',
		pickingRule:
			'T when the source is mostly structured label-value information and needs a more spacious profile page than Pattern P.',
		blocks: [
			{ type: 'headline', col: 2, row: 1, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'facts', col: 2, row: 4, colSpan: 4, rowSpan: 6, align: 'top' },
			{ type: 'small-body', col: 2, row: 11, colSpan: 4, rowSpan: 2, align: 'top' },
		],
		promptExample: `<section class="b-headline" data-span="4" data-rowspan="2" style="grid-column: 2 / -1;">Account snapshot</section>
<dl class="b-facts" data-span="4" data-rowspan="6" style="grid-column: 2 / -1; grid-row: 4 / span 6;">
  <dt>Client</dt><dd>Example client from the source</dd>
  <dt>Market</dt><dd>Source-backed market or audience</dd>
  <dt>Priority</dt><dd>Source-backed priority</dd>
  <dt>Next step</dt><dd>Source-backed next step</dd>
</dl>
<section class="b-small" data-span="4" data-rowspan="2" style="grid-column: 2 / -1; grid-row: 11 / span 2;">
  <p>Use this line for the conclusion, caveat, or call to action attached to the profile.</p>
</section>`,
	},
	{
		id: 'U',
		label: 'U · Image grid',
		description: 'Four-image 2×2 grid (rows 1-8) · body (rows 9-12).',
		promptTitle: 'Image grid (four images in a 2×2 grid + body)',
		pickingRule:
			'U when four user images belong together as a gallery, montage, or set — product shots, scenes, team photos, or two before/after pairs. Needs exactly four images; do not use it with fewer.',
		usesImages: true,
		maxPerDocument: 1,
		mirrorable: false,
		blocks: [
			{ type: 'image', col: 2, row: 1, colSpan: 2, rowSpan: 4 },
			{ type: 'image', col: 4, row: 1, colSpan: 2, rowSpan: 4 },
			{ type: 'image', col: 2, row: 5, colSpan: 2, rowSpan: 4 },
			{ type: 'image', col: 4, row: 5, colSpan: 2, rowSpan: 4 },
			{ type: 'body', col: 2, row: 9, colSpan: 4, rowSpan: 4, align: 'top' },
		],
		promptExample: `<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 2 / span 2; grid-row: 1 / span 4;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 4 / span 2; grid-row: 1 / span 4;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 2 / span 2; grid-row: 5 / span 4;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<figure class="b-image" data-span="2" data-rowspan="4" style="grid-column: 4 / span 2; grid-row: 5 / span 4;">
  <img src="{{IMAGE_N_URL}}" />
</figure>
<section class="b-section" data-span="4" data-rowspan="4" style="grid-column: 2 / -1; grid-row: 9 / -1;">
  <p>Paragraph that frames the image set.</p>
</section>`,
	},
];

function mirroredCol( col: number, colSpan: number ): number {
	return 7 - col - colSpan;
}

function mirrorBlock( block: BodyBlock ): BodyBlock {
	return {
		...block,
		col: mirroredCol( block.col, block.colSpan ),
		children: block.children?.map( mirrorBlock ),
	};
}

function mirrorGridColumnValue( value: string ): string {
	const trimmed = value.trim();
	const spanMatch = trimmed.match( /^(\d+)\s*\/\s*span\s*(\d+)$/ );
	if ( spanMatch ) {
		const col = Number( spanMatch[ 1 ] );
		const span = Number( spanMatch[ 2 ] );
		return `${ mirroredCol( col, span ) } / span ${ span }`;
	}
	const endMatch = trimmed.match( /^(\d+)\s*\/\s*-1$/ );
	if ( endMatch ) {
		const col = Number( endMatch[ 1 ] );
		const span = 6 - col;
		return `${ mirroredCol( col, span ) } / span ${ span }`;
	}
	const singleMatch = trimmed.match( /^(\d+)$/ );
	if ( singleMatch ) {
		const col = Number( singleMatch[ 1 ] );
		return `${ mirroredCol( col, 1 ) }`;
	}
	return value;
}

function mirrorPromptExample( html: string ): string {
	return html.replace(
		/grid-column:\s*([^;"]+)(;?)/g,
		( _match, value: string, suffix: string ) =>
			`grid-column: ${ mirrorGridColumnValue( value ) }${ suffix }`
	);
}

function mirrorLayout( layout: BodyLayout ): BodyLayout {
	const id = `${ layout.id }-R`;
	return {
		...layout,
		id,
		label: `${ layout.id }-R · ${ layout.label.replace( /^[^·]+·\s*/, '' ) }`,
		description: `Right-rail mirror: ${ layout.description }`,
		blocks: layout.blocks.map( mirrorBlock ),
		promptTitle: `${ layout.promptTitle } [right rail mirror]`,
		promptExample: mirrorPromptExample( layout.promptExample ),
		pickingRule: `${ id } is the right-rail mirror of Pattern ${ layout.id }; use it under the same conditions when the document needs the empty rail or side notes on the right.`,
		rail: 'right',
		mirrorable: false,
		mirrorOf: layout.id,
	};
}

function expandMirroredLayouts( layouts: BodyLayout[] ): BodyLayout[] {
	return layouts.flatMap( ( layout ) => {
		const base = {
			...layout,
			rail: layout.rail ?? ( 'left' as const ),
			mirrorable: layout.mirrorable ?? true,
		};
		return base.mirrorable ? [ base, mirrorLayout( layout ) ] : [ base ];
	} );
}

export const BODY_LAYOUTS: BodyLayout[] = expandMirroredLayouts( BODY_LAYOUT_BASES );

export const BODY_LAYOUT_IDS = BODY_LAYOUTS.map( ( layout ) => layout.id ).join( ', ' );
export const BODY_IMAGE_LAYOUT_IDS = BODY_LAYOUTS.filter( ( layout ) => layout.usesImages )
	.map( ( layout ) => layout.id )
	.join( ', ' );

export function formatBodyLayoutExamples(): string {
	return BODY_LAYOUTS.map(
		( layout ) => `PATTERN ${ layout.id } — ${ layout.promptTitle }:\n${ layout.promptExample }`
	).join( '\n\n' );
}

export function formatBodyLayoutPickingRules(): string {
	return BODY_LAYOUTS.map( ( layout ) => `- ${ layout.pickingRule }` ).join( '\n' );
}
