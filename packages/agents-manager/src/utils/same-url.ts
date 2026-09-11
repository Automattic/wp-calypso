/**
 * A url reduced to what names its destination — origin, path without trailing
 * slashes, query — however it was written, relative or absolute. The query
 * counts: plain permalinks differ only there. `null` for what is not a url.
 */
export const urlKey = ( url: unknown ): string | null => {
	try {
		const { origin, pathname, search } = new URL( String( url ), window.location.origin );

		return `${ origin }${ pathname.replace( /\/+$/, '' ) }${ search }`;
	} catch {
		return null;
	}
};

/** Whether two links point at the same place. */
export const sameUrl = ( a: unknown, b: unknown ): boolean => {
	const key = urlKey( a );

	return key !== null && key === urlKey( b );
};
