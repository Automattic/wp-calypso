/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_TITLE_SET } from 'client/state/action-types';

import { createReducer } from 'client/state/utils';
import { siteTitleSchema } from './schema';

export default createReducer(
	'',
	{
		[ SIGNUP_STEPS_SITE_TITLE_SET ]: ( state, action ) => {
			return action.siteTitle;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	siteTitleSchema
);
