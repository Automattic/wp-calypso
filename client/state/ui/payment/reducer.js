/**
 * External dependencies
 */
import { find, get, has } from 'lodash';

/**
 * Internal dependencies
 */
import { PAYMENT_COUNTRY_CODE_SET, PAYMENT_POSTAL_CODE_SET } from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
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
 * @param  {object} state - The current global state.
 * @param  {object} action - The action object containing the new country code.
 * @returns {object} - The updated global state.
 */
export const countryCode = withSchemaValidation(
	paymentCountryCodeSchema,
	( state = null, action ) => {
		switch ( action.type ) {
			case PAYMENT_COUNTRY_CODE_SET:
				return action.countryCode;
			case 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET':
				return has( action, 'rawDetails.country' )
					? get( action, 'rawDetails.country', null )
					: state;
			case 'FLUX_TRANSACTION_PAYMENT_SET': {
				const { payment } = action;
				if ( has( payment, 'newCardDetails' ) ) {
					return get( payment, 'newCardDetails.country', null );
				}
				if ( has( payment, 'storedCard' ) ) {
					return extractStoredCardMetaValue( action, 'country_code' ) || null;
				}
				return state;
			}
		}

		return state;
	}
);

/**
 * Returns the updated state after a postalCode has been set.
 *
 * @param  {object} state - The current global state.
 * @param  {object} action - The action object containing the new postalCode.
 * @returns {object} - The updated global state.
 */
export const postalCode = withSchemaValidation(
	paymentPostalCodeSchema,
	( state = null, action ) => {
		switch ( action.type ) {
			case PAYMENT_POSTAL_CODE_SET:
				return action.postalCode;
			case 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET':
				return has( action, 'rawDetails.postal-code' )
					? get( action, 'rawDetails.postal-code', null )
					: state;
			case 'FLUX_TRANSACTION_PAYMENT_SET': {
				const { payment } = action;
				if ( has( payment, 'newCardDetails' ) ) {
					return get( payment, 'newCardDetails.postal-code', null );
				}

				if ( has( payment, 'storedCard' ) ) {
					return extractStoredCardMetaValue( action, 'card_zip' ) || null;
				}

				return state;
			}
		}

		return state;
	}
);

export default combineReducers( {
	countryCode,
	postalCode,
} );
