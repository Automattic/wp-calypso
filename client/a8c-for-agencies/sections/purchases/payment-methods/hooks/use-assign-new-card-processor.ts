import { confirmStripeSetupIntentAndAttachCard } from '@automattic/calypso-stripe';
import {
	makeSuccessResponse,
	makeErrorResponse,
	PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import fetchStripeSetupIntentId from '../lib/fetch-stripe-setup-intent-id';
import { useSaveCard } from './use-save-card';
import type { StripeConfiguration, StripeSetupIntent } from '@automattic/calypso-stripe';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

type Props = {
	useAsPrimaryPaymentMethod?: boolean;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
};

export function useAssignNewCardProcessor( {
	useAsPrimaryPaymentMethod,
	stripe,
	stripeConfiguration,
}: Props ): (
	submitData: unknown,
	cardElement?: StripeCardElement
) => Promise< PaymentProcessorResponse > {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const saveCreditCard = useSaveCard( { useAsPrimaryPaymentMethod } );

	return useCallback(
		async ( submitData: unknown, cardElement?: StripeCardElement ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_add_credit_card_form_submit' ) );

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

				const { name } = submitData;
				const formFieldValues = { name };

				const stripeSetupIntentId = await fetchStripeSetupIntentId();

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

				const result = await saveCreditCard( String( token ) );

				return makeSuccessResponse( result );
			} catch ( error ) {
				return makeErrorResponse( ( error as Error ).message );
			}
		},
		[ dispatch, saveCreditCard, stripe, stripeConfiguration, translate ]
	);
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
