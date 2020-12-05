/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
} from '@automattic/composite-checkout';
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { createTransactionEndpointRequestPayloadFromLineItems } from '../types/transaction-endpoint';
import { getPostalCode, getDomainDetails, wpcomTransaction } from '../payment-method-helpers';
import saveTransactionResponseToWpcomStore from './save-transaction-response-to-wpcom-store';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );
const { select } = defaultRegistry;

export default async function existingCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, recordEvent },
	transactionOptions
): Promise< PaymentProcessorResponse > {
	return submitExistingCardPayment(
		{
			...submitData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		wpcomTransaction,
		transactionOptions
	)
		.then( saveTransactionResponseToWpcomStore )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				recordEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
				return confirmStripePaymentIntent(
					submitData.stripeConfiguration,
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

async function submitExistingCardPayment( transactionData, submit, transactionOptions ) {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}
