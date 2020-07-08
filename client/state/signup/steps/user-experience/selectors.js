/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

export function getUserExperience( state ) {
	return get( state, 'signup.steps.userExperience', '' );
}
