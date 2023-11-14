import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent, recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import {
	doesTransactionResponseRequire3DS,
	handle3DSChallenge,
	handle3DSInFlightError,
} from './stripe-3ds';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

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
	transactionOptions.reduxDispatch(
		recordTransactionBeginAnalytics( { paymentMethodId: webPaymentType } )
	);

	const {
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
		reloadCart,
		siteId,
		contactDetails,
	} = transactionOptions;

	debug( 'formatting web-pay transaction', submitData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		name: submitData.name || '',
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart: responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( 'submitting web-pay transaction', formattedTransactionData );
	let paymentIntentId: string | undefined = undefined;
	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( async ( stripeResponse ) => {
			if ( doesTransactionResponseRequire3DS( stripeResponse ) ) {
				debug( 'transaction requires authentication' );
				paymentIntentId = stripeResponse.message.payment_intent_id;
				await handle3DSChallenge(
					transactionOptions.reduxDispatch,
					submitData.stripe,
					stripeResponse.message.payment_intent_client_secret,
					paymentIntentId
				);
				// We must return the original authentication response in order
				// to have access to the order_id so that we can display a
				// pending page while we wait for Stripe to send a webhook to
				// complete the purchase so we do not return the result of
				// confirming the payment intent and instead fall through.
			}
			return stripeResponse;
		} )
		.then( makeSuccessResponse )
		.catch( ( error: Error ) => {
			debug( 'transaction failed' );
			transactionOptions.reduxDispatch(
				recordTracksEvent( 'calypso_checkout_web_pay_transaction_failed', {
					payment_intent_id: paymentIntentId ?? '',
					error: error.message,
				} )
			);
			logStashEvent( 'calypso_checkout_web_pay_transaction_failed', {
				payment_intent_id: paymentIntentId ?? '',
				tags: [ `payment_intent_id:${ paymentIntentId }` ],
				error: error.message,
			} );

			handle3DSInFlightError( error, paymentIntentId );

			// Refresh the cart in case things have changed during the transaction.
			reloadCart();

			// Errors here are "expected" errors, meaning that they (hopefully) come
			// from the endpoint and not from some bug in the frontend code.
			return makeErrorResponse( error.message );
		} );
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
