/** @format */

/**
 * External dependencies
 */
import { find, get, has } from 'lodash';

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
			has( action, 'rawDetails.country' ) ? get( action, 'rawDetails.country', null ) : state,
		[ 'FLUX_TRANSACTION_PAYMENT_SET' ]: ( state, action ) => {
			const { payment } = action;
			if ( has( payment, 'newCardDetails' ) ) {
				return get( payment, 'newCardDetails.country', null );
			}
			if ( has( payment, 'storedCard' ) ) {
				return extractStoredCardMetaValue( action, 'country_code' ) || null;
			}
			return state;
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
		[ 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET' ]: ( state, action ) =>
			has( action, 'rawDetails.postal-code' )
				? get( action, 'rawDetails.postal-code', null )
				: state,
		[ 'FLUX_TRANSACTION_PAYMENT_SET' ]: ( state, action ) => {
			const { payment } = action;
			if ( has( payment, 'newCardDetails' ) ) {
				return get( payment, 'newCardDetails.postal-code', null );
			}

			if ( has( payment, 'storedCard' ) ) {
				return extractStoredCardMetaValue( action, 'card_zip' ) || null;
			}

			return state;
		},
	},
	paymentPostalCodeSchema
);

export default combineReducers( {
	countryCode,
	postalCode,
} );
