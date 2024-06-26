import CreditCardFields from '../payment-method-add/credit-card-fields';
import CreditCardSubmitButton from '../payment-method-add/credit-card-fields/credit-card-submit-button';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export function createStoredCreditCardMethod( {
	stripe,
	stripeConfiguration,
	activePayButtonText = undefined,
}: {
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	activePayButtonText?: string | undefined;
} ): PaymentMethod {
	return {
		id: 'card',
		paymentProcessorId: 'card',
		label: <></>,
		activeContent: <CreditCardFields />,
		submitButton: (
			<CreditCardSubmitButton
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				activeButtonText={ activePayButtonText }
			/>
		),
		inactiveContent: <></>,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}
