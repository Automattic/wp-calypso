/** @format */

/**
 * External Dependencies
 */
import { startsWith } from 'lodash';

export function handleAccountClosed( handler ) {
	return ( params, fn ) =>
		handler( params, ( err, response ) => {
			if ( err ) {
				const { statusCode, message } = err;
				if ( +statusCode === 400 && startsWith( message, 'The user account has been closed' ) ) {
					require( 'lib/user/utils' ).logout();
					return;
				}
			}
			return fn( err, response );
		} );
}

export function injectAccountClosedHandler( wpcom ) {
	const request = wpcom.request.bind( wpcom );
	wpcom.request = handleAccountClosed( request );
	return wpcom;
}
