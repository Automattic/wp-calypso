/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

export function getSiteTitle( state ) {
	return get( state, 'signup.steps.siteTitle', '' );
}
