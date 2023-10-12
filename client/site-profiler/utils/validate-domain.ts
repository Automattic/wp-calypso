export default function validateDomain( value: string ) {
	try {
		if ( value ) {
			// Only allow domains with a dot in them (not localhost, for example).
			if ( ! value.includes( '.' ) ) {
				throw new Error( 'Invalid domain' );
			}

			let normalised = value;

			// If the domain doesn't start with http:// or https://, add https://
			if ( ! normalised.startsWith( 'http://' ) && ! normalised.startsWith( 'https://' ) ) {
				normalised = 'https://' + normalised;
			}

			// Test if we can parse the URL. If we can't, it's invalid.
			const url = new URL( normalised );

			// Check if the protocol is 'http' or 'https'.
			return url.protocol === 'http:' || url.protocol === 'https:';
		}

		return undefined;
	} catch ( e ) {
		return false;
	}
}
