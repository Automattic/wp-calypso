// Engine-level types for the one-pager pipeline. Mirrors the prototype's
// types.ts but scoped to what the engine actually needs.

export type FontRole = 'display' | 'h1' | 'h2' | 'h3' | 'eyebrow' | 'body' | 'mono';

export type FontCase = 'as-typed' | 'uppercase' | 'lowercase' | 'title-case' | 'sentence-case';

export interface BrandTokens {
	brandPrimary: string;
	brandSecondary: string;
	textPrimary: string;
	textSecondary: string;
	textOnBrand: string;
	surfacePrimary: string;
	surfaceSecondary: string;
	surfaceBrand: string;
}

export interface BrandTypography {
	headlineWeight: number;
	headlineCase: 'uppercase' | 'asis' | 'titlecase';
	headlineTracking: string;
	headlineLineHeight: number;
}

export interface BrandPackFont {
	role: FontRole;
	family: string;
	googleFamily?: string;
	systemFamily?: string;
	weight?: number;
	case?: FontCase;
	tracking?: string;
}

export interface BrandPack {
	slug: string;
	name: string;
	tokens: BrandTokens;
	typography: BrandTypography;
	logoLightUrl: string;
	logoLightFileName: string;
	logoDarkUrl?: string;
	logoDarkFileName?: string;
	fonts: BrandPackFont[];
}

export interface ElaImage {
	dataUrl: string;
	fileName: string;
}

export const PAGE_THEMES = [ 'light', 'ink', 'brand', 'accent' ] as const;
export type ElaPageTheme = ( typeof PAGE_THEMES )[ number ];

export interface ElaCover {
	id: string;
	layoutId: string;
	theme: ElaPageTheme;
	html: string;
}

export interface ElaUsage {
	inputTokens: number;
	outputTokens: number;
	usd: number;
	model: string;
	durationMs: number;
}

export interface ElaResult {
	covers: ElaCover[];
	bodyPages: string[];
	notes: string;
	usage: ElaUsage;
}

export interface OnePagerInputSnapshot {
	text: string;
	title: string;
	blurb: string;
	images: ElaImage[];
	brandPackSlug: string;
}

export interface OnePagerOutputData {
	covers: ElaCover[];
	bodyPages: string[];
	selectedCoverIdx: number;
	notes: string;
	brandPackSlug: string;
	input: OnePagerInputSnapshot;
	usage: ElaUsage;
}

export const ELA_PAGE_WIDTH = 816;
export const ELA_PAGE_HEIGHT = 1056;

export const TITLE_MAX = 65;
export const BLURB_MAX = 200;

export const ELA_OUTPUT_VERSION = 'v1';
