/**
 * External dependencies
 */

import { get } from 'lodash';

const initialState = {};
export function getSignupDependencyStore( state ) {
	return get( state, 'signup.dependencyStore', initialState );
}
