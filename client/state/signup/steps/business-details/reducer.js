/** @format */

/**
 * Internal dependencies
 */

import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_BUSINESS_ADDRESS_SET,
	SIGNUP_STEPS_BUSINESS_NAME_SET,
} from 'state/action-types';

import { createReducer, combineReducers } from 'state/utils';

const address = createReducer(
	'',
	{
		[ SIGNUP_STEPS_BUSINESS_ADDRESS_SET ]: ( state, action ) => {
			return action.businessAddress;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	{ type: 'string' }
);

const name = createReducer(
	'',
	{
		[ SIGNUP_STEPS_BUSINESS_NAME_SET ]: ( state, action ) => {
			return action.businessName;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	{ type: 'string' }
);

export default combineReducers( {
	address,
	name,
} );
