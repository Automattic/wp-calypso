/**
 * Given an absolute or relative URL and search terms, returns a relative URL including
 * the search query parameter and preserving existing parameters.
 *
 * @param  uri    URL or path to modify
 * @param  search Search terms
 * @returns        Path including search terms
 */
export function buildRelativeSearchUrl( uri: string, search: string ): string {
	// We only care about the relative part, but the URL API only deals with absolute URLs,
	// so we need to provide a dummy domain.
	const parsedUrl = new URL( uri, 'http://dummy.example' );

	if ( search ) {
		parsedUrl.searchParams.set( 's', search );
	} else {
		parsedUrl.searchParams.delete( 's' );
	}

	return `${ parsedUrl.pathname }${ parsedUrl.search }${ parsedUrl.hash }`.replace( /%20/g, '+' );
}
