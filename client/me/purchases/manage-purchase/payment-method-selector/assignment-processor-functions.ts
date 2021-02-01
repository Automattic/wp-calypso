/**
 * External dependencies
 */
import { createStripeSetupIntent } from '@automattic/calypso-stripe';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';
import { makeRedirectResponse, makeSuccessResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';

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
	}: {
		purchase: Purchase;
		translate: ReturnType< typeof useTranslate >;
		siteSlug: string;
		apiParams: unknown;
		stripe: Stripe;
		stripeConfiguration: StripeConfiguration;
	},
	{ name, countryCode, postalCode }: { name: string; countryCode: string; postalCode: string }
): Promise< PaymentProcessorResponse > {
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
	purchaseId: string,
	{ storedDetailsId }: { storedDetailsId: string }
): Promise< PaymentProcessorResponse > {
	return wpcomAssignPaymentMethod( purchaseId, storedDetailsId ).then( ( data ) => {
		return makeSuccessResponse( data );
	} );
}

export async function assignPayPalProcessor(
	purchaseId: string
): Promise< PaymentProcessorResponse > {
	return wpcomCreatePayPalAgreement(
		purchaseId,
		addQueryArgs( window.location.href, { success: 'true' } ),
		window.location.href
	).then( ( data ) => {
		return makeRedirectResponse( data );
	} );
}
