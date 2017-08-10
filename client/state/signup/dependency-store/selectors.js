/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export function getSignupDependencyStore( state ) {
	return get( state, 'signup.dependencyStore', {} );
}
