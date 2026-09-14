import words from './words';

/**
 * Converts an ASCII identifier or key to kebab-case. Not a Unicode/deburr
 * replacement (see `words`).
 */
export default function kebabCase( input: string | null | undefined ): string {
	return words( String( input ?? '' ) )
		.map( ( word ) => word.toLowerCase() )
		.join( '-' );
}
