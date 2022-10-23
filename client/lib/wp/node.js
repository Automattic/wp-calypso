import WPCOM from 'wpcom';
import wpcomXhrRequest from 'wpcom-xhr-request';

export default new WPCOM( wpcomXhrRequest );

/**
 * Expose `wpcomJetpackLicensing` which uses a different auth token than wpcom.
 */
export const wpcomJetpackLicensing = new WPCOM( wpcomXhrRequest );
