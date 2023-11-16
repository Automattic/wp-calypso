import { normalizeWhoisField } from './normalize-whois-entry';

// Normalize a WHOIS URL.
export function normalizeWhoisURL( url: string | string[] | undefined ): string {
	let normalisedURL = normalizeWhoisField( url );

	if ( normalisedURL === '' ) {
		return normalisedURL;
	}

	// Add a protocol if one is missing (assume HTTPS).
	if ( ! /^(http|https):\/\//.test( normalisedURL ) ) {
		normalisedURL = `https://${ normalisedURL }`;
	}

	try {
		// Throw an error if the URL is invalid.
		const urlObject = new URL( normalisedURL );

		return urlObject.href;
	} catch ( error ) {
		return '';
	}
}
