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
import { createTransactionEndpointRequestPayloadFromLineItems } from './translate-cart';
import { getPostalCode, getDomainDetails, wpcomTransaction } from '../payment-method-helpers';
import saveTransactionResponseToWpcomStore from './save-transaction-response-to-wpcom-store';
import type { CardProcessorOptions } from '../types/payment-processors';
import type { TransactionRequestWithLineItems } from '../types/transaction-endpoint';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );
const { select } = defaultRegistry;

export type ExistingCardProcessorData = Omit<
	TransactionRequestWithLineItems,
	'country' | 'postalCode' | 'subdivisionCode' | 'siteId' | 'domainDetails'
>;

export default async function existingCardProcessor(
	submitData: ExistingCardProcessorData,
	dataForProcessor: CardProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		includeDomainDetails,
		includeGSuiteDetails,
		stripeConfiguration,
		recordEvent,
	} = dataForProcessor;
	const country: string | undefined = select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value;
	const subdivisionCode: string | undefined = select( 'wpcom' )?.getContactInfo?.()?.state?.value;
	const siteId: string | undefined = select( 'wpcom' )?.getSiteId?.();
	if ( ! stripeConfiguration ) {
		throw new Error( 'Stripe configuration is required' );
	}
	return submitExistingCardPayment(
		{
			...submitData,
			postalCode: getPostalCode(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			country,
			subdivisionCode,
			siteId,
		},
		dataForProcessor
	)
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
