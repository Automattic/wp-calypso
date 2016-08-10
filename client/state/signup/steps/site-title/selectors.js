/**
 * External dependencies
 */
import get from 'lodash/get';

export function getSiteTitle( state ) {
	return get( state, 'signup.steps.siteTitle', '' );
}
