/**
 * External dependencies
 */
import { SyncHandler, syncOptOut } from './sync-handler';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wp' );

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import wpcomSupport from 'lib/wp/support';
import { injectLocalization } from './localization';

const addSyncHandlerWrapper = config.isEnabled( 'sync-handler' );
let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	const oauthToken = require( 'lib/oauth-token' );
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'lib/wpcom-xhr-wrapper' ) )
		: require( 'lib/wpcom-xhr-wrapper' );

	wpcom = wpcomUndocumented( oauthToken.getToken(), requestHandler );
} else {
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'wpcom-proxy-request' ) )
		: require( 'wpcom-proxy-request' );

	wpcom = wpcomUndocumented( requestHandler );

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

if ( addSyncHandlerWrapper ) {
	wpcom = syncOptOut( wpcom );
}

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpcomSupport( wpcom );
}

// expose wpcom global var only in development
if ( 'development' === config( 'env' ) ) {
	let wpcomPKG = require( 'wpcom/package' );
	window.wpcom = wpcom;
	window.wpcom.__version = wpcomPKG.version;
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

/**
 * Expose `wpcom`
 */
module.exports = wpcom;
