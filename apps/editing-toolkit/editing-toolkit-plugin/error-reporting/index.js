/**
 * External dependences
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import handler from './src/handler';

window.onerror = handler( apiFetch );

// Remove this code later, here to test the request and the throttling logic manually
/*setInterval( function () {
	for ( let i = 0; i < 100; i++ ) {
		throw new Error( 'BOOOOOM!' );
	}
}, 2000 );*/
