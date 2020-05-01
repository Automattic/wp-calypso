/**
 * Internal dependencies
 */
import { JETPACK_SCAN_ENQUEUE_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan/enqueue';
import 'state/jetpack-scan/init';

export const requestJetpackScanEnqueue = ( siteId ) => ( {
	type: JETPACK_SCAN_ENQUEUE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
