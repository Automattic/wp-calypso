/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wp' );

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';

let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	wpcom = wpcomUndocumented(
		require( 'lib/oauth-token' ),
		require( 'lib/wpcom-xhr-wrapper' )
	);
} else {
	// Set proxy request handler
	wpcom = wpcomUndocumented( require( 'wpcom-proxy-request' ) );

	// Upgrade to "access all users blogs" mode
	wpcom.request( {
		metaAPI: { accessAllUsersBlogs: true }
	}, function( error ) {
		if ( error ) {
			throw error;
		}
		debug( 'Proxy now running in "access all user\'s blogs" mode' );
	} );
}

/**
 * Expose `wpcom`
 */
module.exports = wpcom;
