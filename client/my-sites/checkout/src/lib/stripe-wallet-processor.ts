import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import { addUrlToPendingPageRedirect } from './pending-page';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { StripeElements } from '@stripe/stripe-js';

const debug = debugFactory( 'calypso:composite-checkout:stripe-wallet-processor' );

type StripeWalletTransactionRequest = {
	elements: StripeElements;
	expressPaymentType: string;
};

export default async function stripeWalletProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const {
		stripe,
		stripeConfiguration,
		responseCart,
		contactDetails,
		siteSlug,
		siteId,
		fromSiteSlug,
		getThankYouUrl,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
	} = transactionOptions;

	if ( ! stripe ) {
		throw new Error( 'Stripe is required for stripe-wallet payment' );
	}

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'stripe-wallet' } ) );

	const { elements } = submitData;

	// Build the pending-page URL used as return_url for stripe.confirmPayment and
	// as the success landing URL after an inline confirm.
	const thankYouUrl = getThankYouUrl() || 'https://wordpress.com';
	const successUrl = addUrlToPendingPageRedirect( thankYouUrl, {
		siteSlug,
		fromSiteSlug,
		urlType: 'absolute',
	} );

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Stripe_Wallet',
		paymentPartnerProcessorId: stripeConfiguration?.processor_id,
		successUrl,
		name: contactDetails?.firstName?.value ?? '',
		email: contactDetails?.email?.value,
	} );

	debug( 'sending stripe-wallet transaction', formattedTransactionData );

	let clientSecret: string;
	let orderId: number | '' = '';

	try {
		const response = await submitWpcomTransaction( formattedTransactionData, transactionOptions );
		const message = ( response as { message?: unknown } ).message;

		if (
			! message ||
			typeof message !== 'object' ||
			! ( 'payment_intent_client_secret' in message )
		) {
			throw new Error( 'Server did not return a payment intent client secret' );
		}

		clientSecret = String(
			( message as { payment_intent_client_secret: string } ).payment_intent_client_secret
		);
		orderId = ( response as { order_id?: number | '' } ).order_id ?? '';
	} catch ( error ) {
		debug( 'transaction submission failed', error );
		return makeErrorResponse( ( error as Error ).message );
	}

	// Confirm the PaymentIntent client-side. redirect:'if_required' means Stripe.js
	// only navigates away when the payment method genuinely requires a browser redirect
	// (e.g. 3DS); otherwise the promise resolves inline and we route to the pending page.
	debug( 'confirming payment client-side', { orderId } );
	const { error: confirmError } = await stripe.confirmPayment( {
		elements,
		clientSecret,
		confirmParams: { return_url: successUrl },
		redirect: 'if_required',
	} );

	if ( confirmError ) {
		debug( 'stripe.confirmPayment failed', confirmError );
		return makeErrorResponse( confirmError.message ?? 'Payment confirmation failed' );
	}

	// Inline confirm succeeded — return success so composite-checkout routes to the
	// pending page, which will poll for the webhook-driven provisioning.
	return makeSuccessResponse( { order_id: orderId } );
}

function isValidTransactionData(
	submitData: unknown
): submitData is StripeWalletTransactionRequest {
	const data = submitData as StripeWalletTransactionRequest;
	if ( ! data?.elements ) {
		throw new Error( 'Transaction requires Stripe Elements and none was provided' );
	}
	if ( ! data?.expressPaymentType ) {
		throw new Error( 'Transaction requires expressPaymentType and none was provided' );
	}
	return true;
}
