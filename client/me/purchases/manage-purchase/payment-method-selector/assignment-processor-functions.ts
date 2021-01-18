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
		purchase: Purchase;
		translate: ReturnType< typeof useTranslate >;
		siteSlug: string;
		apiParams: unknown;
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		reduxDispatch: ReturnType< typeof useDispatch >;
	},
	{ name, countryCode, postalCode }: { name: string; countryCode: string; postalCode: string }
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { reduxDispatch, purchase } );

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

export async function assignExistingCardProcessor(
	purchase: Purchase,
	reduxDispatch: ReturnType< typeof useDispatch >,
	{ storedDetailsId }: { storedDetailsId: string }
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { reduxDispatch, purchase } );
	return wpcomAssignPaymentMethod( String( purchase.id ), storedDetailsId ).then( ( data ) => {
		return makeSuccessResponse( data );
	} );
}

export async function assignPayPalProcessor(
	purchase: Purchase,
	reduxDispatch: ReturnType< typeof useDispatch >
): Promise< PaymentProcessorResponse > {
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
	purchase: Purchase;
} ) {
	reduxDispatch(
		recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: purchase.productSlug,
		} )
	);
}
