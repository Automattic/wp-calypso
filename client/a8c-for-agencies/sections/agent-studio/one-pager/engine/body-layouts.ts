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
