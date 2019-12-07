/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_USER_EXPERIENCE_SET } from 'state/action-types';

import { createReducerWithValidation } from 'state/utils';
import { userExperienceSchema } from './schema';

export default createReducerWithValidation(
	'',
	{
		[ SIGNUP_STEPS_USER_EXPERIENCE_SET ]: ( state, action ) => {
			return action.userExperience;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	userExperienceSchema
);
