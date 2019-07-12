/** @format */

/**
 * Internal dependencies
 */
import {
	JETPACK_SITE_ALERT_THREAT_FIX,
	JETPACK_SITE_ALERT_THREAT_IGNORE,
} from 'state/action-types';

import 'state/data-layer/wpcom/activity-log/fix-threat-alert';
import 'state/data-layer/wpcom/activity-log/ignore-threat-alert';

export const fixThreatAlert = ( siteId, threatId ) => ( {
	type: JETPACK_SITE_ALERT_THREAT_FIX,
	siteId,
	threatId,
} );

export const ignoreThreatAlert = ( siteId, threatId ) => ( {
	type: JETPACK_SITE_ALERT_THREAT_IGNORE,
	siteId,
	threatId,
} );
