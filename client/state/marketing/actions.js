/**
 * Internal dependencies
 */
import { MARKETING_CLICK_UPGRADE_NUDGE } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/marketing';

export const clickUpgradeNudge = ( siteId, nudgeName ) => ( {
	type: MARKETING_CLICK_UPGRADE_NUDGE,
	siteId,
	nudgeName,
} );
