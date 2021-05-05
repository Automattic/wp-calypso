/**
 * External dependencies
 */
import debugFactory from 'debug';
import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import getPostalCode from './get-postal-code';
import getDomainDetails from './get-domain-details';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';

const debug = debugFactory( 'calypso:composite-checkout:web-pay-processor' );

type WebPayTransactionRequest = {
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	paymentMethodToken: string;
	name: string | undefined;
};

export default async function webPayProcessor(
	webPaymentType: 'google-pay' | 'apple-pay',
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidWebPayTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const webPaymentEventType =
		webPaymentType === 'google-pay'
			? 'GOOGLE_PAY_TRANSACTION_BEGIN'
			: 'APPLE_PAY_TRANSACTION_BEGIN';
	transactionOptions.recordEvent( { type: webPaymentEventType } );

	const {
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
		siteId,
		contactDetails,
	} = transactionOptions;

	debug( 'formatting web-pay transaction', submitData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		name: submitData.name || '',
		siteId: siteId ? String( siteId ) : undefined,
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: siteId ? String( siteId ) : undefined,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart: responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( 'submitting web-pay transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( makeSuccessResponse )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

function isValidWebPayTransactionData(
	submitData: unknown
): submitData is WebPayTransactionRequest {
	const data = submitData as WebPayTransactionRequest;
	if ( ! data?.stripe ) {
		throw new Error( 'Transaction requires stripe and none was provided' );
	}
	if ( ! data?.stripeConfiguration ) {
		throw new Error( 'Transaction requires stripeConfiguration and none was provided' );
	}
	return true;
}
