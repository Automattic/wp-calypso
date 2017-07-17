/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_JPO_SUMMARY_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { jpoSummarySchema } from './schema';

export default createReducer( '',
	{
		[ SIGNUP_STEPS_JPO_SUMMARY_SET ]: ( state = '', action ) => {
			return action.summary;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	jpoSummarySchema
);