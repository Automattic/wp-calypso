/**
 * External dependencies
 */
import type { ValuesType } from 'utility-types';

/**
 * An ID that identifies the onboarding flow to analytics and other services.
 *
 */
export const FLOW_ID = 'gutenboarding';
export const ANCHOR_FM_FLOW_ID = 'anchor-fm';

const fontTitles: Partial< Record< Font, string > > = {
	'Playfair Display': 'Playfair',
};

export const domainIsAvailableStatus = [ 'available', 'available_premium' ];

export function getFontTitle( fontFamily: string ): string {
	return fontTitles[ fontFamily as Font ] ?? fontFamily;
}

/**
 * Pairings of fontFamilies
 *
 * To get the name of the font for display, use `getFontTitle( fontName )`.
 */
export const fontPairings = [
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
 */
export const anchorFmFontPairings = [
	{
		headings: 'Roboto',
		base: 'Roboto',
	},
	{
		headings: 'Raleway',
		base: 'Cabin',
	},
] as const;

export type Font = ValuesType< ValuesType< typeof fontPairings > >;
export interface FontPair {
	headings: Font;
	base: Font;
}
