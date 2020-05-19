/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default function ( params, callback ) {
	return import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ).then( ( xhr ) =>
		xhr.default( params, function ( error, response, headers ) {
			if ( error && error.name === 'InvalidTokenError' ) {
				debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
				require( 'lib/user/utils' ).logout();
			}

			callback( error, response, headers );
		} )
	);
}
