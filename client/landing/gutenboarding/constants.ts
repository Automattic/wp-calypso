/**
 * External dependencies
 */
import { ValuesType } from 'utility-types';

/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const selectorDebounce = 300;

export const fontPairings = [
	{
		headings: { title: 'Cabin', fontFamily: 'Cabin' },
		base: { title: 'Raleway', fontFamily: 'Raleway' },
	},
	{
		headings: { title: 'Chivo', fontFamily: 'Chivo' },
		base: { title: 'Open Sans', fontFamily: 'Open Sans' },
	},
	{
		headings: { title: 'Playfair', fontFamily: 'Playfair Display' },
		base: { title: 'Fira Sans', fontFamily: 'Fira Sans' },
	},
	{
		headings: { title: 'Arvo', fontFamily: 'Arvo' },
		base: { title: 'Montserrat', fontFamily: 'Montserrat' },
	},
	{
		headings: { title: 'Space Mono', fontFamily: 'Space Mono' },
		base: { title: 'Roboto', fontFamily: 'Roboto' },
	},
] as const;

export type FontPair = ValuesType< typeof fontPairings >;
export type Font = FontPair[ keyof FontPair ][ 'fontFamily' ];
