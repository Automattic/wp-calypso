/**
 * Internal dependencies
 */
import type { Font } from './types';

export const FONT_TITLES: Partial< Record< Font, string > > = {
	'Playfair Display': 'Playfair',
};

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

// Used to store and retrieve the design thumbnails used in the design picker
export const DESIGN_IMAGE_FOLDER = 'images/design-screenshots';
