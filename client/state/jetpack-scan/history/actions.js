/**
 * Internal dependencies
 */
import { JETPACK_SCAN_HISTORY_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/scan';
import 'calypso/state/jetpack-scan/init';

export const requestJetpackScanHistory = ( siteId ) => ( {
	type: JETPACK_SCAN_HISTORY_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
