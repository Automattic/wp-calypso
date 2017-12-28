/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_USER_EXPERIENCE_SET } from 'client/state/action-types';

import { createReducer } from 'client/state/utils';
import { userExperienceSchema } from './schema';

export default createReducer(
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
