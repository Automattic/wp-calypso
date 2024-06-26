import { parseUrl, hasTld } from 'calypso/lib/importer/url-validation';

export function getValidUrl( url?: string ) {
	let parsedUrl;
	try {
		parsedUrl = parseUrl( url );
	} catch ( error ) {
		return undefined;
	}

	// `isURL` considers `http://a` valid, so check for a top level domain name as well.
	if ( ! parsedUrl || ! hasTld( parsedUrl.hostname ) ) {
		return undefined;
	}

	return parsedUrl.toString();
}

/**
 * Get a valid domain from the URL or undefined if the URL is invalid.
 * @param url The URL to extract the domain from.
 * @returns The domain or undefined if the URL is invalid.
 */
export function getDomainFromUrl( url?: string ) {
	if ( ! url ) {
		return undefined;
	}

	try {
		const validUrl = new URL( url );
		return validUrl.hostname;
	} catch {
		return undefined;
	}
}
