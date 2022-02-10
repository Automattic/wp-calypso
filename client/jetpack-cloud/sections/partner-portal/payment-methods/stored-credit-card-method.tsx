import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import CreditCardFields from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields';
import CreditCardSubmitButton from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-submit-button';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export function createStoredCreditCardMethod( {
	store,
	stripe,
	stripeConfiguration,
	activePayButtonText = undefined,
}: {
	store: unknown;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	activePayButtonText?: string | undefined;
} ): PaymentMethod {
	return {
		id: 'card',
		label: <CreditCardLabel />,
		activeContent: <CreditCardFields />,
		submitButton: (
			<CreditCardSubmitButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				activeButtonText={ activePayButtonText }
			/>
		),
		inactiveContent: <Fragment></Fragment>,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}

function CreditCardLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'Credit or debit card' ) }</span>
		</Fragment>
	);
}
