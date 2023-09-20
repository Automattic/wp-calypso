import { parseUrl } from 'calypso/lib/importer/url-validation';
export function extractDomainFromInput( input: string ) {
	try {
		const parsedUrl = parseUrl( input );
		const { hostname } = parsedUrl;
		return hostname || input;
	} catch ( error ) {
		return input;
	}
}
