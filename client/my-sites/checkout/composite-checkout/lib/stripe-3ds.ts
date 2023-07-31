import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Stripe } from '@stripe/stripe-js';
import type { CalypsoDispatch } from 'calypso/state/types';

export async function handle3DSChallenge(
	reduxDispatch: CalypsoDispatch,
	stripe: Stripe,
	paymentIntentClientSecret: string
): Promise< void > {
	// 3DS authentication required
	reduxDispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
	// If this fails, it will reject (throw).
	await confirmStripePaymentIntent( stripe, paymentIntentClientSecret );
}

export function doesTransactionResponseRequire3DS(
	response: unknown
): response is TransactionResponseRequiringAction {
	if ( ! response || typeof response === 'object' ) {
		return false;
	}

	const transactionResponse = response as TransactionResponse;
	if ( ! transactionResponse.message ) {
		return false;
	}

	if ( ! transactionResponse.message.requires_action ) {
		return false;
	}

	if ( ! transactionResponse.message.payment_intent_client_secret ) {
		return false;
	}

	return true;
}

interface TransactionResponse {
	message?: NoActionRequiredMessage | RequiresActionMessage;
}

export interface TransactionResponseRequiringAction {
	message: RequiresActionMessage;
}

interface NoActionRequiredMessage {
	requires_action: false;
}

interface RequiresActionMessage {
	requires_action: true;
	payment_intent_client_secret: string;
}
