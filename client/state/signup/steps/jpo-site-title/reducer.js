/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_JPO_SITE_TITLE_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { jpoSiteTitleSchema } from './schema';

export default createReducer( '',
	{
		[ SIGNUP_STEPS_JPO_SITE_TITLE_SET ]: ( state = '', action ) => {
			return action.jpoSiteTitle;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	jpoSiteTitleSchema
);