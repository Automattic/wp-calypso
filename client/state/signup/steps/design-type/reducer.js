/**
 * Internal dependencies
 */
import { designTypeSchema } from './schema';
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_DESIGN_TYPE_SET } from 'state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( '',
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
