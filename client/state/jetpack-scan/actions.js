/**
 * Internal dependencies
 */
import { JETPACK_SCAN_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/scan';
import 'calypso/state/jetpack-scan/init';

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
