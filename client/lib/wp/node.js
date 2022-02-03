import wpcomXhrRequest from 'wpcom-xhr-request';
import wpSupportWrapper from 'calypso/lib/wp/support';
import wpcomOAuthWrapper from 'calypso/lib/wpcom-oauth-wrapper';
import { injectLocalization } from './localization';

let wpcom = wpcomOAuthWrapper( wpcomXhrRequest );

wpcom = wpSupportWrapper( wpcom );

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = wpcomOAuthWrapper( wpcomXhrRequest );
