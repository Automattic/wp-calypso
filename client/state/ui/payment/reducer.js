/** @format */

/**
 * Internal dependencies
 */
import {
	PAYMENT_COUNTRY_CODE_SET,
	PAYMENT_POSTAL_CODE_SET,
	PAYMENT_TAX_RATE_SET,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { paymentCountryCodeSchema, paymentPostalCodeSchema, paymentTaxRateSchema } from './schema';

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

/**
 * Returns the updated state after a postalCode has been set.
 *
 * @param  {Object} state - The current global state.
 * @param  {Object} action - The action object containing the new postalCode.
 * @return {Object} - The updated global state.
 */
export const postalCode = createReducer(
	null,
	{
		[ PAYMENT_POSTAL_CODE_SET ]: ( state, action ) => action.postalCode,
	},
	paymentPostalCodeSchema
);

/**
 * Returns the updated state after a tax rate has been set.
 *
 * @param  {Object} state - The current global state.
 * @param  {Object} action - The action object containing the new tax rate.
 * @return {Object} - The updated global state.
 */
export const taxRate = createReducer(
	null,
	{
		[ PAYMENT_TAX_RATE_SET ]: ( state, action ) => action.taxRate,
	},
	paymentTaxRateSchema
);

export default combineReducers( {
	countryCode,
	postalCode,
	taxRate,
} );
