/**
 * Internal dependencies
 */
import { JETPACK_SCAN_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan';
import 'state/jetpack-scan/init';

export const requestJetpackScanStatus = siteId => ( {
	type: JETPACK_SCAN_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
