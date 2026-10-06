export function isDocumentPrerendering(): boolean {
	return (
		typeof document !== 'undefined' &&
		!! ( document as Document & { prerendering?: boolean } ).prerendering
	);
}

/** Runs immediately except while the browser is prerendering this document. */
export function whenDocumentActive< T >( callback: () => Promise< T > ): Promise< T >;
export function whenDocumentActive< T >( callback: () => T ): T | Promise< T >;
export function whenDocumentActive< T >( callback: () => T ): T | Promise< T > {
	if ( ! isDocumentPrerendering() ) {
		return callback();
	}

	return new Promise< T >( ( resolve, reject ) => {
		document.addEventListener(
			'prerenderingchange',
			() => {
				try {
					resolve( callback() );
				} catch ( error ) {
					reject( error );
				}
			},
			{ once: true }
		);
	} );
}
