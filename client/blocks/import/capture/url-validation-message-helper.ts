import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';

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

export type UrlValidationErrorReason =
	'email' | 'idn' | 'invalid_characters' | 'missing_tld' | 'invalid_protocol' | 'invalid_url';

/*
 * Validate a site URL the user entered.
 *
 * @param {string} url The URL to validate.
 *
 * @return {UrlValidationErrorReason | null} `null` if the URL is valid, otherwise a stable
 * identifier for the rule that rejects it.
 */
export function getUrlValidationError( url: string ): UrlValidationErrorReason | null {
	if ( CAPTURE_URL_RGX.test( url ) ) {
		return null;
	}

	const missingTLDRegex = /^(?:https?:\/\/)?(?!.*\.[a-z]{2,})([a-zA-Z0-9-_]+)$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidURLProtocolRegex = /^(?!https?:\/\/)\S+:\/\//;
	const invalidCharsRegex = /[^a-z0-9\-._!$&'()*+,;:@/?=%[\]]/i;

	const removedInitialDots = url.replace( 'www.', '' );

	if ( emailRegex.test( url ) ) {
		return 'email';
	} else if ( isIDN( url ) ) {
		return 'idn';
	} else if ( invalidCharsRegex.test( url ) ) {
		return 'invalid_characters';
	} else if ( missingTLDRegex.test( removedInitialDots ) ) {
		return 'missing_tld';
	} else if ( invalidURLProtocolRegex.test( url ) ) {
		return 'invalid_protocol';
	}

	return 'invalid_url';
}

/*
 * Get the validation message for a reason returned by `getUrlValidationError()`.
 *
 * @param {UrlValidationErrorReason} reason Why the URL is invalid.
 * @param {Function} translate The translation function.
 *
 * @return {string} The validation message.
 */
export function getValidationMessage(
	reason: UrlValidationErrorReason,
	translate: ( key: string ) => string
) {
	switch ( reason ) {
		case 'email':
			return translate(
				"Looks like you might have added an email address. Please use a URL instead, like 'example.com'."
			);
		case 'idn':
			return translate(
				"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com')."
			);
		case 'invalid_characters':
			return translate(
				'Looks like your URL has some invalid characters (like ~ or ^). Please delete them and try again.'
			);
		case 'missing_tld':
			return translate(
				"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'."
			);
		case 'invalid_protocol':
			return translate(
				"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'."
			);
		default:
			return translate(
				"Please add a valid website address (like 'example.com'). Feel free to copy and paste it in if that helps."
			);
	}
}
