/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export function getUserExperience( state ) {
	return get( state, 'signup.steps.userExperience', '' );
}
