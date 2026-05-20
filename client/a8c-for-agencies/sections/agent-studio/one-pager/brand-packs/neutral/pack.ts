// Neutral pack — black ink on white surface, A4A blue as the single accent.
// A4A's primary blue (#3858E9) reads on both light and dark surfaces and is
// the brand color elsewhere in this section, so the engine's b-eyebrow,
// link underline, container brand fill and b-table header all pick it up.
//
// The pack ships without a Google or hosted font; the body and headline
// stacks fall back to Inter then a clean system stack. When user-authored
// packs land via BrandPackService, this stays as the v1 default.

import type { BrandPack } from '../../engine/types';

const SYSTEM_STACK =
	"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const A4A_BLUE = '#3858E9';

export const NEUTRAL_PACK: BrandPack = {
	slug: 'neutral',
	name: 'Neutral',
	tokens: {
		brandPrimary: A4A_BLUE,
		brandSecondary: '#1D35A6',
		textPrimary: '#101517',
		textSecondary: '#646970',
		textOnBrand: '#FFFFFF',
		surfacePrimary: '#FFFFFF',
		surfaceSecondary: '#F6F7F7',
		surfaceBrand: '#101517',
	},
	typography: {
		headlineWeight: 600,
		headlineCase: 'asis',
		headlineTracking: '-0.02em',
		headlineLineHeight: 1.1,
	},
	// Empty logo URLs render as a transparent stand-in. The cover composer
	// keeps the layout intact; the footer logo strip just renders blank.
	// When the section ships an A4A wordmark asset, point logoLightUrl /
	// logoDarkUrl at it here.
	logoLightUrl: '',
	logoLightFileName: '',
	fonts: [
		{
			role: 'h1',
			family: 'Inter',
			systemFamily: SYSTEM_STACK,
			weight: 600,
			case: 'as-typed',
			tracking: '-0.025em',
		},
		{
			role: 'h2',
			family: 'Inter',
			systemFamily: SYSTEM_STACK,
			weight: 600,
			case: 'as-typed',
			tracking: '-0.02em',
		},
		{
			role: 'h3',
			family: 'Inter',
			systemFamily: SYSTEM_STACK,
			weight: 600,
			case: 'as-typed',
			tracking: '-0.01em',
		},
		{
			role: 'eyebrow',
			family: 'Inter',
			systemFamily: SYSTEM_STACK,
			weight: 600,
			case: 'uppercase',
			tracking: '0.08em',
		},
		{
			role: 'body',
			family: 'Inter',
			systemFamily: SYSTEM_STACK,
			weight: 400,
			case: 'as-typed',
			tracking: '0',
		},
	],
};
