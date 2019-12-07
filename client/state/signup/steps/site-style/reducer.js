/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_STYLE_SET } from 'state/action-types';

import { createReducerWithValidation } from 'state/utils';
import { siteStyleSchema } from './schema';

export default createReducerWithValidation(
	'',
	{
		[ SIGNUP_STEPS_SITE_STYLE_SET ]: ( state, action ) => {
			return action.siteStyle;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	siteStyleSchema
);
