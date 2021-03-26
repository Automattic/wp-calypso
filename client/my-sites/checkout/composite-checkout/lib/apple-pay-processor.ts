/**
 * External dependencies
 */
import debugFactory from 'debug';
import { defaultRegistry, makeSuccessResponse } from '@automattic/composite-checkout';
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
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import type {
	TransactionRequest,
	WPCOMTransactionEndpointResponse,
} from '../types/transaction-endpoint';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:apple-pay-processor' );

type ApplePayTransactionRequest = {
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	paymentMethodToken: string;
	name: string | undefined;
};

type ApplePaySubmitData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default async function applePayProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidApplePayTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const { includeDomainDetails, includeGSuiteDetails, responseCart, siteId } = transactionOptions;

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	return submitApplePayPayment(
		{
			...submitData,
			couponId: responseCart.coupon,
			name: submitData.name || '',
			siteId: siteId ? String( siteId ) : undefined,
			country: managedContactDetails?.countryCode?.value ?? '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			postalCode: getPostalCode(),
		},
		transactionOptions
	).then( makeSuccessResponse );
}

async function submitApplePayPayment(
	transactionData: ApplePaySubmitData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting apple-pay transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( 'submitting apple-pay transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}

function isValidApplePayTransactionData(
	submitData: unknown
): submitData is ApplePayTransactionRequest {
	const data = submitData as ApplePayTransactionRequest;
	if ( ! data?.stripe ) {
		throw new Error( 'Transaction requires stripe and none was provided' );
	}
	if ( ! data?.stripeConfiguration ) {
		throw new Error( 'Transaction requires stripeConfiguration and none was provided' );
	}
	return true;
}
