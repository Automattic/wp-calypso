import config from '@automattic/calypso-config';
import WPCOM from 'wpcom';
import wpcomXhrRequest from 'wpcom-xhr-request';
import wpSupportWrapper from 'calypso/lib/wp/support';
import { injectLocalization } from './localization';

let wpcom = WPCOM( wpcomXhrRequest );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpSupportWrapper( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = WPCOM( wpcomXhrRequest );
