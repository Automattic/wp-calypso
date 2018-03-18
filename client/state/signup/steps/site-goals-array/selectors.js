/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteGoalsArray( state ) {
	return get( state, 'signup.steps.siteGoalsArray', [] );
}
