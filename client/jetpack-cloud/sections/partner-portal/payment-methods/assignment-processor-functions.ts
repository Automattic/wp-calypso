/**
 * External dependencies
 */
import { createStripeSetupIntent } from '@automattic/calypso-stripe';
import type { Stripe, StripeConfiguration, StripeSetupIntent } from '@automattic/calypso-stripe';
import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal Dependencies
 */
import {
	updateCreditCard,
	saveCreditCard,
} from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-payment-method-api';
import type { Purchase } from 'calypso/lib/purchases/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export async function assignNewCardProcessor(
	{
		purchase,
		useAsPrimaryPaymentMethod,
		translate,
		stripe,
		stripeConfiguration,
		reduxDispatch,
	}: {
		purchase: Purchase | undefined;
		useAsPrimaryPaymentMethod?: boolean;
		translate: ReturnType< typeof useTranslate >;
		stripe: Stripe | null;
		stripeConfiguration: StripeConfiguration | null;
		reduxDispatch: ReturnType< typeof useDispatch >;
	},
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { reduxDispatch, purchase } );

	try {
		if ( ! isNewCardDataValid( submitData ) ) {
			throw new Error( 'Credit Card data is missing your full name.' );
		}
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}

		const { name } = submitData;

		const formFieldValues = {
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
			useAsPrimaryPaymentMethod: Boolean( useAsPrimaryPaymentMethod ),
		} );

		return makeSuccessResponse( result );
	} catch ( error ) {
		return makeErrorResponse( error.message );
	}
}

async function createStripeSetupIntentAsync(
	{
		name,
	}: {
		name: string;
	},
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration
): Promise< StripeSetupIntent > {
	const paymentDetailsForStripe = {
		name,
	};
	return createStripeSetupIntent( stripe, stripeConfiguration, paymentDetailsForStripe );
}

function isNewCardDataValid( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return !! newCardData.name;
}

interface NewCardSubmitData {
	name: string;
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
