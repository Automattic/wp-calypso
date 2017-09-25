/**
 * Internal dependencies
 */
import { siteTitleSchema } from './schema';
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_TITLE_SET } from 'state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( '',
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
