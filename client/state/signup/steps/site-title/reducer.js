/** @format */

/**
 * Internal dependencies
 */

import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_SITE_TITLE_SET,
	SIGNUP_STEPS_SITE_INFORMATION_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteTitleSchema } from './schema';

export default createReducer(
	'',
	{
		[ SIGNUP_STEPS_SITE_TITLE_SET ]: ( state, action ) => {
			return action.siteTitle;
		},
		// The onboarding journey incorporates site title into a consolidated site information object.
		// Since the onboarding journey isn't the default, we'll update the current title value here to ensure state congruity.
		// When `steps/site-information` becomes part of the default journey, we can remove `steps/site-title` and replace the selections/actions.
		[ SIGNUP_STEPS_SITE_INFORMATION_SET ]: ( state, { data } ) => {
			return data.title || state;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	siteTitleSchema
);
