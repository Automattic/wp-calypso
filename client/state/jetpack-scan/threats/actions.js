/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_THREATS_GET_FIX_STATUS,
	JETPACK_SCAN_THREATS_FIX_ALL,
	JETPACK_SCAN_THREAT_FIX,
	JETPACK_SCAN_THREAT_IGNORE,
	JETPACK_SCAN_UPDATE_THREAT,
	JETPACK_SCAN_UPDATE_THREAT_COMPLETED,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/scan/threats/fix-all-threats';
import 'calypso/state/data-layer/wpcom/sites/alerts/fix-status';
import 'calypso/state/data-layer/wpcom/sites/scan/threats/fix';
import 'calypso/state/data-layer/wpcom/sites/scan/threats/ignore';

export const fixThreat = ( siteId, threatId ) => ( {
	type: JETPACK_SCAN_THREAT_FIX,
	siteId,
	threatId,
} );

export const fixAllThreats = ( siteId, threatIds ) => ( {
	type: JETPACK_SCAN_THREATS_FIX_ALL,
	siteId,
	threatIds,
} );

export const getFixThreatsStatus = ( siteId, threatIds ) => ( {
	type: JETPACK_SCAN_THREATS_GET_FIX_STATUS,
	siteId,
	threatIds,
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
