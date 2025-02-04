import { parseUrl } from 'calypso/lib/importer/url-validation';
export function extractDomainFromInput( input: string ) {
	if ( ! isNaN( Number( input ) ) ) {
		return input;
	}
	try {
		const parsedUrl = parseUrl( input );
		const { hostname } = parsedUrl;
		return hostname || input;
	} catch ( error ) {
		return input;
	}
}
