import { parseUrl, hasTld } from 'calypso/lib/importer/url-validation';

export function getValidUrl( url?: string ) {
	let parsedUrl;
	try {
		parsedUrl = parseUrl( url );
	} catch ( error ) {
		return null;
	}

	// `isURL` considers `http://a` valid, so check for a top level domain name as well.
	if ( ! parsedUrl || ! hasTld( parsedUrl.hostname ) ) {
		return null;
	}

	return parsedUrl.toString();
}
