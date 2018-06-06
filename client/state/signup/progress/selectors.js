/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSignupProgress( state ) {
	return get( state, 'signup.progress', [] );
}
