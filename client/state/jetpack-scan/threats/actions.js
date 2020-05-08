/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_THREAT_FIX,
	JETPACK_SCAN_THREAT_IGNORE,
	JETPACK_SCAN_UPDATE_THREAT,
	JETPACK_SCAN_UPDATE_THREAT_COMPLETED,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/scan/threats/fix';
import 'state/data-layer/wpcom/sites/scan/threats/ignore';

export const fixThreat = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_THREAT_FIX,
	siteId,
	threatId,
} );

export const ignoreThreat = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_THREAT_IGNORE,
	siteId,
	threatId,
} );

export const updateThreat = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_UPDATE_THREAT,
	siteId,
	threatId,
} );

export const updateThreatCompleted = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_UPDATE_THREAT_COMPLETED,
	siteId,
	threatId,
} );
