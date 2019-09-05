/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_GOALS_SET } from 'state/action-types';

import { createReducerWithValidation } from 'state/utils';
import { siteGoalsSchema } from './schema';

export default createReducerWithValidation(
	'',
	{
		[ SIGNUP_STEPS_SITE_GOALS_SET ]: ( state, action ) => {
			return action.siteGoals;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	siteGoalsSchema
);
