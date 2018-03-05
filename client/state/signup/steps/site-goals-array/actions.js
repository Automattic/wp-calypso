/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_GOALS_ARRAY_SET } from 'state/action-types';

export function setSiteGoalsArray( siteGoalsArray ) {
	return {
		type: SIGNUP_STEPS_SITE_GOALS_ARRAY_SET,
		siteGoalsArray,
	};
}
