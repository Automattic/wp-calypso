/**
 * Internal dependencies
 */
import { JETPACK_SCAN_THREAT_COUNTS_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/scan/threat-counts';

export const requestThreatCounts = ( siteId ) => ( {
	type: JETPACK_SCAN_THREAT_COUNTS_REQUEST,
	siteId,
} );
