/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_RIVET_ADDRESS_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { rivetAddressSchema } from './schema';

export default createReducer(
	'',
	{
		[ SIGNUP_STEPS_RIVET_ADDRESS_SET ]: ( state, action ) => {
			return action.rivetAddress;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	rivetAddressSchema
);
