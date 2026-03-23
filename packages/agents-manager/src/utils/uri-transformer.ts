/**
 * Based on react-markdown v9's `defaultUrlTransform`.
 * @see https://github.com/remarkjs/react-markdown/blob/main/lib/index.js
 */
const safeProtocol = /^(https?|ircs?|mailto|xmpp|tel|blob)$/i;

/**
 * Sanitizes a URI by only allowing known-safe protocols.
 * @param value - The URI to sanitize.
 * @returns The original URI if safe, or an empty string otherwise.
 */
export function uriTransformer( value: string ): string {
	if ( ! value ) {
		return '';
	}

	const colon = value.indexOf( ':' );
	const questionMark = value.indexOf( '?' );
	const numberSign = value.indexOf( '#' );
	const slash = value.indexOf( '/' );

	if (
		// If there is no protocol, it's relative.
		colon === -1 ||
		// If the first colon is after a `?`, `#`, or `/`, it's not a protocol.
		( slash !== -1 && colon > slash ) ||
		( questionMark !== -1 && colon > questionMark ) ||
		( numberSign !== -1 && colon > numberSign ) ||
		// It is a protocol, it should be allowed.
		safeProtocol.test( value.slice( 0, colon ) )
	) {
		return value;
	}

	return '';
}
