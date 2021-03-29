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
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { TransactionRequest } from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );

type ExistingCardTransactionRequest = Omit<
	Partial< TransactionRequest > &
		Required<
			Pick<
				TransactionRequest,
				| 'country'
				| 'postalCode'
				| 'name'
				| 'storedDetailsId'
				| 'siteId'
				| 'paymentMethodToken'
				| 'paymentPartnerProcessorId'
			>
		>,
	'paymentMethodType'
>;

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
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );

	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}

function isValidTransactionData(
	submitData: unknown
): submitData is ExistingCardTransactionRequest {
	const data = submitData as ExistingCardTransactionRequest;
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
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
