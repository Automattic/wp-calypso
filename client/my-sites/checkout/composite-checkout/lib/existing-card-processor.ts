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
import saveTransactionResponseToWpcomStore from './save-transaction-response-to-wpcom-store';
import type { CardProcessorOptions } from '../types/payment-processors';
import type { TransactionRequestWithLineItems } from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );

export default async function existingCardProcessor(
	transactionData: unknown,
	dataForProcessor: CardProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const { stripeConfiguration, recordEvent } = dataForProcessor;
	if ( ! stripeConfiguration ) {
		throw new Error( 'Stripe configuration is required' );
	}
	return submitExistingCardPayment( transactionData, dataForProcessor )
		.then( saveTransactionResponseToWpcomStore )
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
	transactionData: TransactionRequestWithLineItems,
	transactionOptions: CardProcessorOptions
) {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );

	return wpcomTransaction( formattedTransactionData, transactionOptions );
}

function isValidTransactionData(
	submitData: unknown
): submitData is TransactionRequestWithLineItems {
	const data = submitData as TransactionRequestWithLineItems;
	if ( ! ( data?.items?.length > 0 ) ) {
		return false;
	}
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
	if (
		! data.siteId ||
		! data.country ||
		! data.postalCode ||
		! data.storedDetailsId ||
		! data.name ||
		! data.paymentMethodType ||
		! data.paymentMethodToken ||
		! data.paymentPartnerProcessorId
	) {
		return false;
	}
	return true;
}
