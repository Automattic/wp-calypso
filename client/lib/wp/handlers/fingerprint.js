// Internal module cache.
// Exported for use in testing.
/** @type { result?: string|undefined, promise?: Promise<any> } */
export const cache = {};

/**
 * Returns the fingerprint, loading the library and generating it
 * if needed.
 * @returns string|undefined The fingerprint.
 */
function getFingerprint() {
	if ( 'result' in cache ) {
		return Promise.resolve( cache.result );
	}
	cache.promise ??= ( async () => {
		const { load } = await import( '@fingerprintjs/fingerprintjs' );
		const agent = await load( { monitoring: false } );
		const result = await agent.get();
		cache.result = result.visitorId;
	} )();
	return cache.promise.then( () => cache.result );
}

/**
 * Updates `wpcom` to pass a fingerprint if one is present.
 * @param {Object} wpcom Original WPCOM instance
 */
export async function injectFingerprint( wpcom ) {
	const request = wpcom.request.bind( wpcom );

	wpcom.request = async function ( params, callback ) {
		if ( params?.path === '/me/transactions' ) {
			const fingerprint = await getFingerprint();
			if ( fingerprint ) {
				params = {
					...params,
					headers: {
						...( params.headers || {} ),
						'X-Fingerprint': fingerprint,
					},
				};
			}
		}
		return request( params, callback );
	};
}
