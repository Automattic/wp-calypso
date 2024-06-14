function getErrorMessages( translate: ( key: string ) => string ): object {
	// TODO: Just return the translated string directly from getValidationMessage once we have translations for all messages.
	return {
		'no-tld': {
			message: translate(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			),
			messageString:
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com',
		},
		email: {
			message: translate(
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).'
			),
			messageString:
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).',
		},
		'invalid-chars': {
			message: translate(
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com).'
			),
			messageString:
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com).',
		},
		'invalid-protocol': {
			message: translate(
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com).'
			),
			messageString:
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com).',
		},
		'idn-url': {
			message: translate(
				'Looks like you’ve entered an internationalized domain name (IDN). Please enter a standard URL instead (e.g., example.com).'
			),
			messageString:
				'Looks like you’ve entered an internationalized domain name (IDN). Please enter a standard URL instead (e.g., example.com).',
		},
		default: {
			message: translate(
				'Please enter a valid website address (e.g., example.com). You can copy and paste.'
			),
			messageString:
				'Please enter a valid website address (e.g., example.com). You can copy and paste.',
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
