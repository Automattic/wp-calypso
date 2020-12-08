/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_GOALS_SET } from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function setSiteGoals( siteGoals ) {
	return {
		type: SIGNUP_STEPS_SITE_GOALS_SET,
		siteGoals,
	};
}
