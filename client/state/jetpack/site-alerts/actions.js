/**
 * Internal dependencies
 */
import {
	JETPACK_SITE_ALERT_THREAT_FIX,
	JETPACK_SITE_ALERT_THREAT_IGNORE,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/alerts/fix';
import 'state/data-layer/wpcom/sites/alerts/ignore';

export const fixThreatAlert = ( siteId, threatId, requestScanState = false ) => ( {
	type: JETPACK_SITE_ALERT_THREAT_FIX,
	siteId,
	threatId,
	requestScanState,
} );

export const ignoreThreatAlert = ( siteId, threatId, requestScanState = false ) => ( {
	type: JETPACK_SITE_ALERT_THREAT_IGNORE,
	siteId,
	threatId,
	requestScanState,
} );
