import { createStripeSetupIntent } from '@automattic/calypso-stripe';
import {
	makeRedirectResponse,
	makeSuccessResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateCreditCard, saveCreditCard } from './stored-payment-method-api';
import type {
	StripeSetupIntentId,
	StripeConfiguration,
	StripeSetupIntent,
} from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { CalypsoDispatch } from 'calypso/state/types';

const wpcomAssignPaymentMethod = (
	subscriptionId: string,
	stored_details_id: string
): Promise< unknown > =>
	wp.req.post( {
		path: '/upgrades/' + subscriptionId + '/assign-payment-method',
		body: { stored_details_id },
		apiVersion: '1',
	} );

const wpcomCreatePayPalAgreement = (
	subscription_id: string,
	success_url: string,
	cancel_url: string,
	postal_code: string,
	country_code: string
): Promise< string > =>
	wp.req.post( {
		path: '/payment-methods/create-paypal-agreement',
		body: { subscription_id, success_url, cancel_url, postal_code, country_code },
		apiVersion: '1',
	} );

export async function assignNewCardProcessor(
	{
		purchase,
		translate,
		stripe,
		stripeConfiguration,
		stripeSetupIntentId,
		cardNumberElement,
		reduxDispatch,
		eventSource,
	}: {
		purchase: Purchase | undefined;
		translate: ReturnType< typeof useTranslate >;
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		stripeSetupIntentId: StripeSetupIntentId | undefined;
		cardNumberElement: StripeCardNumberElement | undefined;
		reduxDispatch: CalypsoDispatch;
		eventSource?: string;
	},
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! isNewCardDataValid( submitData ) ) {
			throw new Error( 'Credit Card data is missing country' );
		}
		if ( ! stripe || ! stripeConfiguration || ! stripeSetupIntentId ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}
		if ( ! cardNumberElement ) {
			throw new Error( 'Cannot assign payment method if there is no card number' );
		}

		const { name, countryCode, postalCode, useForAllSubscriptions } = submitData;

		reduxDispatch( recordFormSubmitEvent( { purchase, useForAllSubscriptions } ) );

		const formFieldValues = {
			country: countryCode,
			postal_code: postalCode ?? '',
			name: name ?? '',
		};
		const tokenResponse = await createStripeSetupIntentAsync(
			formFieldValues,
			stripe,
			cardNumberElement,
			stripeSetupIntentId
		);
		const token = tokenResponse.payment_method;
		if ( ! token ) {
			throw new Error( String( translate( 'Failed to add card.' ) ) );
		}

		// If we've reached this point in the code and anything after this fails,
		// we must regenerate the payment intent, which is done by calling `reload`
		// as returned by `useStripeSetupIntentId` from
		// `@automattic/calypso-stripe`.

		if ( purchase ) {
			const result = await updateCreditCard( {
				purchase,
				token,
				stripeConfiguration,
				useForAllSubscriptions: Boolean( useForAllSubscriptions ),
				eventSource,
			} );

			return makeSuccessResponse( result );
		}

		const result = await saveCreditCard( {
			token,
			stripeConfiguration,
			useForAllSubscriptions: Boolean( useForAllSubscriptions ),
			eventSource,
		} );

		return makeSuccessResponse( result );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

async function createStripeSetupIntentAsync(
	{
		name,
		country,
		postal_code,
	}: {
		name: string;
		country: string;
		postal_code: string | number;
	},
	stripe: Stripe,
	cardNumberElement: StripeCardNumberElement,
	setupIntentId: StripeSetupIntentId
): Promise< StripeSetupIntent > {
	const paymentDetailsForStripe = {
		name,
		address: {
			country,
			postal_code,
		},
	};
	return createStripeSetupIntent(
		stripe,
		cardNumberElement,
		setupIntentId,
		paymentDetailsForStripe
	);
}

function isNewCardDataValid( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return !! newCardData.countryCode;
}

interface NewCardSubmitData {
	name?: string;
	countryCode: string;
	postalCode?: string;
	useForAllSubscriptions: boolean;
}

export async function assignExistingCardProcessor(
	purchase: Purchase | undefined,
	reduxDispatch: CalypsoDispatch,
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	reduxDispatch( recordFormSubmitEvent( { purchase } ) );
	try {
		if ( ! isValidExistingCardData( submitData ) ) {
			throw new Error( 'Credit card data is missing stored details id' );
		}
		const { storedDetailsId } = submitData;
		if ( ! purchase ) {
			throw new Error( 'Cannot assign PayPal payment method without a purchase' );
		}
		return wpcomAssignPaymentMethod( String( purchase.id ), storedDetailsId ).then( ( data ) => {
			return makeSuccessResponse( data );
		} );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

function isValidExistingCardData( data: unknown ): data is ExistingCardSubmitData {
	const existingCardData = data as ExistingCardSubmitData;
	return !! existingCardData.storedDetailsId;
}

interface ExistingCardSubmitData {
	storedDetailsId: string;
}

interface PayPalSubmitData {
	postalCode?: string;
	countryCode: string;
}

function isValidPayPalData( data: unknown ): data is PayPalSubmitData {
	const payPalData = data as PayPalSubmitData;
	return !! payPalData.countryCode;
}

export async function assignPayPalProcessor(
	purchase: Purchase | undefined,
	reduxDispatch: CalypsoDispatch,
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! purchase ) {
			throw new Error( 'Cannot assign PayPal payment method without a purchase' );
		}
		if ( ! isValidPayPalData( submitData ) ) {
			throw new Error( 'PayPal data is missing tax information' );
		}
		reduxDispatch( recordFormSubmitEvent( { purchase } ) );
		return wpcomCreatePayPalAgreement(
			String( purchase.id ),
			addQueryArgs( window.location.href, { success: 'true' } ),
			window.location.href,
			submitData.postalCode ?? '',
			submitData.countryCode
		).then( ( data ) => {
			return makeRedirectResponse( data );
		} );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

function recordFormSubmitEvent( {
	purchase,
	useForAllSubscriptions,
}: {
	purchase?: Purchase;
	useForAllSubscriptions?: boolean;
} ) {
	return purchase?.productSlug
		? recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
				product_slug: purchase.productSlug,
				use_for_all_subs: String( useForAllSubscriptions ),
		  } )
		: recordTracksEvent( 'calypso_add_credit_card_form_submit', {
				use_for_all_subs: String( useForAllSubscriptions ),
		  } );
}
