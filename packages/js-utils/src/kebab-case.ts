import words from './words';

/**
 * Converts an ASCII identifier or key to kebab-case, matching lodash's
 * `kebabCase` for that input — not a Unicode/deburr replacement (see `words`).
 */
export default function kebabCase( input: string | null | undefined ): string {
	return words( String( input ?? '' ) )
		.map( ( word ) => word.toLowerCase() )
		.join( '-' );
}
