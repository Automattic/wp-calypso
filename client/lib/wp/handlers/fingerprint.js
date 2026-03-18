export const cache = {};

/**
 * Returns the fingerprint, loading the library and generating it
 * if needed.
 * @returns string|undefined The fingerprint.
 */
async function getFingerprint() {
	if ( 'result' in cache ) {
		return cache.result;
	}
	const { load } = await import( '@fingerprintjs/fingerprintjs' );
	const agent = await load( { monitoring: false } );
	const result = await agent.get();
	cache.result = result.visitorId;
	return cache.result;
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
