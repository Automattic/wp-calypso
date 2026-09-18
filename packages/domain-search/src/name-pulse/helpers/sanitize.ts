/**
 * Lowercase `[a-z0-9-]` with no leading, trailing or consecutive hyphens;
 * invalid characters are dropped.
 * @example sanitizeDomainInput( 'Coffee Shop!' ) // 'coffeeshop'
 */
export function sanitizeDomainInput( input: string ): string {
	return input
		.toLowerCase()
		.replace( /[^a-z0-9-]/g, '' )
		.replace( /^-+|-+$/g, '' )
		.replace( /-+/g, '-' );
}

/**
 * Lowercase `[a-z0-9 ]`, single-spaced and trimmed; punctuation becomes a word
 * boundary.
 * @example sanitizeKeywordInput( 'Coffee-Shop!  NYC' ) // 'coffee shop nyc'
 */
export function sanitizeKeywordInput( input: string ): string {
	return input
		.toLowerCase()
		.replace( /[^a-z0-9\s]/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();
}

/**
 * Words after keyword sanitisation, so punctuation-only tokens don't count.
 * @example getWordCount( 'coffee !!! shop' ) // 2
 */
export function getWordCount( input: string ): number {
	const sanitized = sanitizeKeywordInput( input );

	return sanitized ? sanitized.split( ' ' ).length : 0;
}
