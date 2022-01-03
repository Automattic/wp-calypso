import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export function createStoredCreditCardMethod( {
	activePayButtonText = undefined,
}: {
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	activePayButtonText?: string | undefined;
} ): PaymentMethod {
	return {
		id: 'card',
		submitButton: <button>{ activePayButtonText }</button>,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}
