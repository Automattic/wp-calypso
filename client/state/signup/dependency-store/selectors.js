/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSignupDependencies( state ) {
	return get( state, 'signup.dependencyStore', {} );
}
