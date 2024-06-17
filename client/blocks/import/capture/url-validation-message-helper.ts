function getErrorMessages(
	translate: ( key: string ) => string
): Record< string, { message: string; messageString: string } > {
	// TODO: Just return the translated string directly from getValidationMessage once we have translations for all messages.
	return {
		'no-tld': {
			message: translate(
				"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'."
			),
			messageString:
				"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'.",
		},
		email: {
			message: translate(
				"Looks like you might have added an email address. Please use a URL instead, like 'example.com'."
			),
			messageString:
				"Looks like you might have added an email address. Please use a URL instead, like 'example.com'.",
		},
		'invalid-chars': {
			message: translate(
				'Looks like your URL has some invalid characters (like ~ or ^). Please delete them and try again.'
			),
			messageString:
				'Looks like your URL has some invalid characters (like ~ or ^). Please delete them and try again.',
		},
		'invalid-protocol': {
			message: translate(
				"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'."
			),
			messageString:
				"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'.",
		},
		'idn-url': {
			message: translate(
				"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com')."
			),
			messageString:
				"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com').",
		},
		default: {
			message: translate(
				"Please add a valid website address (like 'example.com'). Feel free to copy and paste it in if that helps."
			),
			messageString:
				"Please add a valid website address (like 'example.com'). Feel free to copy and paste it in if that helps.",
		},
	};
}

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
export default function getValidationMessage(
	url: string,
	translate: ( key: string ) => string,
	hasEnTranslation: ( key: string ) => boolean
) {
	const errorMessages = getErrorMessages( translate );
	const hasEnTranslationForAllMessages = Object.values( errorMessages ).every( ( message ) =>
		hasEnTranslation( message.messageString )
	);

	if ( ! hasEnTranslationForAllMessages ) {
		return translate( 'Please enter a valid website address. You can copy and paste.' );
	}

	const missingTLDRegex = /^(?:https?:\/\/)?(?!.*\.[a-z]{2,})([a-zA-Z0-9-_]+)$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidURLProtocolRegex = /^(?!https?:\/\/)\S+:\/\//;
	const invalidCharsRegex = /[^a-z0-9\-._~!$&'()*+,;:@/?=%[\]]/i;

	const removedInitialDots = url.replace( 'www.', '' );

	let errorMessage = errorMessages[ 'default' ].message;

	if ( emailRegex.test( url ) ) {
		errorMessage = errorMessages[ 'email' ].message;
	} else if ( isIDN( url ) ) {
		errorMessage = errorMessages[ 'idn-url' ].message;
	} else if ( invalidCharsRegex.test( url ) ) {
		errorMessage = errorMessages[ 'invalid-chars' ].message;
	} else if ( missingTLDRegex.test( removedInitialDots ) ) {
		errorMessage = errorMessages[ 'no-tld' ].message;
	} else if ( invalidURLProtocolRegex.test( url ) ) {
		errorMessage = errorMessages[ 'invalid-protocol' ].message;
	}

	return errorMessage;
}
