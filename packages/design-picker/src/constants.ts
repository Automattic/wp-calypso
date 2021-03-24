/**
 * External dependencies
 */
import type { ValuesType } from 'utility-types';

const fontTitles: Partial< Record< Font, string > > = {
	'Playfair Display': 'Playfair',
};

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

export type DesignFeatures = 'anchorfm'; // For additional features, = 'anchorfm' | 'feature2' | 'feature3'

export interface Design {
	categories: Array< string >;
	fonts: FontPair;
	is_alpha?: boolean;
	is_fse?: boolean;
	is_premium: boolean;
	slug: string;
	template: string;
	theme: string;
	preview?: 'static';
	title: string;
	features: Array< DesignFeatures >;

	/**
	 * Quickly hide a design from the picker without having to remove
	 * it from the available-designs-config.json file.
	 */
	hide?: boolean;
}
