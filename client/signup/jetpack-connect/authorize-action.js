/**
 * External dependencies
 */
import Debug from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:authorize' );

export function createAccount( userData, callback ) {
	wpcom.undocumented().usersNew(
		userData,
		( error, response ) => {
			callback( error, response );
		}
	);
}

export function jetpackAuthorize( queryObject, callback ) {
	debug( 'Trying jetpack login: ', queryObject );
	wpcom.undocumented().jetpackLogin( queryObject, function( error, data ) {
		if ( error ) {
			debug( 'Jetpack login error:', error );
			callback( error );
			return;
		}
		debug( 'Jetpack login success! Trying jetpack authorize:', queryObject.client_id, data );
		wpcom.undocumented().jetpackAuthorize(
			queryObject.client_id,
			data.code,
			queryObject.state,
			queryObject.redirect_uri,
			queryObject.secret,
			function( error2, data2 ) {
				if ( error2 ) {
					debug( 'Jetpack authorize error:', error2 );
					callback( error2 );
					return;
				}
				debug( 'Jetpack authorization complete!', data2 );
				callback( false, data2 );
			} );
	} );
}
