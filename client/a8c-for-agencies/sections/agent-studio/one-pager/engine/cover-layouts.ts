// Cover layouts — single source of truth for the cover composer. Both the
// LLM-driven preview and the export pipeline render every layout × every
// theme, so the user can pick a cover variant in the output detail UI.
// Ported verbatim from the prototype's coverLayouts.ts.

export type CoverBlockType =
	| 'display'
	| 'headline'
	| 'image'
	| 'logo'
	| 'blurb'
	| 'small-body'
	| 'spacer';

export interface CoverBlock {
	type: CoverBlockType;
	col: number;
	row: number;
	colSpan: number;
	rowSpan: number;
	align?: 'top' | 'bottom';
	level?: 1 | 2 | 3 | 4;
	size?: 'body' | 'small';
	bleed?: { t?: boolean; r?: boolean; b?: boolean; l?: boolean };
}

export interface CoverLayout {
	id: string;
	label: string;
	description: string;
	blocks: CoverBlock[];
}

export const COVER_LAYOUTS: CoverLayout[] = [
	{
		id: 'type-stack',
		label: 'Type stack',
		description:
			'No image. Pure typographic stack with generous negative space. Logo, then display, then blurb.',
		blocks: [
			{ type: 'logo', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
			{ type: 'display', col: 1, row: 3, colSpan: 5, rowSpan: 6, align: 'top' },
			{ type: 'blurb', col: 1, row: 10, colSpan: 4, rowSpan: 3, align: 'top' },
		],
	},
	{
		id: 'image-top',
		label: 'Image top',
		description:
			'Image rows 1-7 (bleeds top/left/right) · headline rows 8-9 · blurb rows 10-11 · logo bottom-left.',
		blocks: [
			{
				type: 'image',
				col: 1,
				row: 1,
				colSpan: 5,
				rowSpan: 7,
				bleed: { t: true, l: true, r: true },
			},
			{ type: 'display', col: 2, row: 8, colSpan: 4, rowSpan: 2, align: 'bottom' },
			{ type: 'blurb', col: 2, row: 10, colSpan: 4, rowSpan: 2, align: 'top' },
			{ type: 'logo', col: 2, row: 12, colSpan: 2, rowSpan: 1 },
		],
	},
	{
		id: 'image-bottom',
		label: 'Image bottom',
		description:
			'Logo top-left · headline rows 2-3 · blurb rows 4-5 · image rows 6-12 (bleeds left/right/bottom).',
		blocks: [
			{ type: 'logo', col: 2, row: 1, colSpan: 2, rowSpan: 1 },
			{ type: 'display', col: 2, row: 2, colSpan: 4, rowSpan: 2, align: 'top' },
			{ type: 'blurb', col: 2, row: 4, colSpan: 4, rowSpan: 2, align: 'top' },
			{
				type: 'image',
				col: 1,
				row: 6,
				colSpan: 5,
				rowSpan: 7,
				bleed: { l: true, r: true, b: true },
			},
		],
	},
	{
		id: 'vertical-split',
		label: 'Vertical split',
		description:
			'Image left 3 cols full-bleed top to bottom · logo, headline, blurb stack in the right 2 cols.',
		blocks: [
			{
				type: 'image',
				col: 1,
				row: 1,
				colSpan: 3,
				rowSpan: 12,
				bleed: { t: true, l: true, b: true },
			},
			{ type: 'logo', col: 4, row: 1, colSpan: 2, rowSpan: 1 },
			{ type: 'display', col: 4, row: 3, colSpan: 2, rowSpan: 5, align: 'top' },
			{ type: 'blurb', col: 4, row: 9, colSpan: 2, rowSpan: 4, align: 'top' },
		],
	},
];
