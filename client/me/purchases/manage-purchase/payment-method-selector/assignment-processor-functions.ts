/**
 * External dependencies
 */
import { createStripeSetupIntent } from '@automattic/calypso-stripe';
import type { Stripe, StripeConfiguration, StripeSetupIntent } from '@automattic/calypso-stripe';
import { makeRedirectResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import { updateCreditCard, saveCreditCard } from './stored-payment-method-api';
import type { Purchase } from 'calypso/lib/purchases/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const wpcom = wp.undocumented();
const wpcomAssignPaymentMethod = (
	subscriptionId: string,
	stored_details_id: string
): Promise< unknown > => wpcom.assignPaymentMethod( subscriptionId, stored_details_id );
const wpcomCreatePayPalAgreement = (
	subscriptionId: string,
	successUrl: string,
	cancelUrl: string
): Promise< string > => wpcom.createPayPalAgreement( subscriptionId, successUrl, cancelUrl );

export async function assignNewCardProcessor(
	{
		purchase,
		translate,
		stripe,
		stripeConfiguration,
		reduxDispatch,
	}: {
		purchase: Purchase | undefined;
		translate: ReturnType< typeof useTranslate >;
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		reduxDispatch: ReturnType< typeof useDispatch >;
	},
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { reduxDispatch, purchase } );

	if ( ! isNewCardDataValid( submitData ) ) {
		throw new Error( 'Credit Card data is missing name, country, or postal code' );
	}
	if ( ! stripe || ! stripeConfiguration ) {
		throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
	}

	const { name, countryCode, postalCode } = submitData;

	const formFieldValues = {
		country: countryCode,
		postal_code: postalCode,
		name,
	};
	const tokenResponse = await createStripeSetupIntentAsync(
		formFieldValues,
		stripe,
		stripeConfiguration
	);
	const token = tokenResponse.payment_method;
	if ( ! token ) {
		throw new Error( String( translate( 'Failed to add card.' ) ) );
	}

	if ( purchase ) {
		const result = await updateCreditCard( {
			purchase,
			token,
			stripeConfiguration,
		} );

		return makeSuccessResponse( result );
	}

	const result = await saveCreditCard( {
		token,
		stripeConfiguration,
	} );

	return makeSuccessResponse( result );
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
	stripeConfiguration: StripeConfiguration
): Promise< StripeSetupIntent > {
	const paymentDetailsForStripe = {
		name,
		address: {
			country,
			postal_code,
		},
	};
	return createStripeSetupIntent( stripe, stripeConfiguration, paymentDetailsForStripe );
}

function isNewCardDataValid( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return !! ( newCardData.name && newCardData.countryCode && newCardData.postalCode );
}

interface NewCardSubmitData {
	name: string;
	countryCode: string;
	postalCode: string;
}

export async function assignExistingCardProcessor(
	purchase: Purchase | undefined,
	reduxDispatch: ReturnType< typeof useDispatch >,
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { reduxDispatch, purchase } );

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
}

function isValidExistingCardData( data: unknown ): data is ExistingCardSubmitData {
	const existingCardData = data as ExistingCardSubmitData;
	return !! existingCardData.storedDetailsId;
}

interface ExistingCardSubmitData {
	storedDetailsId: string;
}

export async function assignPayPalProcessor(
	purchase: Purchase | undefined,
	reduxDispatch: ReturnType< typeof useDispatch >
): Promise< PaymentProcessorResponse > {
	if ( ! purchase ) {
		throw new Error( 'Cannot assign PayPal payment method without a purchase' );
	}
	recordFormSubmitEvent( { reduxDispatch, purchase } );
	return wpcomCreatePayPalAgreement(
		String( purchase.id ),
		addQueryArgs( window.location.href, { success: 'true' } ),
		window.location.href
	).then( ( data ) => {
		return makeRedirectResponse( data );
	} );
}

function recordFormSubmitEvent( {
	reduxDispatch,
	purchase,
}: {
	reduxDispatch: ReturnType< typeof useDispatch >;
	purchase?: Purchase | undefined;
} ) {
	reduxDispatch(
		purchase?.productSlug
			? recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
					product_slug: purchase.productSlug,
			  } )
			: recordTracksEvent( 'calypso_add_credit_card_form_submit' )
	);
}
