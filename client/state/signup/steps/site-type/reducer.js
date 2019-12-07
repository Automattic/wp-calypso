/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';

import { createReducerWithValidation } from 'state/utils';
import { siteTypeSchema } from './schema';

export default createReducerWithValidation(
	'',
	{
		[ SIGNUP_STEPS_SITE_TYPE_SET ]: ( state, action ) => {
			return action.siteType;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	siteTypeSchema
);
