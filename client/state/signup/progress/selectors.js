/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

const initialState = [];
export function getSignupProgress( state ) {
	return get( state, 'signup.progress', initialState );
}
