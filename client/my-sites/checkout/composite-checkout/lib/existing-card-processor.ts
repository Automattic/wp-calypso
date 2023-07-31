import {
	makeSuccessResponse,
	makeRedirectResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import { doesTransactionResponseRequire3DS, handle3DSChallenge } from './stripe-3ds';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { TransactionRequest } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:existing-card-processor' );

type ExistingCardTransactionRequest = Partial< Omit< TransactionRequest, 'paymentMethodType' > > &
	Required<
		Pick<
			TransactionRequest,
			'storedDetailsId' | 'paymentMethodToken' | 'paymentPartnerProcessorId'
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
		stripe,
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
		reduxDispatch,
		responseCart,
	} = dataForProcessor;
	if ( ! stripe ) {
		throw new Error( 'Stripe is required to submit an existing card payment' );
	}
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'existingCard' } ) );

	const cartCountry = responseCart.tax.location.country_code ?? '';
	const formCountry = contactDetails?.countryCode?.value ?? '';
	if ( cartCountry !== formCountry ) {
		// Changes to the contact form data should always be sent to the cart, so
		// this should not be possible.
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_mismatched_tax_location', {
				form_country: formCountry,
				cart_country: cartCountry,
			} )
		);
	}

	const domainDetails = getDomainDetails( contactDetails, {
		includeDomainDetails,
		includeGSuiteDetails,
	} );
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		name: transactionData.name ?? '',
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		domainDetails,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: dataForProcessor.siteId,
			contactDetails: domainDetails ?? null,
			responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );

	return submitWpcomTransaction( formattedTransactionData, dataForProcessor )
		.then( async ( stripeResponse ) => {
			if ( doesTransactionResponseRequire3DS( stripeResponse ) ) {
				debug( 'transaction requires authentication' );
				await handle3DSChallenge(
					reduxDispatch,
					stripe,
					stripeResponse.message.payment_intent_client_secret
				);
				// We must return the original authentication response in order
				// to have access to the order_id so that we can display a
				// pending page while we wait for Stripe to send a webhook to
				// complete the purchase so we do not return the result of
				// confirming the payment intent and instead fall through.
			}
			return stripeResponse;
		} )
		.then( ( stripeResponse ) => {
			const hasPaymentIntent =
				stripeResponse &&
				'message' in stripeResponse &&
				typeof stripeResponse.message !== 'string' &&
				stripeResponse?.message?.payment_intent_client_secret;
			if ( stripeResponse?.redirect_url && ! hasPaymentIntent ) {
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
	if ( ! data.paymentMethodToken ) {
		throw new Error( 'Transaction requires a Stripe token and none was provided' );
	}
	if ( ! data.paymentPartnerProcessorId ) {
		throw new Error( 'Transaction requires a processor id and none was provided' );
	}
	return true;
}
