import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import WPCOM from 'wpcom';
import wpcomProxyRequest from 'wpcom-proxy-request';
import * as oauthToken from 'calypso/lib/oauth-token';
import wpcomSupport from 'calypso/lib/wp/support';
import wpcomXhrWrapper, { jetpack_site_xhr_wrapper } from 'calypso/lib/wpcom-xhr-wrapper';
import { injectFingerprint } from './handlers/fingerprint';
import { injectGuestSandboxTicketHandler } from './handlers/guest-sandbox-ticket';
import { injectLocalization } from './localization';

const debug = debugFactory( 'calypso:wp' );

let wpcom;

if ( config.isEnabled( 'oauth' ) ) {
	wpcom = new WPCOM( oauthToken.getToken(), wpcomXhrWrapper );
} else if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
	wpcom = new WPCOM( jetpack_site_xhr_wrapper );
} else {
	wpcom = new WPCOM( wpcomProxyRequest );

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

injectFingerprint( wpcom );

/**
 * Expose `wpcom`
 */
export default wpcom;

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = new WPCOM( wpcomXhrWrapper );
