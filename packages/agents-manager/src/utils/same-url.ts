/**
 * Whether two links point at the same place, however each was written —
 * relative or absolute. The query counts: plain permalinks differ only there.
 */
export const sameUrl = ( a: unknown, b: unknown ): boolean => {
	try {
		const [ x, y ] = [ a, b ].map( ( url ) => new URL( String( url ), window.location.origin ) );

		return (
			x.origin === y.origin &&
			x.pathname.replace( /\/+$/, '' ) === y.pathname.replace( /\/+$/, '' ) &&
			x.search === y.search
		);
	} catch {
		return false;
	}
};
