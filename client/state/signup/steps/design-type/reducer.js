/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_DESIGN_TYPE_SET } from 'state/action-types';

import { createReducerWithValidation } from 'state/utils';
import { designTypeSchema } from './schema';

export default createReducerWithValidation(
	'',
	{
		[ SIGNUP_STEPS_DESIGN_TYPE_SET ]: ( state, action ) => {
			return action.designType;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	designTypeSchema
);
