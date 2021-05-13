/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_USER_EXPERIENCE_SET } from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function setUserExperience( userExperience ) {
	return {
		type: SIGNUP_STEPS_USER_EXPERIENCE_SET,
		userExperience,
	};
}
