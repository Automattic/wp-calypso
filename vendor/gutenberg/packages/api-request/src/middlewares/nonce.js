/**
 * External dependencies
 */
import jQuery from 'jquery';

const createNonceMiddleware = ( nonce ) => ( options, next ) => {
	let usedNonce = nonce;
	/**
	 * This is not ideal but it's fine for now.
	 *
	 * Configure heartbeat to refresh the wp-api nonce, keeping the editor
	 * authorization intact.
	 */
	jQuery( document ).on( 'heartbeat-tick', ( event, response ) => {
		if ( response[ 'rest-nonce' ] ) {
			usedNonce = response[ 'rest-nonce' ];
		}
	} );

	// If ?_wpnonce=... is present, no need to add a nonce header.
	let addNonceHeader = ! ( options.data && options.data._wpnonce );
	let headers = options.headers || {};

	// If an 'X-WP-Nonce' header (or any case-insensitive variation
	// thereof) was specified, no need to add a nonce header.
	if ( addNonceHeader ) {
		for ( const headerName in headers ) {
			if ( headers.hasOwnProperty( headerName ) ) {
				if ( headerName.toLowerCase() === 'x-wp-nonce' ) {
					addNonceHeader = false;
					break;
				}
			}
		}
	}

	if ( addNonceHeader ) {
	// Do not mutate the original headers object, if any.
		headers = {
			...headers,
			'X-WP-Nonce': usedNonce,
		};
	}

	return next( {
		...options,
		headers,
	} );
};

export default createNonceMiddleware;
