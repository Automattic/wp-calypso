/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
} from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { confirmStripePaymentIntent, createStripePaymentMethod } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import getPostalCode from './get-postal-code';
import getDomainDetails from './get-domain-details';
import { createEbanxToken } from 'calypso/lib/store-transactions';
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
const debug = debugFactory( 'calypso:composite-checkout:multi-partner-card-processor' );

type CardTransactionRequest = {
	paymentPartner: string;
};

type StripeCardTransactionRequest = {
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	name: string;
	countryCode: string | undefined;
	postalCode: string | undefined;
};

type EbanxCardTransactionRequest = {
	name: string;
	countryCode: string;
	number: string;
	cvv: string;
	'expiration-date': string;
	state: string;
	city: string;
	postalCode: string;
	address: string;
	streetNumber: string;
	phoneNumber: string;
	document: string;
};

type SubmitCardTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

type EbanxToken = {
	deviceId: string;
	token: string;
};

async function stripeCardProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidStripeCardTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const {
		includeDomainDetails,
		includeGSuiteDetails,
		recordEvent: onEvent,
		responseCart,
	} = transactionOptions;

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	const { id: paymentMethodToken } = await createStripePaymentMethodToken( {
		...submitData,
		country: managedContactDetails?.countryCode?.value,
		postalCode: getPostalCode(),
	} );

	return submitStripeCardTransaction(
		{
			...submitData,
			couponId: responseCart.coupon,
			country: managedContactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode(),
			subdivisionCode: managedContactDetails?.state?.value,
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		transactionOptions
	)
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
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

async function ebanxCardProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidEbanxCardTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const { includeDomainDetails, includeGSuiteDetails, responseCart, siteId } = transactionOptions;

	const paymentMethodToken: EbanxToken = await createEbanxToken( 'new_purchase', {
		country: submitData.countryCode,
		name: submitData.name,
		number: submitData.number,
		cvv: submitData.cvv,
		'expiration-date': submitData[ 'expiration-date' ],
	} );

	return submitEbanxCardTransaction(
		{
			...submitData,
			couponId: responseCart.coupon,
			country: submitData.countryCode,
			siteId: siteId ? String( siteId ) : undefined,
			deviceId: paymentMethodToken?.deviceId,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken: paymentMethodToken.token,
		},
		transactionOptions
	).then( makeSuccessResponse );
}

export default async function multiPartnerCardProcessor(
	submitData: unknown,
	dataForProcessor: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidMultiPartnerTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const paymentPartner = submitData.paymentPartner;
	if ( paymentPartner === 'stripe' ) {
		return stripeCardProcessor( submitData, dataForProcessor );
	}
	if ( paymentPartner === 'ebanx' ) {
		return ebanxCardProcessor( submitData, dataForProcessor );
	}
	throw new RangeError( 'Unrecognized card payment partner: "' + paymentPartner + '"' );
}

function isValidMultiPartnerTransactionData(
	submitData: unknown
): submitData is CardTransactionRequest {
	const data = submitData as CardTransactionRequest;
	if ( ! data?.paymentPartner ) {
		throw new Error( 'Transaction requires paymentPartner and none was provided' );
	}
	return true;
}

function isValidStripeCardTransactionData(
	submitData: unknown
): submitData is StripeCardTransactionRequest {
	const data = submitData as StripeCardTransactionRequest;
	if ( ! data?.stripe ) {
		throw new Error( 'Transaction requires stripe and none was provided' );
	}
	if ( ! data?.stripeConfiguration ) {
		throw new Error( 'Transaction requires stripeConfiguration and none was provided' );
	}
	return true;
}

function isValidEbanxCardTransactionData(
	submitData: unknown
): submitData is EbanxCardTransactionRequest {
	const data = submitData as EbanxCardTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}

async function submitStripeCardTransaction(
	transactionData: SubmitCardTransactionData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodToken: transactionData.paymentMethodToken,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( 'sending stripe transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}

function createStripePaymentMethodToken( {
	stripe,
	name,
	country,
	postalCode,
}: {
	stripe: Stripe;
	name: string | undefined;
	country: string | undefined;
	postalCode: string | undefined;
} ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}

async function submitEbanxCardTransaction(
	transactionData: SubmitCardTransactionData,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodToken: transactionData.paymentMethodToken,
		paymentMethodType: 'WPCOM_Billing_Ebanx',
	} );
	debug( 'sending ebanx transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions );
}
