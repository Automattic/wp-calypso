import { confirmStripeSetupIntentAndAttachCard } from '@automattic/calypso-stripe';
import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { Purchase } from '@automattic/api-core';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

export async function assignNewCardProcessor(
	{
		purchase,
		stripe,
		stripeConfiguration,
		createStripeSetupIntent,
		saveCreditCard,
		updateCreditCard,
	}: {
		purchase: Purchase | undefined;
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		createStripeSetupIntent: ( params: {
			country?: string;
			cartKey?: string;
		} ) => Promise< { setup_intent_id?: string } >;
		saveCreditCard: ( params: {
			paymentKey: string;
			useForExisting: boolean;
			paymentPartner?: string;
			paygateToken?: string;
			postalCode?: string;
			countryCode?: string;
			taxSubdivisionCode?: string;
			taxCity?: string;
			taxOrganization?: string;
			taxAddress?: string;
			setupKey?: string;
		} ) => Promise< unknown >;
		updateCreditCard: ( params: {
			purchaseId: number;
			paymentPartner?: string;
			paygateToken?: string;
			useForExisting?: boolean;
			eventSource?: string;
			postalCode?: string;
			countryCode?: string;
			taxSubdivisionCode?: string;
			taxCity?: string;
			taxOrganization?: string;
			taxAddress?: string;
			setupKey?: string;
		} ) => Promise< unknown >;
	},
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! isValidNewCardData( submitData ) ) {
			throw new Error( 'Credit Card data is invalid' );
		}
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}
		if ( ! submitData.cardElement ) {
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
			cardElement,
		} = submitData;

		// @todo: we should pass the countryCode to createStripeSetupIntent,
		// but since `prepareAndConfirmStripeSetupIntent()` uses the `stripe`
		// object created by `StripeHookProvider`, that object must also be
		// created with the same countryCode, and right now it is not.
		const setupIntentResult = await createStripeSetupIntent( {
			country: undefined,
		} );

		if ( ! setupIntentResult.setup_intent_id ) {
			throw new Error( 'Failed to create setup intent' );
		}

		const stripeSetupIntentId = setupIntentResult.setup_intent_id;

		// Confirm the setup intent with card details
		const paymentDetailsForStripe = {
			name: name || '',
			address: {
				country: countryCode,
				postal_code: postalCode || '',
			},
		};

		const tokenResponse = await confirmStripeSetupIntentAndAttachCard(
			stripe,
			cardElement,
			stripeSetupIntentId,
			paymentDetailsForStripe
		);

		const token = tokenResponse.payment_method;
		const setupKey = tokenResponse.id;

		if ( ! token ) {
			throw new Error( 'Failed to add card.' );
		}

		// Save or update the card
		if ( purchase ) {
			const result = await updateCreditCard( {
				purchaseId: purchase.ID,
				paygateToken: String( token ),
				paymentPartner: stripeConfiguration.processor_id,
				useForExisting: Boolean( useForAllSubscriptions ),
				postalCode,
				countryCode,
				taxSubdivisionCode: state,
				taxCity: city,
				taxOrganization: organization,
				taxAddress: address,
				setupKey,
			} );

			return makeSuccessResponse( result );
		}

		const result = await saveCreditCard( {
			paymentKey: String( token ),
			paygateToken: String( token ),
			paymentPartner: stripeConfiguration.processor_id,
			useForExisting: Boolean( useForAllSubscriptions ),
			postalCode,
			countryCode,
			taxSubdivisionCode: state,
			taxCity: city,
			taxOrganization: organization,
			taxAddress: address,
			setupKey,
		} );

		return makeSuccessResponse( result );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

function isValidNewCardData( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return newCardData.countryCode !== undefined && newCardData.cardElement !== undefined;
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
	cardElement: StripeCardNumberElement;
}
