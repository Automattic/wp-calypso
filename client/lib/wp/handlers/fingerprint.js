import { load } from '@automattic/fingerprintjs';

let fingerprint;
async function loadFingerprint() {
	const agent = await load( { monitoring: false } );
	const result = await agent.get();
	fingerprint = result.visitorId;
}
if ( document.readyState !== 'loading' ) {
	loadFingerprint();
} else {
	document.addEventListener( 'DOMContentLoaded', loadFingerprint );
}

/**
 * Updates `wpcom` to pass a fingerprint if one is present.
 * @param {Object} wpcom Original WPCOM instance
 */
export function injectFingerprint( wpcom ) {
	const request = wpcom.request.bind( wpcom );

	Object.assign( wpcom, {
		request( params, callback ) {
			if ( fingerprint ) {
				params = Object.assign( {}, params, {
					headers: Object.assign( {}, params.headers || {}, {
						'X-Fingerprint': fingerprint,
					} ),
				} );
			}
			return request( params, callback );
		},
	} );
}
