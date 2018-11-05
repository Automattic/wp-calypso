/** @format */

/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { PAYMENT_COUNTRY_CODE_SET, PAYMENT_POSTAL_CODE_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { paymentCountryCodeSchema, paymentPostalCodeSchema } from './schema';

/**
 * Checkout Flux Bridge
 *
 * Tap into flux data flows and produce redux actions to track payment country
 * and postcode in order to calculate tax.
 */
import { registerActionForward } from 'lib/redux-bridge';
registerActionForward( 'TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET' );
registerActionForward( 'TRANSACTION_PAYMENT_SET' );

export const extractStoredCardMetaValue = ( action, meta_key ) =>
	( find( get( action, 'payment.storedCard.meta' ), { meta_key } ) || {} ).meta_value;

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
		[ 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET' ]: ( state, action ) =>
			get( action, 'rawDetails.country' ) || state,
		[ 'FLUX_TRANSACTION_PAYMENT_SET' ]: ( state, action ) => {
			return (
				get( action, 'payment.newCardDetails.country' ) ||
				extractStoredCardMetaValue( action, 'country_code' ) ||
				state
			);
		},
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
		[ 'FLUX_TRANSACTION_PAYMENT_SET' ]: ( state, action ) =>
			get( action, 'payment.newCardDetails.postal-code' ) ||
			extractStoredCardMetaValue( action, 'card_zip' ) ||
			state,
		[ 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET' ]: ( state, action ) =>
			get( action, 'rawDetails.postal-code' ) || state,
	},
	paymentPostalCodeSchema
);

export default combineReducers( {
	countryCode,
	postalCode,
} );
