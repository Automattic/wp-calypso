/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteTitle( state ) {
	return get( state, 'signup.steps.siteTitle', '' );
}
