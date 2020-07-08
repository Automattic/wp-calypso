/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

export function getSiteGoals( state ) {
	return get( state, 'signup.steps.siteGoals', '' );
}
