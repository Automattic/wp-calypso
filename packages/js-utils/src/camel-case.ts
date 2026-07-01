import words from './words';

/**
 * Converts an ASCII identifier or key to camelCase, matching lodash's
 * `camelCase` for that input — not a Unicode/deburr replacement (see `words`).
 * Unlike the simpler `snakeToCamelCase`, it fully tokenizes any casing.
 */
export default function camelCase( input: string | null | undefined ): string {
	return words( String( input ?? '' ) ).reduce( ( result, word, index ) => {
		const lower = word.toLowerCase();
		return result + ( index === 0 ? lower : lower.charAt( 0 ).toUpperCase() + lower.slice( 1 ) );
	}, '' );
}
