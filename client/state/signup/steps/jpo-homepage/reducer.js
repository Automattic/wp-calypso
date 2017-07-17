/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_JPO_HOMEPAGE_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { jpoHomepageSchema } from './schema';

export default createReducer( '',
	{
		[ SIGNUP_STEPS_JPO_HOMEPAGE_SET ]: ( state = '', action ) => {
			return action.homepage;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	jpoHomepageSchema
);