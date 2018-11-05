/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteInformation( state ) {
	return get( state, 'signup.steps.siteInformation', {} );
}
