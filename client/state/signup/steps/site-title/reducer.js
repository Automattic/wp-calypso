/**
 * Internal dependencies
 */
import {
	SIGNUP_STEPS_SITE_TITLE,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteTitleSchema } from './schema';

export default createReducer( '',
	{
		[ SIGNUP_STEPS_SITE_TITLE ]: ( state = {}, action ) => {
			return action.siteTitle;
		},
	},
	siteTitleSchema
);
