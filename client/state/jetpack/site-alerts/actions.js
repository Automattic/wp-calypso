/**
 * Internal dependencies
 */
import {
	JETPACK_SITE_ALERT_THREAT_FIX,
	JETPACK_SITE_ALERT_THREAT_IGNORE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/alerts/fix';
import 'calypso/state/data-layer/wpcom/sites/alerts/ignore';
import 'calypso/state/jetpack/init';

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
