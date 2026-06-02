import type { BrandPack } from './types';

const SYSTEM_STACK =
	"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const A4A_BLUE = '#3858E9';

export const DEFAULT_SOCIAL_BRAND_PACK: BrandPack = {
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
	designMdText: '',
};
