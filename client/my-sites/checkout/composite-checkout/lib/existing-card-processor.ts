/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	makeSuccessResponse,
	makeRedirectResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { TransactionRequest } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';

const debug = debugFactory( 'calypso:composite-checkout:existing-card-processor' );

type ExistingCardTransactionRequest = Partial< Omit< TransactionRequest, 'paymentMethodType' > > &
	Required<
		Pick<
			TransactionRequest,
			'name' | 'storedDetailsId' | 'paymentMethodToken' | 'paymentPartnerProcessorId'
		>
	>;

export default async function existingCardProcessor(
	transactionData: unknown,
	dataForProcessor: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const {
		stripeConfiguration,
		recordEvent,
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
	} = dataForProcessor;
	if ( ! stripeConfiguration ) {
		throw new Error( 'Stripe configuration is required' );
	}

	const domainDetails = getDomainDetails( contactDetails, {
		includeDomainDetails,
		includeGSuiteDetails,
	} );
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		siteId: dataForProcessor.siteId ? String( dataForProcessor.siteId ) : undefined,
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		domainDetails,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: dataForProcessor.siteId ? String( dataForProcessor.siteId ) : undefined,
			contactDetails: domainDetails ?? null,
			responseCart: dataForProcessor.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );

	return submitWpcomTransaction( formattedTransactionData, dataForProcessor )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				debug( 'transaction requires authentication' );
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
				debug( 'transaction requires redirect' );
				return makeRedirectResponse( stripeResponse.redirect_url );
			}
			debug( 'transaction was successful' );
			return makeSuccessResponse( stripeResponse );
		} )
		.catch( ( error ) => {
			debug( 'transaction failed' );
			// Errors here are "expected" errors, meaning that they (hopefully) come
			// from the endpoint and not from some bug in the frontend code.
			return makeErrorResponse( error.message );
		} );
}

function isValidTransactionData(
	submitData: unknown
): submitData is ExistingCardTransactionRequest {
	const data = submitData as ExistingCardTransactionRequest;
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
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
