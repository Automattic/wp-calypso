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
				if (
					( +statusCode === 400 && startsWith( message, 'The user account has been closed' ) ) ||
					( +statusCode === 403 &&
						startsWith(
							message,
							'An active access token must be used to query information about the current user'
						) )
				) {
					require( 'lib/user/utils' ).default.logout();
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
