import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import wpcomProxyRequest from 'wpcom-proxy-request';
import * as oauthToken from 'calypso/lib/oauth-token';
import wpcomSupport from 'calypso/lib/wp/support';
import wpcomOAuthWrapper from 'calypso/lib/wpcom-oauth-wrapper';
import wpcomXhrWrapper from 'calypso/lib/wpcom-xhr-wrapper';
import { injectGuestSandboxTicketHandler } from './handlers/guest-sandbox-ticket';
import { injectLocalization } from './localization';

const debug = debugFactory( 'calypso:wp' );

let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	wpcom = wpcomOAuthWrapper( oauthToken.getToken(), wpcomXhrWrapper );
} else {
	wpcom = wpcomOAuthWrapper( wpcomProxyRequest );

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

wpcom = wpcomSupport( wpcom );

if ( 'development' === process.env.NODE_ENV ) {
	require( './offline-library' ).makeOffline( wpcom );

	// expose wpcom global var in development mode
	window.wpcom = wpcom;
}

// Inject localization helpers to `wpcom` instance
injectLocalization( wpcom );

injectGuestSandboxTicketHandler( wpcom );

/**
 * Expose `wpcom`
 */
export default wpcom;

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = wpcomOAuthWrapper( wpcomXhrWrapper );
