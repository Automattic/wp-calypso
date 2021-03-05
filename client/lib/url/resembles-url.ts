/**
 * Checks if the supplied string appears to be a URL.
 * Looks only for the absolute basics:
 *  - does it have a .suffix?
 *  - does it have at least two parts separated by a dot?
 *
 * @param  query The string to check
 * @returns       Does it appear to be a URL?
 */
export default function resemblesUrl( query: string ): boolean {
	if ( ! query ) {
		return false;
	}

	let parsedUrl;
	try {
		parsedUrl = new URL( query );
	} catch {
		// Do nothing.
	}

	// If we got an invalid URL, add a protocol and try again.
	if ( parsedUrl === undefined ) {
		try {
			parsedUrl = new URL( 'http://' + query );
		} catch {
			// Do nothing.
		}
	}

	if ( ! parsedUrl ) {
		return false;
	}

	if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
		return false;
	}

	// Check for a valid-looking TLD
	if ( parsedUrl.hostname.lastIndexOf( '.' ) > parsedUrl.hostname.length - 3 ) {
		return false;
	}

	// Make sure the hostname has at least two parts separated by a dot
	const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
	if ( hostnameParts.length < 2 ) {
		return false;
	}

	return true;
}
