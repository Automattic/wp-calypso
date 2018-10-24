/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
// import { http } from 'state/data-layer/wpcom-http/actions';
// import { PAYMENT_TAX_RATE_REQUEST } from 'state/action-types';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import config from 'config';
import debug from 'debug';
import { setPaymentTaxRate, setPaymentPostcode } from 'state/ui/payment/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';
import { convertToSnakeCase } from 'state/data-layer/utils';
import { isValidPostalCode } from 'lib/postal-code';

// placeholders
import { dummyTaxRate } from 'lib/tax';

const log = debug( 'calypso:daya-layer:tax' );

export const fetchTaxRate = action => ( dispatch, getState ) => {
	// We need to return a thunk here to get the countryCode.
	// If we can have the original action pass the postalCode + countryCode
	// we can drop that extra `(dispatch, getState) => ...` and simplify things
	// here

	if ( ! config.isEnabled( 'show-tax' ) ) {
		log( 'not enabled' );
		return [];
	}

	const postalCode = get( action, 'rawDetails.postal-code' ); // FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET

	if ( ! postalCode ) {
		log( 'no postalCode' );
		return [];
	}

	const countryCode = getPaymentCountryCode( getState() );
	const countriesWithTaxEnabled = { US: true };

	if ( ! isValidPostalCode( postalCode ) ) {
		log( 'invalid postal code', postalCode );
		return [];
	}

	if ( ! countriesWithTaxEnabled[ countryCode ] ) {
		log( 'country not enabled', countryCode );
		return [];
	}

	log( 'fetching tax rate', countryCode, postalCode );

	const tracksData = convertToSnakeCase( {
		countryCode,
		postalCode,
		source_action: JSON.stringify( action ),
	} );

	// Placeholder: Once we add a http request, this will come out of
	// receiveSuccess instead
	dispatch( setPaymentTaxRate( dummyTaxRate( postalCode, countryCode ) ) );

	return (
		[
			// Note: Once we get a path, we need to:
			// 1. move this file into the matching directory
			// 2. update the registerHandlers() call below,
			// 3. update the import in client/state/ui/payment/actions.js
			//
			// http(
			// 	{
			// 		path: ???,
			// 		method: 'GET',
			// 	},
			// 	action
			// ),
			// TEMP: this belongs in the form, or at least in it's own middleware
			setPaymentPostcode( postalCode ),
			recordTracksEvent( 'calypso_tax_rate_request', tracksData ),
		]
			// if we drop the thunk we should be able to skip this dispatch step,
			// return the plain array, and let dispatchRequestEx work it's magic.
			.map( dispatch )
	);
};

export const receiveSuccess = ( action, data ) => {
	const taxRate = get( data, 'combined_rate' );
	log( 'received tax rate', taxRate, data );
	const tracksData = {
		postal_code: action.postalCode,
		country_code: action.countryCode,
		tax_rate: taxRate,
		source_action: JSON.stringify( action ),
	};
	return [
		recordTracksEvent( 'calypso_tax_rate_request_success', tracksData ),
		setPaymentTaxRate( get( data, 'combined_rate' ) ),
	];
};

export const receiveError = ( action, { error: code, message } ) => [
	recordTracksEvent( 'calypso_tax_rate_request_error', {
		error_code: code,
		error_message: message,
		source_action: JSON.stringify( action ),
	} ),
];

const fetchTaxRateRequest = dispatchRequestEx( {
	fetch: fetchTaxRate,
	onSuccess: receiveSuccess,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/tax/index.js', {
	// [ PAYMENT_TAX_RATE_REQUEST ]: [ fetchTaxRateRequest ]
	[ 'FLUX_TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET' ]: [ fetchTaxRateRequest ],
} );
