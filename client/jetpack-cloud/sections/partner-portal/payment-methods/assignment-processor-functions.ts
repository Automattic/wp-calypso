import { confirmStripeSetupIntentAndAttachCard } from '@automattic/calypso-stripe';
import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { saveCreditCard } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-payment-method-api';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { createStripeSetupIntentForJetpackManage } from '../lib/create-stripe-setup-intent-for-jetpack-manage';
import type { StripeConfiguration, StripeSetupIntent } from '@automattic/calypso-stripe';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import type { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	useAsPrimaryPaymentMethod?: boolean;
	translate: ReturnType< typeof useTranslate >;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	cardElement: StripeCardElement | undefined;
	reduxDispatch: CalypsoDispatch;
}

export async function assignNewCardProcessor(
	{
		useAsPrimaryPaymentMethod,
		translate,
		stripe,
		stripeConfiguration,
		cardElement,
		reduxDispatch,
	}: Props,
	submitData: unknown
): Promise< PaymentProcessorResponse > {
	reduxDispatch( recordFormSubmitEvent() );

	try {
		if ( ! isNewCardDataValid( submitData ) ) {
			throw new Error( 'Credit Card data is missing your full name.' );
		}
		if ( ! stripe || ! stripeConfiguration ) {
			throw new Error( 'Cannot assign payment method if Stripe is not loaded' );
		}
		if ( ! cardElement ) {
			throw new Error( 'Cannot assign payment method if there is no card element' );
		}

		const stripeSetupIntentId = await createStripeSetupIntentForJetpackManage();

		const { name } = submitData;

		const formFieldValues = {
			name,
		};
		const tokenResponse = await prepareAndConfirmStripeSetupIntent(
			formFieldValues,
			stripe,
			cardElement,
			stripeSetupIntentId
		);
		const token = tokenResponse.payment_method;

		if ( ! token ) {
			throw new Error( String( translate( 'Failed to add card.' ) ) );
		}

		const result = await saveCreditCard( {
			token: String( token ),
			useAsPrimaryPaymentMethod: Boolean( useAsPrimaryPaymentMethod ),
			stripeSetupIntentId,
		} );

		return makeSuccessResponse( result );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

async function prepareAndConfirmStripeSetupIntent(
	{
		name,
	}: {
		name: string;
	},
	stripe: Stripe,
	cardElement: StripeCardElement,
	stripeSetupIntentId: string
): Promise< StripeSetupIntent > {
	const paymentDetailsForStripe = {
		name,
	};
	return confirmStripeSetupIntentAndAttachCard(
		stripe,
		cardElement,
		stripeSetupIntentId,
		paymentDetailsForStripe
	);
}

function isNewCardDataValid( data: unknown ): data is NewCardSubmitData {
	const newCardData = data as NewCardSubmitData;
	return !! newCardData.name;
}

interface NewCardSubmitData {
	name: string;
}

function recordFormSubmitEvent() {
	return recordTracksEvent( 'calypso_partner_portal_add_credit_card_form_submit' );
}
