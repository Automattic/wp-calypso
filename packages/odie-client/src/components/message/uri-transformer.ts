// This is exactly the same implementation that is used in the react-markdown library.
// It is used to allow only certain protocols in links, and that's why I've copied it here.
// And overrided with my own implementation to include 'prompt' protocol. We might add more
// protocols in the future, but for now, this is enough. That would REALLY simplify things for
// us, because adding a new protocol would be as simple as adding it to the array above,
// and extending the component custom-a-link.tsx to handle it. That's it.
const protocols = [ 'http', 'https', 'mailto', 'tel', 'prompt', 'blob' ];

const referralCodes: { [ key: string ]: string } = {
	https: 'odie',
	http: 'odie',
};

/**
 * @param {string} uri
 * @returns {string}
 */
export function uriTransformer( uri: string ) {
	const url = ( uri || '' ).trim();
	const first = url.charAt( 0 );

	if ( first === '#' || first === '/' ) {
		return url;
	}

	const colon = url.indexOf( ':' );
	if ( colon === -1 ) {
		return url;
	}

	let index = -1;

	while ( ++index < protocols.length ) {
		const protocol = protocols[ index ];

		if ( colon === protocol.length && url.slice( 0, protocol.length ).toLowerCase() === protocol ) {
			const urlObj = new URL( url );
			// Add referral code to the URL
			if ( protocol !== 'blob' ) {
				urlObj.searchParams.set( 'ref', referralCodes[ protocol ] );
			}
			return urlObj.toString();
		}
	}

	index = url.indexOf( '?' );
	if ( index !== -1 && colon > index ) {
		return url;
	}

	index = url.indexOf( '#' );
	if ( index !== -1 && colon > index ) {
		return url;
	}

	// eslint-disable-next-line no-script-url
	return 'javascript:void(0)';
}
