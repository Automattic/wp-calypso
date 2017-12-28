/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_GOALS_SET } from 'client/state/action-types';

import { createReducer } from 'client/state/utils';
import { siteGoalsSchema } from './schema';

export default createReducer(
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
