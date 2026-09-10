/**
 * Reduce raw input to a valid domain label: lowercase `[a-z0-9-]`, no leading,
 * trailing or consecutive hyphens. Never throws; invalid characters are dropped.
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
 * Reduce raw input to a keyword phrase: lowercase `[a-z0-9 ]`, single spaces,
 * trimmed. Punctuation becomes a word boundary.
 * @example sanitizeKeywordInput( 'Coffee-Shop!  NYC' ) // 'coffee shop nyc'
 */
export function sanitizeKeywordInput( input: string ): string {
	return input
		.toLowerCase()
		.replace( /[^a-z0-9\s]/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();
}
