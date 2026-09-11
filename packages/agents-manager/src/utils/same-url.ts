const parse = ( url: unknown ): URL | null => {
	try {
		return new URL( String( url ), window.location.origin );
	} catch {
		return null;
	}
};

/** Origin, path without trailing slashes, and query: what names a page. */
const pageKey = ( { origin, pathname, search }: URL ): string =>
	`${ origin }${ pathname.replace( /\/+$/, '' ) }${ search }`;

/**
 * A url reduced to what names its destination, however it was written. The
 * fragment counts: two anchor links into one page are two items. `null` for
 * what is not a url.
 */
export const urlKey = ( url: unknown ): string | null => {
	const parsed = parse( url );

	return parsed && pageKey( parsed ) + parsed.hash;
};

/** Whether two links point at the same page. The fragment does not count. */
export const sameUrl = ( a: unknown, b: unknown ): boolean => {
	const [ x, y ] = [ parse( a ), parse( b ) ];

	return !! x && !! y && pageKey( x ) === pageKey( y );
};
