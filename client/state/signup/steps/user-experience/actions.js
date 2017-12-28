/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_USER_EXPERIENCE_SET } from 'client/state/action-types';

export function setUserExperience( userExperience ) {
	return {
		type: SIGNUP_STEPS_USER_EXPERIENCE_SET,
		userExperience,
	};
}
