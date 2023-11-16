import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { logStashEvent } from '../lib/analytics';
import type { Stripe } from '@stripe/stripe-js';
import type { CalypsoDispatch } from 'calypso/state/types';

export async function handle3DSChallenge(
	reduxDispatch: CalypsoDispatch,
	stripe: Stripe,
	paymentIntentClientSecret: string,
	paymentIntentId: string
): Promise< void > {
	// 3DS authentication required
	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_modal_authorization', {
			payment_intent_id: paymentIntentId,
		} )
	);
	logStashEvent(
		'calypso_checkout_modal_authorization',
		{
			payment_intent_id: paymentIntentId,
			tags: [ `payment_intent_id:${ paymentIntentId }` ],
		},
		'info'
	);
	// If this fails, it will reject (throw).
	await confirmStripePaymentIntent( stripe, paymentIntentClientSecret );
}

export function doesTransactionResponseRequire3DS(
	response: unknown
): response is TransactionResponseRequiringAction {
	if ( ! response || typeof response !== 'object' ) {
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

/**
 * Since the checkout submit button is disabled when pressed, it should be
 * impossible to get an error which states that we have already begun
 * confirming a 3DS card. However, we see a number of these happen so this
 * function logs these instances to make them easier to track down.
 *
 * See https://github.com/Automattic/payments-shilling/issues/1910
 */
export function handle3DSInFlightError( error: Error, paymentIntentId: string | undefined ): void {
	if (
		error.message &&
		typeof error.message === 'string' &&
		error.message.includes( 'You have an in-flight confirmCardPayment' )
	) {
		logStashEvent(
			'calypso_checkout_duplicate_confirm_card_payment',
			{
				payment_intent_id: paymentIntentId ?? '',
				tags: [ `payment_intent_id:${ paymentIntentId }` ],
				error: error.message,
			},
			'info'
		);
	}
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
	payment_intent_id: string;
}
