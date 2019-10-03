/**
 * Internal dependencies
 */
import { MARKETING_CLICK_UPGRADE_NUDGE } from 'state/action-types';

export const clickUpgradeNudge = nudgeName => ( {
	type: MARKETING_CLICK_UPGRADE_NUDGE,
	nudgeName,
} );
