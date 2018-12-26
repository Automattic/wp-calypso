/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteStyle( state ) {
	return get( state, 'signup.steps.siteStyle', '' );
}
