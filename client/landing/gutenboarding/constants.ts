/**
 * External dependencies
 */
import { ValuesType } from 'utility-types';

/**
 * An ID that identifies the onboarding flow to analytics and other services.
 *
 */
export const FLOW_ID = 'gutenboarding';

/**
 * An ID that identifies the onboarding flow to analytics and other services.
 *
 */
export const DOMAIN_SUGGESTION_VENDOR = 'variation4_front';

/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const selectorDebounce = 300;

const fontTitles: Partial< Record< Font, string > > = {
	'Playfair Display': 'Playfair',
};

export const PAID_DOMAINS_TO_SHOW = 5;

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

export type Font = ValuesType< ValuesType< typeof fontPairings > >;
export interface FontPair {
	headings: Font;
	base: Font;
}
