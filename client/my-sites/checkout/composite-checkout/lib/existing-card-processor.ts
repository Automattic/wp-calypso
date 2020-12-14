/**
 * External dependencies
 */
import debugFactory from 'debug';
import { makeSuccessResponse, makeRedirectResponse } from '@automattic/composite-checkout';
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { createTransactionEndpointRequestPayloadFromLineItems } from './translate-cart';
import { wpcomTransaction } from '../payment-method-helpers';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { TransactionRequestWithLineItems } from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );

export default async function existingCardProcessor(
	transactionData: unknown,
	dataForProcessor: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const { stripeConfiguration, recordEvent } = dataForProcessor;
	if ( ! stripeConfiguration ) {
		throw new Error( 'Stripe configuration is required' );
	}
	return submitExistingCardPayment( transactionData, dataForProcessor )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				recordEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
				return confirmStripePaymentIntent(
					stripeConfiguration,
					stripeResponse?.message?.payment_intent_client_secret
				);
			}
			return stripeResponse;
		} )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.redirect_url ) {
				return makeRedirectResponse( stripeResponse.redirect_url );
			}
			return makeSuccessResponse( stripeResponse );
		} );
}

async function submitExistingCardPayment(
	transactionData: ExistingCardTransactionRequest,
	transactionOptions: PaymentProcessorOptions
) {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );

	return wpcomTransaction( formattedTransactionData, transactionOptions );
}

type ExistingCardTransactionRequest = Omit< TransactionRequestWithLineItems, 'paymentMethodType' >;

function isValidTransactionData(
	submitData: unknown
): submitData is ExistingCardTransactionRequest {
	const data = submitData as ExistingCardTransactionRequest;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
	if ( ! data.siteId ) {
		throw new Error( 'Transaction requires siteId and none was provided' );
	}
	if ( ! data.country ) {
		throw new Error( 'Transaction requires country code and none was provided' );
	}
	if ( ! data.postalCode ) {
		throw new Error( 'Transaction requires postal code and none was provided' );
	}
	if ( ! data.storedDetailsId ) {
		throw new Error( 'Transaction requires saved card information and none was provided' );
	}
	if ( ! data.name ) {
		throw new Error( 'Transaction requires cardholder name and none was provided' );
	}
	if ( ! data.paymentMethodToken ) {
		throw new Error( 'Transaction requires a Stripe token and none was provided' );
	}
	if ( ! data.paymentPartnerProcessorId ) {
		throw new Error( 'Transaction requires a processor id and none was provided' );
	}
	return true;
}
