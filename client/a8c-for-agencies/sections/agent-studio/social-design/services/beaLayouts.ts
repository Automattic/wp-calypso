import type { OutputSize } from '../types';

export type BeaSizeKey = 'cover' | 'square' | 'email' | 'story';
export type BeaTheme = 'light' | 'brand' | 'ink' | 'soft';
export type BeaBlockType =
	| 'headline'
	| 'eyebrow'
	| 'dek'
	| 'image'
	| 'logo'
	| 'cta'
	| 'stat'
	| 'quote'
	| 'rule'
	| 'shape'
	| 'label'
	| 'container';

export type BeaSlotSpec = {
	label: string;
	maxChars: number;
	required?: boolean;
};

export type BeaBlockSpec = {
	id: string;
	type: BeaBlockType;
	slot?: string;
	col: number;
	row: number;
	colSpan: number;
	rowSpan: number;
	zIndex?: number;
	align?: 'start' | 'center' | 'end';
	justify?: 'start' | 'center' | 'end';
	fill?: 'none' | 'soft' | 'brand' | 'ink' | 'accent';
	bleed?: { t?: boolean; r?: boolean; b?: boolean; l?: boolean };
	radius?: number;
	direction?: 'v' | 'h';
	padding?: number;
	gap?: number;
	contentJustify?: 'start' | 'center' | 'end' | 'space-between';
	contentAlign?: 'start' | 'center' | 'end' | 'stretch';
	children?: BeaBlockSpec[];
	useDisplay?: boolean;
	overlay?: boolean;
};

export type BeaLayoutSpec = {
	gap?: number;
	blocks: BeaBlockSpec[];
};

export type BeaFamilyEmphasis = 'type' | 'image' | 'quote' | 'stat' | 'collage';
export type BeaTitleLengthBucket = 'compact' | 'standard' | 'long' | 'editorial';

export type BeaArtDirection = {
	emphasis: BeaFamilyEmphasis;
	thesis: string;
	minImages?: number;
	preferredGoals?: Array<
		'drive-read' | 'announce' | 'promote-offer' | 'event' | 'case-study' | 'sales-enable'
	>;
	preferredThemes?: BeaTheme[];
};

export type BeaLayoutFamily = {
	id: string;
	label: string;
	description: string;
	contentShape: {
		requiresImage?: boolean;
		supportsQuote?: boolean;
		supportsStat?: boolean;
		headlineChars: [ number, number ];
		titleBuckets?: BeaTitleLengthBucket[];
		density: 'low' | 'medium' | 'high';
		mood: Array< 'editorial' | 'bold' | 'proof' | 'announcement' | 'event' >;
	};
	artDirection?: BeaArtDirection;
	slots: Record< string, BeaSlotSpec >;
	sizes: Record< BeaSizeKey, BeaLayoutSpec >;
};

export const BEA_GRID = {
	cols: 5,
	rows: 12,
};

export const BEA_DEFAULT_GAP = 16;

export const BEA_SIZES: Record< BeaSizeKey, OutputSize > = {
	cover: { label: 'Cover', width: 1200, height: 630 },
	square: { label: 'Square', width: 1080, height: 1080 },
	email: { label: 'Email', width: 600, height: 300 },
	story: { label: 'Story', width: 1080, height: 1920 },
};

const baseSlots = {
	eyebrow: { label: 'Eyebrow', maxChars: 24 },
	headline: { label: 'Headline', maxChars: 90, required: true },
	dek: { label: 'Dek', maxChars: 140 },
	cta: { label: 'CTA', maxChars: 22 },
};

const blankFamily: BeaLayoutFamily = {
	id: 'blank',
	label: 'Blank canvas',
	description: 'An empty family for designing a campaign layout from scratch.',
	contentShape: {
		headlineChars: [ 0, 90 ],
		density: 'low',
		mood: [ 'editorial' ],
	},
	slots: baseSlots,
	sizes: {
		cover: { blocks: [] },
		square: { blocks: [] },
		email: { blocks: [] },
		story: { blocks: [] },
	},
};

const squareFullImageLogoBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 5,
		rowSpan: 12,
		bleed: { t: true, r: true, b: true, l: true },
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
		align: 'end',
		overlay: true,
	},
];

const horizontalFullImageLogoBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 5,
		rowSpan: 12,
		bleed: { t: true, r: true, b: true, l: true },
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
		align: 'end',
		overlay: true,
	},
];

const storyFullImageLogoBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 5,
		rowSpan: 12,
		bleed: { t: true, r: true, b: true, l: true },
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
		align: 'end',
		overlay: true,
	},
];

const squareFullImageLogoCard: BeaLayoutFamily = {
	id: 'square-full-image-logo',
	label: 'Square full image logo',
	description: 'Square full-frame image with logo over a soft contrast shim.',
	contentShape: {
		requiresImage: true,
		headlineChars: [ 0, 120 ],
		titleBuckets: [ 'compact', 'standard', 'long', 'editorial' ],
		density: 'low',
		mood: [ 'editorial', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'image',
		thesis: 'A square image-first brand card with logo over a subtle gradient blur.',
		minImages: 1,
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light' ],
	},
	slots: baseSlots,
	sizes: {
		cover: { blocks: [] },
		square: { gap: 0, blocks: squareFullImageLogoBlocks },
		email: { blocks: [] },
		story: { blocks: [] },
	},
};

const horizontalFullImageLogoCard: BeaLayoutFamily = {
	...squareFullImageLogoCard,
	id: 'horizontal-full-image-logo',
	label: 'Horizontal full image logo',
	description: 'Horizontal full-frame image with logo over a soft contrast shim.',
	artDirection: {
		emphasis: 'image',
		thesis: 'A horizontal image-first brand card with logo over a subtle gradient blur.',
		minImages: 1,
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light' ],
	},
	sizes: {
		cover: { gap: 0, blocks: horizontalFullImageLogoBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalFullImageLogoBlocks },
		story: { blocks: [] },
	},
};

const storyFullImageLogoCard: BeaLayoutFamily = {
	...squareFullImageLogoCard,
	id: 'story-full-image-logo',
	label: 'Story full image logo',
	description: 'Story full-frame image with logo over a soft contrast shim.',
	artDirection: {
		emphasis: 'image',
		thesis: 'A story image-first brand card with logo over a subtle gradient blur.',
		minImages: 1,
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light' ],
	},
	sizes: {
		cover: { blocks: [] },
		square: { blocks: [] },
		email: { blocks: [] },
		story: { gap: 0, blocks: storyFullImageLogoBlocks },
	},
};

const horizontalImageTitleBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 3,
		rowSpan: 12,
		radius: 20,
	},
	{
		id: 'headline',
		type: 'headline',
		slot: 'headline',
		col: 4,
		row: 1,
		colSpan: 2,
		rowSpan: 8,
		align: 'start',
		useDisplay: true,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 4,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
];

const horizontalImageLogoBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 5,
		rowSpan: 10,
		radius: 20,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
];

const horizontalBleedImageLogoBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 5,
		rowSpan: 10,
		bleed: { t: true, l: true, r: true },
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
];

const horizontalBleedImageTitleBlocks: BeaBlockSpec[] = [
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 1,
		row: 1,
		colSpan: 3,
		rowSpan: 12,
		bleed: { t: true, b: true, l: true },
	},
	{
		id: 'headline',
		type: 'headline',
		slot: 'headline',
		col: 4,
		row: 1,
		colSpan: 2,
		rowSpan: 8,
		align: 'start',
		useDisplay: true,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 4,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
];

const horizontalTextFirstImageBlocks: BeaBlockSpec[] = [
	{
		id: 'headline',
		type: 'headline',
		slot: 'headline',
		col: 1,
		row: 1,
		colSpan: 2,
		rowSpan: 8,
		align: 'start',
		useDisplay: true,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 3,
		row: 1,
		colSpan: 3,
		rowSpan: 12,
		radius: 20,
	},
];

const horizontalBleedTextFirstImageBlocks: BeaBlockSpec[] = [
	{
		id: 'headline',
		type: 'headline',
		slot: 'headline',
		col: 1,
		row: 1,
		colSpan: 2,
		rowSpan: 8,
		align: 'start',
		useDisplay: true,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
	{
		id: 'photo',
		type: 'image',
		slot: 'hero',
		col: 3,
		row: 1,
		colSpan: 3,
		rowSpan: 12,
		bleed: { t: true, r: true, b: true },
	},
];

const horizontalNoImageBlocks: BeaBlockSpec[] = [
	{
		id: 'headline',
		type: 'headline',
		slot: 'headline',
		col: 1,
		row: 1,
		colSpan: 4,
		rowSpan: 8,
		align: 'start',
		useDisplay: true,
	},
	{
		id: 'logo',
		type: 'logo',
		col: 1,
		row: 12,
		colSpan: 2,
		rowSpan: 1,
	},
];

const horizontalImageTitleCard: BeaLayoutFamily = {
	id: 'horizontal-image-title',
	label: 'Horizontal image title',
	description: 'Horizontal card with image, faithful title, and logo.',
	contentShape: {
		requiresImage: true,
		headlineChars: [ 8, 90 ],
		titleBuckets: [ 'compact', 'standard', 'long' ],
		density: 'low',
		mood: [ 'editorial', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'image',
		thesis: 'A horizontal image-title-logo card for cover and email placements.',
		minImages: 1,
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light', 'brand', 'soft' ],
	},
	slots: baseSlots,
	sizes: {
		cover: { gap: 0, blocks: horizontalImageTitleBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalImageTitleBlocks },
		story: { blocks: [] },
	},
};

const horizontalBleedImageTitleCard: BeaLayoutFamily = {
	...horizontalImageTitleCard,
	id: 'horizontal-image-title-bleed',
	label: 'Horizontal bleed image title',
	description: 'Horizontal card with the image bleeding to the top, left, and bottom edges.',
	sizes: {
		cover: { gap: 0, blocks: horizontalBleedImageTitleBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalBleedImageTitleBlocks },
		story: { blocks: [] },
	},
};

const horizontalTextFirstImageCard: BeaLayoutFamily = {
	...horizontalImageTitleCard,
	id: 'horizontal-text-first-image',
	label: 'Horizontal text first image',
	description: 'Horizontal mirrored card with title and logo left, image right.',
	sizes: {
		cover: { gap: 0, blocks: horizontalTextFirstImageBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalTextFirstImageBlocks },
		story: { blocks: [] },
	},
};

const horizontalBleedTextFirstImageCard: BeaLayoutFamily = {
	...horizontalImageTitleCard,
	id: 'horizontal-text-first-image-bleed',
	label: 'Horizontal text first bleed image',
	description:
		'Horizontal mirrored card with title left and image bleeding top, right, and bottom.',
	sizes: {
		cover: { gap: 0, blocks: horizontalBleedTextFirstImageBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalBleedTextFirstImageBlocks },
		story: { blocks: [] },
	},
};

const horizontalNoImageCard: BeaLayoutFamily = {
	...horizontalImageTitleCard,
	id: 'horizontal-no-image',
	label: 'Horizontal no image',
	description: 'Horizontal type-only card with title and logo aligned left.',
	contentShape: {
		headlineChars: [ 8, 90 ],
		titleBuckets: [ 'compact', 'standard', 'long' ],
		density: 'low',
		mood: [ 'editorial', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'type',
		thesis: 'A horizontal no-image fallback with title and logo aligned on the left.',
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light', 'brand', 'soft' ],
	},
	sizes: {
		cover: { gap: 0, blocks: horizontalNoImageBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalNoImageBlocks },
		story: { blocks: [] },
	},
};

const horizontalImageLogoCard: BeaLayoutFamily = {
	...horizontalImageTitleCard,
	id: 'horizontal-image-logo',
	label: 'Horizontal image logo',
	description: 'Horizontal card with a dominant image and logo only.',
	contentShape: {
		requiresImage: true,
		headlineChars: [ 0, 120 ],
		titleBuckets: [ 'compact', 'standard', 'long', 'editorial' ],
		density: 'low',
		mood: [ 'editorial', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'image',
		thesis: 'A titleless horizontal image-logo card for stronger image-led outputs.',
		minImages: 1,
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light', 'brand', 'soft' ],
	},
	sizes: {
		cover: { gap: 0, blocks: horizontalImageLogoBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalImageLogoBlocks },
		story: { blocks: [] },
	},
};

const horizontalBleedImageLogoCard: BeaLayoutFamily = {
	...horizontalImageLogoCard,
	id: 'horizontal-image-logo-bleed',
	label: 'Horizontal bleed image logo',
	description: 'Horizontal image-logo card with image bleeding left, top, and right.',
	sizes: {
		cover: { gap: 0, blocks: horizontalBleedImageLogoBlocks },
		square: { blocks: [] },
		email: { gap: 0, blocks: horizontalBleedImageLogoBlocks },
		story: { blocks: [] },
	},
};

const storyFeedCard: BeaLayoutFamily = {
	id: 'story-feed-card',
	label: 'Inset image',
	description: 'One locked story format: color field, rounded image, faithful title, and logo.',
	contentShape: {
		headlineChars: [ 8, 90 ],
		titleBuckets: [ 'compact', 'standard', 'long' ],
		density: 'low',
		mood: [ 'editorial', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'image',
		thesis: 'A single social-story card where the color is the variant.',
		preferredGoals: [ 'drive-read', 'announce', 'case-study', 'event', 'sales-enable' ],
		preferredThemes: [ 'light', 'brand', 'soft' ],
	},
	slots: baseSlots,
	sizes: {
		cover: { blocks: [] },
		square: {
			gap: 0,
			blocks: [
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 1,
					colSpan: 5,
					rowSpan: 8,
					align: 'start',
					useDisplay: true,
				},
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 12,
					colSpan: 2,
					rowSpan: 1,
				},
			],
		},
		email: { blocks: [] },
		story: {
			gap: 0,
			blocks: [
				{
					id: 'photo',
					type: 'image',
					slot: 'hero',
					col: 1,
					row: 1,
					colSpan: 5,
					rowSpan: 4,
					radius: 34,
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 5,
					colSpan: 5,
					rowSpan: 4,
					align: 'start',
					useDisplay: true,
				},
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 12,
					colSpan: 2,
					rowSpan: 1,
				},
			],
		},
	},
};

const storyBleedImageCard: BeaLayoutFamily = {
	...storyFeedCard,
	id: 'story-feed-card-bleed',
	label: 'Bleed image',
	description: 'Story format with the image bleeding to the top, left, and right edges.',
	sizes: {
		cover: { blocks: [] },
		square: { blocks: [] },
		email: { blocks: [] },
		story: {
			gap: 0,
			blocks: [
				{
					id: 'photo',
					type: 'image',
					slot: 'hero',
					col: 1,
					row: 1,
					colSpan: 5,
					rowSpan: 4,
					bleed: { t: true, l: true, r: true },
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 5,
					colSpan: 5,
					rowSpan: 4,
					align: 'start',
					useDisplay: true,
				},
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 12,
					colSpan: 2,
					rowSpan: 1,
				},
			],
		},
	},
};

const storyBottomImageCard: BeaLayoutFamily = {
	...storyFeedCard,
	id: 'story-feed-card-bottom',
	label: 'Bottom image',
	description: 'Story format with logo and title above, image anchored at the bottom.',
	sizes: {
		cover: { blocks: [] },
		square: { blocks: [] },
		email: { blocks: [] },
		story: {
			gap: 0,
			blocks: [
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 1,
					colSpan: 2,
					rowSpan: 1,
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 2,
					colSpan: 5,
					rowSpan: 6,
					align: 'start',
					useDisplay: true,
				},
				{
					id: 'photo',
					type: 'image',
					slot: 'hero',
					col: 1,
					row: 9,
					colSpan: 5,
					rowSpan: 4,
					radius: 34,
				},
			],
		},
	},
};

const storyBottomBleedImageCard: BeaLayoutFamily = {
	...storyFeedCard,
	id: 'story-feed-card-bottom-bleed',
	label: 'Bottom bleed image',
	description:
		'Story format with logo and title above, and an image bleeding left, right, and bottom.',
	sizes: {
		cover: { blocks: [] },
		square: {
			gap: 0,
			blocks: [
				{
					id: 'logo-wrap',
					type: 'container',
					col: 1,
					row: 1,
					colSpan: 2,
					rowSpan: 1,
					direction: 'v',
					contentAlign: 'start',
					children: [
						{
							id: 'logo',
							type: 'logo',
							col: 1,
							row: 1,
							colSpan: 1,
							rowSpan: 1,
						},
					],
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 4,
					colSpan: 5,
					rowSpan: 7,
					align: 'start',
					useDisplay: true,
				},
			],
		},
		email: { blocks: [] },
		story: {
			gap: 0,
			blocks: [
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 1,
					colSpan: 2,
					rowSpan: 1,
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 2,
					colSpan: 5,
					rowSpan: 6,
					align: 'start',
					useDisplay: true,
				},
				{
					id: 'photo',
					type: 'image',
					slot: 'hero',
					col: 1,
					row: 9,
					colSpan: 5,
					rowSpan: 4,
					bleed: { l: true, r: true, b: true },
				},
			],
		},
	},
};

const storyStatHeroCard: BeaLayoutFamily = {
	id: 'story-stat-hero',
	label: 'Stat hero',
	description:
		'Story format anchored by an oversized proof stat, a supporting line, and a faithful title.',
	contentShape: {
		headlineChars: [ 8, 90 ],
		titleBuckets: [ 'compact', 'standard', 'long' ],
		density: 'low',
		mood: [ 'proof', 'bold', 'announcement' ],
	},
	artDirection: {
		emphasis: 'stat',
		thesis: 'A story card where an oversized stat carries the proof and the title closes it.',
		preferredGoals: [ 'announce', 'case-study', 'sales-enable', 'promote-offer' ],
		preferredThemes: [ 'brand', 'light', 'ink' ],
	},
	slots: {
		...baseSlots,
		statValue: { label: 'Stat', maxChars: 14, required: true },
		statLabel: { label: 'Stat context', maxChars: 60 },
	},
	sizes: {
		cover: { blocks: [] },
		square: { blocks: [] },
		email: { blocks: [] },
		story: {
			gap: 0,
			blocks: [
				{
					id: 'logo',
					type: 'logo',
					col: 1,
					row: 1,
					colSpan: 2,
					rowSpan: 1,
				},
				{
					id: 'stat',
					type: 'stat',
					slot: 'statValue',
					col: 1,
					row: 2,
					colSpan: 5,
					rowSpan: 6,
					useDisplay: true,
				},
				{
					id: 'headline',
					type: 'headline',
					slot: 'headline',
					col: 1,
					row: 9,
					colSpan: 5,
					rowSpan: 4,
				},
			],
		},
	},
};

export const BEA_LAYOUT_FAMILIES: BeaLayoutFamily[] = [
	blankFamily,
	squareFullImageLogoCard,
	horizontalFullImageLogoCard,
	storyFullImageLogoCard,
	horizontalImageTitleCard,
	horizontalBleedImageTitleCard,
	horizontalTextFirstImageCard,
	horizontalBleedTextFirstImageCard,
	horizontalNoImageCard,
	horizontalImageLogoCard,
	horizontalBleedImageLogoCard,
	storyFeedCard,
	storyBleedImageCard,
	storyBottomImageCard,
	storyBottomBleedImageCard,
	storyStatHeroCard,
];

export function getBeaLayoutFamily( id: string ): BeaLayoutFamily | undefined {
	return BEA_LAYOUT_FAMILIES.find( ( family ) => family.id === id );
}
