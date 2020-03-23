/**
 * External dependencies
 */

import { get } from 'lodash';

export function getUserExperience( state ) {
	return get( state, 'signup.steps.userExperience', '' );
}
