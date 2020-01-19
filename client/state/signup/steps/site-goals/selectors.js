/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteGoals( state ) {
	return get( state, 'signup.steps.siteGoals', '' );
}
