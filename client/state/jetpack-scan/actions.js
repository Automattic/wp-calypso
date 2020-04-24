/**
 * Internal dependencies
 */
import { JETPACK_SCAN_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan';
import 'state/jetpack-scan/init';

export const requestScanStatus = ( siteId, pooling = true ) => ( {
	type: JETPACK_SCAN_REQUEST,
	siteId,
	pooling,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
