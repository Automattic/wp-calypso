import config from '@automattic/calypso-config';
import wpcomXhrRequest from 'wpcom-xhr-request';
import wpSupportWrapper from 'calypso/lib/wp/support';
import wpcomUndocumented from 'calypso/lib/wpcom-undocumented';
import { injectLocalization } from './localization';

let wpcom = wpcomUndocumented( wpcomXhrRequest );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpSupportWrapper( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = wpcomUndocumented( wpcomXhrRequest );
