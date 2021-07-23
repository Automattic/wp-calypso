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
import { saveCreditCard } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-payment-method-api';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	useAsPrimaryPaymentMethod?: boolean;
	translate: ReturnType< typeof useTranslate >;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	dispatch: ReturnType< typeof useDispatch >;
}

export interface NewCardSubmitData {
	name: string;
	email: string;
	phone: string;
}

export async function assignNewCardProcessor(
	{ useAsPrimaryPaymentMethod, translate, stripe, stripeConfiguration, dispatch }: Props,
	submitData: NewCardSubmitData
): Promise< PaymentProcessorResponse > {
	recordFormSubmitEvent( { dispatch } );

	try {
		if ( ! isNewCardDataValid( submitData ) ) {
			throw new Error( 'Credit Card data is missing the required information.' );
		}
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}

		const { name, email, phone } = submitData;

		const formFieldValues = {
			name,
			email,
			phone,
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
		email,
		phone,
	}: {
		name: string;
		email: string;
		phone: string;
	},
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration
): Promise< StripeSetupIntent > {
	const paymentDetailsForStripe = {
		name,
		email,
		phone,
	};
	return createStripeSetupIntent( stripe, stripeConfiguration, paymentDetailsForStripe );
}

function isNewCardDataValid( data: NewCardSubmitData ): boolean {
	return !! data.name && !! data.email && !! data.phone;
}

function recordFormSubmitEvent( { dispatch }: { dispatch: ReturnType< typeof useDispatch > } ) {
	dispatch( recordTracksEvent( 'calypso_partner_portal_add_credit_card_form_submit' ) );
}
