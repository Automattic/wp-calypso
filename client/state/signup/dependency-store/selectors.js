/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

const initialState = {};
export function getSignupDependencyStore( state ) {
	return get( state, 'signup.dependencyStore', initialState );
}
