/**
 * Internal dependencies
 */
import { JETPACK_SCAN_HISTORY_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan';
import 'state/jetpack-scan/init';

export const requestJetpackScanHistory = ( siteId ) => ( {
	type: JETPACK_SCAN_HISTORY_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
