/**
 * Internal dependencies
 */
import { MARKETING_CLICK_UPGRADE_NUDGE } from 'state/action-types';

import 'state/data-layer/wpcom/marketing';

export const clickUpgradeNudge = ( siteId, nudgeName ) => ( {
	type: MARKETING_CLICK_UPGRADE_NUDGE,
	siteId,
	nudgeName,
} );
