import {
	PaymentProcessorResponseType,
	useRegisterPaymentMethodLoading,
	useTogglePaymentMethod,
} from '@automattic/composite-checkout';
import { Elements, ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo, useState } from 'react';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type {
	PaymentMethod,
	PaymentMethodSubmitButtonProps,
	ProcessPayment,
} from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type {
	Stripe,
	StripeExpressCheckoutElementAvailablePaymentMethodsChangeEvent,
	StripeExpressCheckoutElementConfirmEvent,
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

function StripeWalletContent( {
	stripeConfiguration,
	onClick,
}: {
	stripeConfiguration: StripeConfiguration | null;
	onClick?: ProcessPayment;
} ) {
	const stripe = useStripe();
	const elements = useElements();
	const togglePaymentMethod = useTogglePaymentMethod();
	const [ isLoading, setIsLoading ] = useState( true );

	useRegisterPaymentMethodLoading( 'stripe-wallet', isLoading );

	const onAvailablePaymentMethodsChange = useCallback(
		( { paymentMethods }: StripeExpressCheckoutElementAvailablePaymentMethodsChangeEvent ) => {
			setIsLoading( false );
			togglePaymentMethod( 'stripe-wallet', Boolean( paymentMethods ) );
		},
		[ togglePaymentMethod ]
	);

	const onConfirm = useCallback(
		async ( event: StripeExpressCheckoutElementConfirmEvent ) => {
			if ( ! elements ) {
				return;
			}
			if ( ! onClick ) {
				throw new Error(
					'Missing onClick prop; StripeWalletContent must be used as a payment button in CheckoutSubmitButton'
				);
			}

			const { expressPaymentType } = event;

			const { error: submitError } = await elements.submit();
			if ( submitError ) {
				event.paymentFailed( { reason: 'invalid_payment_data' } );
				return;
			}

			// Runs the same isActive/validateForm checks every other payment method
			// goes through (e.g. marketplace consent, 100-year-plan terms) before
			// processPayment is called. If that rejects, the wallet's own sheet is
			// still open, so we must signal failure back through the ECE event
			// rather than just returning an error response like other methods do.
			const response = await onClick( {
				stripe,
				stripeConfiguration,
				elements,
				expressPaymentType,
			} );
			if ( response.type === PaymentProcessorResponseType.ERROR ) {
				event.paymentFailed( { reason: 'fail', message: response.payload } );
			}
		},
		[ onClick, stripe, stripeConfiguration, elements ]
	);

	return (
		<ExpressCheckoutElement
			onConfirm={ onConfirm }
			onAvailablePaymentMethodsChange={ onAvailablePaymentMethodsChange }
			options={ {
				paymentMethods: {
					link: 'auto',
					applePay: 'never',
					googlePay: 'auto',
					amazonPay: 'never',
					paypal: 'never',
				},
			} }
		/>
	);
}

// Rendered as the payment method's submitButton (like apple-pay/google-pay) so the
// wallet buttons appear in the sidebar next to the total, not inline in the payment
// method list. `onClick` is injected by CheckoutSubmitButton and called from ECE's
// onConfirm event once the shopper taps a wallet button; `disabled` is unused since
// ECE has no concept of a disabled state to reflect it with.
function StripeWalletSubmitButton( {
	stripe,
	stripeConfiguration,
	responseCart,
	onClick,
}: StripeWalletMethodProps & PaymentMethodSubmitButtonProps ) {
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
			<StripeWalletContent stripeConfiguration={ stripeConfiguration } onClick={ onClick } />
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
		isInitiallyDisabled: true,
		submitButton: (
			<StripeWalletSubmitButton
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				responseCart={ responseCart }
			/>
		),
		inactiveContent: <StripeWalletLabel />,
		getAriaLabel: ( __: ( text: string ) => string ) => __( 'Express checkout' ),
	};
}
