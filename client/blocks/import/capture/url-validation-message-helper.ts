function isIDN( url: string ): boolean {
	try {
		// Regex to extract the hostname from the URL.
		const urlRegex = /^(?:https?:\/\/)?(?:www\.)?([^/]+)/i;
		const match = url.match( urlRegex );

		if ( ! match ) {
			return false;
		}

		// Extract the hostname.
		const hostname = match[ 1 ];

		// Check for non-ASCII characters
		for ( let i = 0; i < hostname.length; i++ ) {
			if ( hostname.charCodeAt( i ) > 127 ) {
				return true;
			}
		}

		// Check if the hostname starts with the Punycode prefix.
		return hostname.startsWith( 'xn--' );
	} catch ( e ) {
		return false;
	}
}

/*
 * Get the validation message for the given URL.
 *
 * @param {string} url The URL to validate.
 * @param {Function} translate The translation function.
 * @param {Function} hasEnTranslation The function to check if a translation key has an English translation.
 *
 * @return {string} The validation message for the given URL.
 */
export default function getValidationMessage( url: string, translate: ( key: string ) => string ) {
	const missingTLDRegex = /^(?:https?:\/\/)?(?!.*\.[a-z]{2,})([a-zA-Z0-9-_]+)$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidURLProtocolRegex = /^(?!https?:\/\/)\S+:\/\//;
	const invalidCharsRegex = /[^a-z0-9\-._!$&'()*+,;:@/?=%[\]]/i;

	const removedInitialDots = url.replace( 'www.', '' );

	let errorMessage = translate(
		"Please add a valid website address (like 'example.com'). Feel free to copy and paste it in if that helps."
	);

	if ( emailRegex.test( url ) ) {
		errorMessage = translate(
			"Looks like you might have added an email address. Please use a URL instead, like 'example.com'."
		);
	} else if ( isIDN( url ) ) {
		errorMessage = translate(
			"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com')."
		);
	} else if ( invalidCharsRegex.test( url ) ) {
		errorMessage = translate(
			'Looks like your URL has some invalid characters (like ~ or ^). Please delete them and try again.'
		);
	} else if ( missingTLDRegex.test( removedInitialDots ) ) {
		errorMessage = translate(
			"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'."
		);
	} else if ( invalidURLProtocolRegex.test( url ) ) {
		errorMessage = translate(
			"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'."
		);
	}

	return errorMessage;
}
