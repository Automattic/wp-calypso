import { useProcessPayment } from '@automattic/composite-checkout';
import { Elements, ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo } from 'react';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type {
	Stripe,
	StripeExpressCheckoutElementConfirmEvent,
	StripeExpressCheckoutElementReadyEvent,
} from '@stripe/stripe-js';

type StripeWalletMethodProps = {
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	responseCart: ResponseCart;
};

function StripeWalletLabel() {
	const { __ } = useI18n();
	return <span>{ __( 'Express checkout' ) }</span>;
}

function StripeWalletSubmitButton() {
	// ECE renders its own payment buttons; this submit button is unused.
	return null;
}

function StripeWalletContent( {
	stripeConfiguration,
}: {
	stripeConfiguration: StripeConfiguration | null;
} ) {
	const stripe = useStripe();
	const elements = useElements();
	const processPayment = useProcessPayment( 'stripe-wallet' );

	const onConfirm = useCallback(
		async ( event: StripeExpressCheckoutElementConfirmEvent ) => {
			if ( ! elements ) {
				return;
			}

			const { expressPaymentType } = event;

			const { error: submitError } = await elements.submit();
			if ( submitError ) {
				event.paymentFailed( { reason: 'invalid_payment_data' } );
				return;
			}

			await processPayment( {
				stripe,
				stripeConfiguration,
				elements,
				expressPaymentType,
			} );
		},
		[ processPayment, stripe, stripeConfiguration, elements ]
	);

	const onReady = useCallback(
		( { availablePaymentMethods }: StripeExpressCheckoutElementReadyEvent ) => {
			// No-op: the payment method row is always shown if it's in the cart's
			// allowed_payment_methods. ECE itself hides buttons when they aren't available.
			void availablePaymentMethods;
		},
		[]
	);

	return (
		<ExpressCheckoutElement
			onConfirm={ onConfirm }
			onReady={ onReady }
			options={ {
				paymentMethods: {
					link: 'auto',
					applePay: 'never',
					googlePay: 'never',
					amazonPay: 'never',
					paypal: 'never',
				},
			} }
		/>
	);
}

function StripeWalletFields( {
	stripe,
	stripeConfiguration,
	responseCart,
}: StripeWalletMethodProps ) {
	const { total_cost_integer: amount, currency } = responseCart;

	const elementsOptions = useMemo(
		() => ( {
			mode: 'payment' as const,
			amount,
			currency: currency.toLowerCase(),
			setup_future_usage: 'off_session' as const,
		} ),
		[ amount, currency ]
	);

	return (
		<Elements stripe={ stripe } options={ elementsOptions }>
			<StripeWalletContent stripeConfiguration={ stripeConfiguration } />
		</Elements>
	);
}

export function createStripeWalletMethod( {
	stripe,
	stripeConfiguration,
	responseCart,
}: StripeWalletMethodProps ): PaymentMethod {
	return {
		id: 'stripe-wallet',
		paymentProcessorId: 'stripe-wallet',
		label: <StripeWalletLabel />,
		hasRequiredFields: false,
		activeContent: (
			<StripeWalletFields
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				responseCart={ responseCart }
			/>
		),
		submitButton: <StripeWalletSubmitButton />,
		inactiveContent: <StripeWalletLabel />,
		getAriaLabel: ( __: ( text: string ) => string ) => __( 'Express checkout' ),
	};
}
