/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteVertical( state ) {
	return get( state, 'signup.steps.siteVertical', {} );
}
