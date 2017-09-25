/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcomPKG from 'wpcom/package';

/**
 * Internal dependencies
 */
import { injectGuestSandboxTicketHandler } from './handlers/guest-sandbox-ticket';
import { injectLocalization } from './localization';
import { SyncHandler, syncOptOut } from './sync-handler';
import config from 'config';
import oauthToken from 'lib/oauth-token';
import wpcomSupport from 'lib/wp/support';
import wpcomUndocumented from 'lib/wpcom-undocumented';
const debug = debugFactory( 'calypso:wp' );

const addSyncHandlerWrapper = config.isEnabled( 'sync-handler' );
let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'lib/wpcom-xhr-wrapper' ) )
		: require( 'lib/wpcom-xhr-wrapper' );

	wpcom = wpcomUndocumented( oauthToken.getToken(), requestHandler );
} else {
	const requestHandler = addSyncHandlerWrapper
		? new SyncHandler( require( 'wpcom-proxy-request' ).default )
		: require( 'wpcom-proxy-request' ).default;

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
	window.wpcom = wpcom;
	window.wpcom.__version = wpcomPKG.version;
}

// Inject localization helpers to `wpcom` instance
injectLocalization( wpcom );

injectGuestSandboxTicketHandler( wpcom );

/**
 * Expose `wpcom`
 */
export default wpcom;
