/**
 * External dependencies
 */
import get from 'lodash/get';

export function getSignupDependencyStore( state ) {
	return get( state, 'signup.dependencyStore', {} );
}
