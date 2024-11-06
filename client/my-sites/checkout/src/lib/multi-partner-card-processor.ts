import { createStripePaymentMethod } from '@automattic/calypso-stripe';
import {
	makeSuccessResponse,
	makeRedirectResponse,
	makeErrorResponse,
	PaymentProcessorResponseType,
} from '@automattic/composite-checkout';
import { getContactDetailsType } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { createEbanxToken } from 'calypso/lib/store-transactions';
import { assignNewCardProcessor } from 'calypso/me/purchases/manage-purchase/payment-method-selector/assignment-processor-functions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent, recordTransactionBeginAnalytics } from '../lib/analytics';
import existingCardProcessor from './existing-card-processor';
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
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';
import type { LocalizeProps } from 'i18n-calypso';

const debug = debugFactory( 'calypso:composite-checkout:multi-partner-card-processor' );

type CardTransactionRequest = {
	paymentPartner: string;
};

type StripeCardTransactionRequest = {
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	paymentPartner: string;
	name: string;
	countryCode: string | undefined;
	postalCode: string | undefined;
	cardNumberElement: StripeCardNumberElement;
	useForAllSubscriptions: boolean;
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
		responseCart,
		siteId,
		contactDetails,
		reduxDispatch,
	} = transactionOptions;
	reduxDispatch(
		recordTransactionBeginAnalytics( {
			paymentMethodId: 'stripe',
			useForAllSubscriptions: submitData.useForAllSubscriptions,
		} )
	);

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

	let paymentMethodToken;
	try {
		const tokenResponse = await createStripePaymentMethodToken( {
			...submitData,
			country: contactDetails?.countryCode?.value,
			postalCode: getPostalCode( contactDetails ),
		} );
		paymentMethodToken = tokenResponse.id;
	} catch ( error ) {
		debug( 'transaction failed' );
		// Errors here are "expected" errors, meaning that they (hopefully) come
		// from stripe and not from some bug in the frontend code.
		return makeErrorResponse( ( error as Error ).message );
	}

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		country: contactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode( contactDetails ),
		subdivisionCode: contactDetails?.state?.value,
		siteId: transactionOptions.siteId ? String( transactionOptions.siteId ) : undefined,
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		paymentMethodToken,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart: responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionOptions.stripeConfiguration?.processor_id,
	} );
	debug( 'sending stripe transaction', formattedTransactionData );
	let paymentIntentId: string | undefined = undefined;
	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( async ( stripeResponse ) => {
			if ( doesTransactionResponseRequire3DS( stripeResponse ) ) {
				debug( 'transaction requires authentication' );
				paymentIntentId = stripeResponse.message.payment_intent_id;
				await handle3DSChallenge(
					reduxDispatch,
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
		.then( ( stripeResponse ) => {
			if ( stripeResponse.redirect_url && ! doesTransactionResponseRequire3DS( stripeResponse ) ) {
				return makeRedirectResponse( stripeResponse.redirect_url );
			}
			return makeSuccessResponse( stripeResponse );
		} )
		.catch( ( error: Error ) => {
			debug( 'transaction failed' );
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_card_transaction_failed', {
					payment_intent_id: paymentIntentId ?? '',
					error: error.message,
				} )
			);
			logStashEvent( 'calypso_checkout_card_transaction_failed', {
				payment_intent_id: paymentIntentId ?? '',
				tags: [ `payment_intent_id:${ paymentIntentId }` ],
				error: error.message,
			} );

			handle3DSInFlightError( error, paymentIntentId );

			// Errors here are "expected" errors, meaning that they (hopefully) come
			// from the endpoint and not from some bug in the frontend code.
			return makeErrorResponse( error.message );
		} );
}

async function ebanxCardProcessor(
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidEbanxCardTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}
	const {
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
		contactDetails,
		reduxDispatch,
	} = transactionOptions;
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'ebanx' } ) );

	let paymentMethodToken;
	try {
		const ebanxTokenResponse: EbanxToken = await createEbanxToken( 'new_purchase', {
			country: submitData.countryCode,
			name: submitData.name,
			number: submitData.number,
			cvv: submitData.cvv,
			'expiration-date': submitData[ 'expiration-date' ],
		} );
		paymentMethodToken = ebanxTokenResponse;
	} catch ( error ) {
		debug( 'transaction failed' );
		// Errors here are "expected" errors, meaning that they (hopefully) come
		// from Ebanx and not from some bug in the frontend code.
		return makeErrorResponse( ( error as Error ).message );
	}

	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...submitData,
		couponId: responseCart.coupon,
		country: submitData.countryCode,
		deviceId: paymentMethodToken?.deviceId,
		domainDetails: getDomainDetails( contactDetails, {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		paymentMethodToken: paymentMethodToken.token,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId,
			contactDetails:
				getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) ?? null,
			responseCart: transactionOptions.responseCart,
		} ),
		paymentMethodType: 'WPCOM_Billing_Ebanx',
	} );
	debug( 'sending ebanx transaction', formattedTransactionData );
	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( makeSuccessResponse )
		.catch( ( error ) => {
			debug( 'transaction failed' );
			// Errors here are "expected" errors, meaning that they (hopefully) come
			// from the endpoint and not from some bug in the frontend code.
			return makeErrorResponse( error.message );
		} );
}

export interface FreePurchaseData {
	translate: LocalizeProps[ 'translate' ];
}

export default async function multiPartnerCardProcessor(
	submitData: unknown,
	dataForProcessor: PaymentProcessorOptions,
	freePurchaseData?: FreePurchaseData
): Promise< PaymentProcessorResponse > {
	if ( ! isValidMultiPartnerTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	// For free purchases we cannot use the regular processor because it requires
	// making a charge. Instead, we will create a new card, then use the
	// existingCardProcessor because it works for free purchases.
	const isPurchaseFree =
		dataForProcessor.responseCart.total_cost_integer === 0 &&
		dataForProcessor.responseCart.products.length > 0;
	if ( isPurchaseFree ) {
		if ( ! isValidStripeCardTransactionData( submitData ) ) {
			throw new Error( 'Required purchase data is missing' );
		}
		if ( submitData.paymentPartner === 'ebanx' ) {
			throw new Error( 'Cannot use Ebanx for free purchases' );
		}
		if ( ! freePurchaseData?.translate ) {
			throw new Error( 'Required free purchase data is missing' );
		}

		const contactDetailsType = getContactDetailsType( dataForProcessor.responseCart );
		const submitDataWithContactInfo =
			contactDetailsType === 'none'
				? submitData
				: {
						...submitData,
						// In `PaymentMethodSelector` which is used for adding new cards, the
						// stripe payment method is passed `shouldShowTaxFields` which causes
						// it to show required tax location fields in the payment method
						// itself; that data is then submitted to the `assignNewCardProcessor`
						// to send to Stripe as part of saving the card. However, in checkout
						// we normally do not display those fields since they are already included in
						// the billing details step. Therefore we must pass in the tax location
						// data explicitly here so we can use `assignNewCardProcessor`.
						countryCode: dataForProcessor.contactDetails?.countryCode?.value,
						postalCode: getPostalCode( dataForProcessor.contactDetails ),
						state: dataForProcessor.contactDetails?.state?.value,
						city: dataForProcessor.contactDetails?.city?.value,
						organization: dataForProcessor.contactDetails?.organization?.value,
						address: dataForProcessor.contactDetails?.address1?.value,
				  };
		const newCardResponse = await assignNewCardProcessor(
			{
				purchase: undefined,
				translate: freePurchaseData.translate,
				stripe: dataForProcessor.stripe,
				stripeConfiguration: dataForProcessor.stripeConfiguration,
				cardNumberElement: submitData.cardNumberElement,
				reduxDispatch: dataForProcessor.reduxDispatch,
				eventSource: '/checkout',
			},
			submitDataWithContactInfo
		);
		if ( newCardResponse.type === PaymentProcessorResponseType.ERROR ) {
			return newCardResponse;
		}

		const storedCard = newCardResponse.payload;
		if ( ! isValidNewCardResponseData( storedCard ) ) {
			throw new Error( 'New card was not saved' );
		}
		return existingCardProcessor(
			{
				...submitData,
				storedDetailsId: storedCard.stored_details_id,
				paymentMethodToken: storedCard.mp_ref,
				paymentPartnerProcessorId: storedCard.payment_partner,
			},
			dataForProcessor
		);
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
	if ( ! data.cardNumberElement ) {
		throw new Error( 'Transaction requires credit card field and none was provided' );
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

interface NewCardResponseData {
	stored_details_id: string;
	mp_ref: string;
	payment_partner: string;
}

function isValidNewCardResponseData( submitData: unknown ): submitData is NewCardResponseData {
	const data = submitData as NewCardResponseData;
	if ( ! data || ! data.stored_details_id || ! data.mp_ref || ! data.payment_partner ) {
		throw new Error( 'New card was not saved' );
	}
	return true;
}

function createStripePaymentMethodToken( {
	stripe,
	cardNumberElement,
	name,
	country,
	postalCode,
}: {
	stripe: Stripe;
	cardNumberElement: StripeCardNumberElement;
	name: string | undefined;
	country: string | undefined;
	postalCode: string | undefined;
} ) {
	return createStripePaymentMethod( stripe, cardNumberElement, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}
