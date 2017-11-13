/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_DESIGN_TYPE_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { designTypeSchema } from './schema';

export default createReducer(
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
