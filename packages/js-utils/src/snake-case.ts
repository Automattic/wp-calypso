import words from './words';

/**
 * Converts an ASCII identifier or key to snake_case — not a Unicode/deburr
 * replacement (see `words`).
 * Unlike the simpler `camelToSnakeCase`, it also splits kebab-case input.
 */
export default function snakeCase( input: string | null | undefined ): string {
	return words( String( input ?? '' ) )
		.map( ( word ) => word.toLowerCase() )
		.join( '_' );
}
