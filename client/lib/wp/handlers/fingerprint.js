let fingerprintPromise;

function loadFingerprint() {
	if ( ! fingerprintPromise ) {
		fingerprintPromise = import( '@fingerprintjs/fingerprintjs' ).then( async ( { load } ) => {
			const agent = await load( { monitoring: false } );
			const result = await agent.get();
			return result.visitorId;
		} );
	}
	return fingerprintPromise;
}

/**
 * Updates `wpcom` to pass a fingerprint if one is present.
 * @param {Object} wpcom Original WPCOM instance
 */
export function injectFingerprint( wpcom ) {
	const request = wpcom.request.bind( wpcom );

	wpcom.request = function ( params, callback ) {
		if ( params?.path === '/me/transactions' ) {
			return loadFingerprint().then( ( fingerprint ) => {
				params = {
					...params,
					headers: {
						...( params.headers || {} ),
						'X-Fingerprint': fingerprint,
					},
				};
				return request( params, callback );
			} );
		}
		return request( params, callback );
	};
}
