/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_GOALS_SET } from 'state/action-types';

import 'state/signup/init';

export function setSiteGoals( siteGoals ) {
	return {
		type: SIGNUP_STEPS_SITE_GOALS_SET,
		siteGoals,
	};
}
