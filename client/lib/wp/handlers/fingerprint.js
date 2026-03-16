let cached;
let hasLoaded = false;
let enabled = true;

// NOTE: This method is only used for testing.
export function __enableFingerprint() {
	enabled = true;
}

// NOTE: This method is only used for testing.
export function __disableFingerprint() {
	enabled = false;
}

/**
 * Loads the `fingerprintjs` library and retrieves a fingerprint.
 * This gets stored in a local cache.
 */
async function loadFingerprint() {
	const { load } = await import( '@fingerprintjs/fingerprintjs' );
	const agent = await load( { monitoring: false } );
	const result = await agent.get();
	cached = result.visitorId;
}

/**
 * Returns the fingerprint, loading the library and generating it
 * if needed.
 * @returns string|undefined The fingerprint.
 */
async function getFingerprint() {
	if ( ! enabled ) {
		return undefined;
	}
	if ( ! hasLoaded ) {
		await loadFingerprint();
		hasLoaded = true;
	}
	return cached;
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
