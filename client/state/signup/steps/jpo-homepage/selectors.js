/**
 * External dependencies
 */
import { get } from 'lodash';

export function getHomepage( state ) {
	return get( state, 'signup.steps.jpoHomepage', '' );
}