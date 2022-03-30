import CreditCardFields from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields';
import CreditCardSubmitButton from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-submit-button';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';
import type { State } from 'calypso/state/partner-portal/credit-card-form/reducer';

export function createStoredCreditCardMethod( {
	store,
	stripe,
	stripeConfiguration,
	activePayButtonText = undefined,
}: {
	store: State;
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
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				activeButtonText={ activePayButtonText }
			/>
		),
		inactiveContent: <></>,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}
