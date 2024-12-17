import { experimentsCatalog } from './experiments';

/**
 * Redirect to a URL but conserves the existing query parameters.
 * @param target a URL to redirect to.
 */
export function redirectWithParams( target: string ) {
	const url = new URL( window.location.href );
	const params = url.searchParams.toString();
	if ( params ) {
		window.location.replace( `${ target }?${ params }` );
	} else {
		window.location.replace( target );
	}
}

/**
 * Gets the experiment manifest by determining its slug from the URL then retrieving it from the catalog.
 */
export function getManifestFromUrl() {
	const slug = window.location.pathname.split( '/' )[ 2 ] as keyof typeof experimentsCatalog;
	const experiment = slug in experimentsCatalog && experimentsCatalog[ slug ];
	if ( ! experiment ) {
		throw new Error( `Experiment with slug ${ slug } not found` );
	}
	return experiment;
}
