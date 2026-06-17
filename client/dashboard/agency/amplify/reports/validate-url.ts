const MAX_URL_LENGTH = 2048;

/**
 * Normalize user input into a valid http(s) URL, or return null if it can't be.
 * Prepends https:// when no scheme is present; rejects non-http(s) schemes,
 * hostnames without a dot (except localhost), and over-long URLs.
 */
export function normalizeUrl( raw: string ): string | null {
	const trimmed = raw.trim();
	if ( ! trimmed || trimmed.length > MAX_URL_LENGTH ) {
		return null;
	}

	const withScheme = /^https?:\/\//i.test( trimmed ) ? trimmed : `https://${ trimmed }`;

	let parsed: URL;
	try {
		parsed = new URL( withScheme );
	} catch {
		return null;
	}

	if ( parsed.protocol !== 'http:' && parsed.protocol !== 'https:' ) {
		return null;
	}
	if ( ! parsed.hostname.includes( '.' ) && parsed.hostname !== 'localhost' ) {
		return null;
	}
	if ( parsed.href.length > MAX_URL_LENGTH ) {
		return null;
	}

	return parsed.href;
}
