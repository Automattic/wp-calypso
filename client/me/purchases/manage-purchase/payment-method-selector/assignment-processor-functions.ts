import { confirmStripeSetupIntentAndAttachCard } from '@automattic/calypso-stripe';
import {
	makeRedirectResponse,
	makeSuccessResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import { ManagedContactDetails } from '@automattic/wpcom-checkout';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { getTaxValidationResult } from 'calypso/my-sites/checkout/src/lib/contact-validation';
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
import type { LocalizeProps } from 'i18n-calypso';

async function fetchStripeSetupIntentId( source: string ): Promise< StripeSetupIntentId > {
	const configuration = await wp.req.get( '/me/stripe-configuration', {
		needs_intent: true,
		source,
	} );
	const intentId: string | undefined =
		configuration?.setup_intent_id && typeof configuration.setup_intent_id === 'string'
			? configuration.setup_intent_id
			: undefined;
	if ( ! intentId ) {
		throw new Error(
			'Error loading new payment method intent. Received invalid data from the server.'
		);
	}
	return intentId;
}

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
	tax_country_code: string,
	tax_postal_code: string,
	tax_address: string,
	tax_organization: string,
	tax_city: string,
	tax_subdivision_code: string
): Promise< string > =>
	wp.req.post( {
		path: '/payment-methods/create-paypal-agreement',
		body: {
			subscription_id,
			success_url,
			cancel_url,
			tax_postal_code,
			tax_country_code,
			tax_address,
			tax_organization,
			tax_city,
			tax_subdivision_code,
		},
		apiVersion: '1',
	} );

export async function assignNewCardProcessor(
	{
		purchase,
		translate,
		stripe,
		stripeConfiguration,
		cardNumberElement,
		reduxDispatch,
		eventSource,
		isCheckout,
	}: {
		purchase: Purchase | undefined;
		translate: LocalizeProps[ 'translate' ];
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		cardNumberElement: StripeCardNumberElement | undefined;
		reduxDispatch: CalypsoDispatch;
		eventSource?: string;
		isCheckout?: boolean;
	},
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! isNewCardDataValid( submitData ) ) {
			throw new Error( 'Credit Card data is invalid' );
		}
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}
		if ( ! cardNumberElement ) {
			throw new Error( 'Cannot assign payment method if there is no card number' );
		}

		const {
			name,
			countryCode,
			postalCode,
			state,
			city,
			organization,
			address,
			useForAllSubscriptions,
		} = submitData;

		const contactInfo: ManagedContactDetails = {
			countryCode: {
				value: countryCode,
				isTouched: true,
				errors: [],
			},
			postalCode: {
				value: postalCode ?? '',
				isTouched: true,
				errors: [],
			},
		};
		if ( state ) {
			contactInfo.state = {
				value: state,
				isTouched: true,
				errors: [],
			};
		}
		if ( city ) {
			contactInfo.city = {
				value: city,
				isTouched: true,
				errors: [],
			};
		}
		if ( organization ) {
			contactInfo.organization = {
				value: organization,
				isTouched: true,
				errors: [],
			};
		}
		if ( address ) {
			contactInfo.address1 = {
				value: address,
				isTouched: true,
				errors: [],
			};
		}
		const contactValidationResponse = await getTaxValidationResult( contactInfo );
		if ( ! contactValidationResponse.success ) {
			const errorMessage =
				contactValidationResponse.messages_simple.length > 0
					? contactValidationResponse.messages_simple[ 0 ]
					: 'Unknown error validating location information';
			throw new Error( errorMessage );
		}

		reduxDispatch( recordFormSubmitEvent( { purchase, useForAllSubscriptions } ) );

		const stripeSetupIntentId = await fetchStripeSetupIntentId(
			isCheckout ? 'checkout' : 'not-checkout'
		);
		const formFieldValues = {
			country: countryCode,
			postal_code: postalCode ?? '',
			name: name ?? '',
		};
		const tokenResponse = await prepareAndConfirmStripeSetupIntent(
			formFieldValues,
			stripe,
			cardNumberElement,
			stripeSetupIntentId
		);
		const token = tokenResponse.payment_method;
		if ( ! token ) {
			throw new Error( String( translate( 'Failed to add card.' ) ) );
		}

		if ( purchase ) {
			const result = await updateCreditCard( {
				purchase,
				token: String( token ),
				stripeConfiguration,
				useForAllSubscriptions: Boolean( useForAllSubscriptions ),
				eventSource,
				postalCode,
				countryCode,
				state,
				city,
				organization,
				address,
			} );

			return makeSuccessResponse( result );
		}

		const result = await saveCreditCard( {
			token: String( token ),
			stripeConfiguration,
			useForAllSubscriptions: Boolean( useForAllSubscriptions ),
			eventSource,
			postalCode,
			countryCode,
			state,
			city,
			organization,
			address,
		} );

		return makeSuccessResponse( result );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

async function prepareAndConfirmStripeSetupIntent(
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
	return confirmStripeSetupIntentAndAttachCard(
		stripe,
		cardNumberElement,
		setupIntentId,
		paymentDetailsForStripe
	);
}

function isNewCardDataValid( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return newCardData.countryCode !== undefined;
}

interface NewCardSubmitData {
	name?: string;
	countryCode: string;
	postalCode?: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
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
		const data = await wpcomAssignPaymentMethod( String( purchase.id ), storedDetailsId );
		return makeSuccessResponse( data );
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
	address?: string;
	organization?: string;
	city?: string;
	state?: string;
}

function isValidPayPalData( data: unknown ): data is PayPalSubmitData {
	const payPalData = data as PayPalSubmitData;
	return payPalData.countryCode !== undefined;
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
		const data = await wpcomCreatePayPalAgreement(
			String( purchase.id ),
			addQueryArgs( window.location.href, { success: 'true' } ),
			window.location.href,
			submitData.countryCode,
			submitData.postalCode ?? '',
			submitData.address ?? '',
			submitData.organization ?? '',
			submitData.city ?? '',
			submitData.state ?? ''
		);
		return makeRedirectResponse( data );
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
