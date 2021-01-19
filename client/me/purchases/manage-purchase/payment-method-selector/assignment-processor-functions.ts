/**
 * External dependencies
 */
import { createStripeSetupIntent } from '@automattic/calypso-stripe';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';
import { makeRedirectResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import {
	getTokenForSavingCard,
	updateCreditCard,
	getInitializedFields,
} from 'calypso/me/purchases/components/payment-method-form/helpers';
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
		siteSlug,
		apiParams,
		stripe,
		stripeConfiguration,
		reduxDispatch,
	}: {
		purchase: Purchase | undefined;
		translate: ReturnType< typeof useTranslate >;
		siteSlug: string;
		apiParams: unknown;
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
	const { name, countryCode, postalCode } = submitData;
	const createStripeSetupIntentAsync = async ( paymentDetails: {
		country: string;
		'postal-code': string | number;
	} ) => {
		const { country, 'postal-code': zip } = paymentDetails;
		const paymentDetailsForStripe = {
			name,
			address: {
				country: country,
				postal_code: zip,
			},
		};
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}
		return createStripeSetupIntent( stripe, stripeConfiguration, paymentDetailsForStripe );
	};

	const formFieldValues = getInitializedFields( {
		country: countryCode,
		postalCode,
		name,
	} );

	// FIXME: Add code to save new card if purchase is not set

	return getTokenForSavingCard( {
		formFieldValues,
		createCardToken: createStripeSetupIntentAsync,
		parseTokenFromResponse: ( response: { payment_method: string } ) => response.payment_method,
		translate,
	} )
		.then( ( token ) =>
			updateCreditCard( {
				formFieldValues,
				apiParams,
				purchase,
				siteSlug,
				token,
				translate,
				stripeConfiguration,
			} )
		)
		.then( ( data ) => {
			return makeSuccessResponse( data );
		} );
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
		recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: purchase?.productSlug ?? '',
		} )
	);
}
