import { load } from '@fingerprintjs/fingerprintjs';

let fingerprint;
export async function loadFingerprint() {
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

	wpcom.request = function ( params, callback ) {
		if ( fingerprint && params?.path === '/me/transactions' ) {
			params = {
				...params,
				headers: {
					...( params.headers || {} ),
					'X-Fingerprint': fingerprint,
				},
			};
		}
		return request( params, callback );
	};
}
