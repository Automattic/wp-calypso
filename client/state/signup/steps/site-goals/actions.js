/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_GOALS_SET } from 'client/state/action-types';

export function setSiteGoals( siteGoals ) {
	return {
		type: SIGNUP_STEPS_SITE_GOALS_SET,
		siteGoals,
	};
}
