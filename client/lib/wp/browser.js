/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import wpcomSupport from 'lib/wp/support';
import { injectLocalization } from './localization';
import { injectGuestSandboxTicketHandler } from './handlers/guest-sandbox-ticket';
import * as oauthToken from 'lib/oauth-token';
import wpcomXhrWrapper from 'lib/wpcom-xhr-wrapper';
import wpcomProxyRequest from 'wpcom-proxy-request';

const debug = debugFactory( 'calypso:wp' );

let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	wpcom = wpcomUndocumented( oauthToken.getToken(), wpcomXhrWrapper );
} else {
	wpcom = wpcomUndocumented( wpcomProxyRequest );

	// Upgrade to "access all users blogs" mode
	wpcom.request(
		{
			metaAPI: { accessAllUsersBlogs: true },
		},
		function ( error ) {
			if ( error ) {
				throw error;
			}
			debug( 'Proxy now running in "access all user\'s blogs" mode' );
		}
	);
}

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpcomSupport( wpcom );
}

if ( 'development' === process.env.NODE_ENV ) {
	require( './offline-library' ).makeOffline( wpcom );

	// expose wpcom global var only in development
	const wpcomPKG = require( 'wpcom/package' );
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
