/** @format */

/**
 * Internal dependencies
 */
import { PAYMENT_COUNTRY_CODE_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { paymentCountryCodeSchema } from './schema';

/**
 * Returns the updated state after a country code has been set.
 *
 * @param  {Object} state - The current global state.
 * @param  {Object} action - The action object containing the new country code.
 * @return {Object} - The updated global state.
 */
export const countryCode = createReducer(
	null,
	{
		[ PAYMENT_COUNTRY_CODE_SET ]: ( state, action ) => action.countryCode,
	},
	paymentCountryCodeSchema
);

export default combineReducers( { countryCode } );
