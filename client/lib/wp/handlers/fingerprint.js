// Internal module cache.
// Exported for use in testing.
/** @type { result?: Promise<string|undefined> } */
export const cache = {};

/**
 * Returns the fingerprint, loading the library and generating it
 * if needed.
 * @returns {Promise<string|undefined>} The fingerprint.
 */
async function getFingerprint() {
	if ( ! cache.result ) {
		cache.result = ( async () => {
			const { load } = await import( '@fingerprintjs/fingerprintjs' );
			const agent = await load( { monitoring: false } );
			const result = await agent.get();
			return result.visitorId;
		} )();
	}

	return await cache.result;
}

/**
 * Updates `wpcom` to pass a fingerprint if one is present.
 * @param {Object} wpcom Original WPCOM instance
 */
export function injectFingerprint( wpcom ) {
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
