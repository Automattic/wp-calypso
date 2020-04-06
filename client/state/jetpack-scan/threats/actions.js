/**
 * Internal dependencies
 */
import { JETPACK_SCAN_THREAT_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan';
import 'state/jetpack-scan/init';

export const requestJetpackScanThreatAction = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_THREAT_REQUEST,
	siteId,
	threatId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
