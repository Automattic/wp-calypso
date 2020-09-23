/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import userUtils from 'lib/user/utils';
import handlePinghubMessage from './pinghub';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:wpcom-xhr-wrapper' );

export default async function ( params, callback ) {
	const xhr = ( await import( /* webpackChunkName: "wpcom-xhr-request" */ 'wpcom-xhr-request' ) )
		.default;

	if ( params.path && params.path.startsWith( '/pinghub/' ) ) {
		return handlePinghubMessage( params, callback );
	}

	return xhr( params, function ( error, response, headers ) {
		if ( error && error.name === 'InvalidTokenError' ) {
			debug( 'Invalid token error detected, authorisation probably revoked - logging out' );
			userUtils.logout();
		}

		callback( error, response, headers );
	} );
}
