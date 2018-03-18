/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_GOALS_ARRAY_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteGoalsArraySchema } from './schema';

export default createReducer(
	[],
	{
		[ SIGNUP_STEPS_SITE_GOALS_ARRAY_SET ]: ( state, action ) => {
			return action.siteGoalsArray;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return [];
		},
	},
	siteGoalsArraySchema
);
