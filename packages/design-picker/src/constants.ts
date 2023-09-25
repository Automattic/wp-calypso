import type { Design, Font } from './types';

export const FONT_TITLES: Partial< Record< Font, string > > = {
	'Playfair Display': 'Playfair',
};

export const DEFAULT_GLOBAL_STYLES_VARIATION_SLUG = 'default';
export const SHOW_ALL_SLUG = 'CLIENT_ONLY_SHOW_ALL_SLUG';

/**
 * Pairings of fontFamilies
 *
 * To get the name of the font for display, use `getFontTitle( fontName )`
 * (defined in the utils/ folder).
 */
export const FONT_PAIRINGS = [
	{
		headings: 'Cabin',
		base: 'Raleway',
	},
	{
		headings: 'Chivo',
		base: 'Open Sans',
	},
	{
		headings: 'Playfair Display',
		base: 'Fira Sans',
	},
	{
		headings: 'Arvo',
		base: 'Montserrat',
	},
	{
		headings: 'Space Mono',
		base: 'Roboto',
	},
] as const;

/**
 * Pairings of fontFamilies for AnchorFM onboarding
 *
 * To get the name of the font for display, use `getFontTitle( fontName )`.
 * (defined in the utils/ folder).
 */
export const ANCHORFM_FONT_PAIRINGS = [
	{
		headings: 'Roboto',
		base: 'Roboto',
	},
	{
		headings: 'Raleway',
		base: 'Cabin',
	},
] as const;

/**
 * mShot options
 */
export const DEFAULT_VIEWPORT_WIDTH = 1600;
export const DEFAULT_VIEWPORT_HEIGHT = 1040;
export const MOBILE_VIEWPORT_WIDTH = 599;

/**
 * Generated design picker
 */
export const STICKY_OFFSET_TOP = 109;

/**
 * Hard-coded design
 */
export const DEFAULT_ASSEMBLER_DESIGN = {
	slug: 'creatio-2',
	title: 'Creatio 2',
	recipe: {
		stylesheet: 'pub/creatio-2',
	},
	design_type: 'assembler',
} as Design;

export const FREE_THEME = 'free';
export const PREMIUM_THEME = 'premium';
export const DOT_ORG_THEME = 'dot-org';
export const WOOCOMMERCE_THEME = 'woocommerce';
export const MARKETPLACE_THEME = 'marketplace';
