import { useTogglePaymentMethod } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { Fragment, useCallback, useEffect } from 'react';
import { GooglePayMark } from '../google-pay-mark';
import { PaymentMethodLogos } from '../payment-method-logos';
import PaymentRequestButton from '../payment-request-button';
import {
	SubmitCompletePaymentMethodTransaction,
	usePaymentRequestOptions,
	useStripePaymentRequest,
} from './web-pay-utils';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { CartKey } from '@automattic/shopping-cart';
import type { Stripe } from '@stripe/stripe-js';

const debug = debugFactory( 'wpcom-checkout:google-pay-payment-method' );

export function createGooglePayMethod(
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration,
	cartKey: CartKey
): PaymentMethod {
	return {
		id: 'google-pay',
		paymentProcessorId: 'google-pay',
		label: <GooglePayLabel />,
		submitButton: (
			<GooglePaySubmitButton
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				cartKey={ cartKey }
			/>
		),
		inactiveContent: <GooglePaySummary />,
		getAriaLabel: () => 'Google Pay',
	};
}

export function GooglePayLabel() {
	return (
		<Fragment>
			<span>Google Pay</span>
			<PaymentMethodLogos className="google-pay__logo payment-logos">
				<GooglePayMark fill="#3C4043" />
			</PaymentMethodLogos>
		</Fragment>
	);
}

export function GooglePaySubmitButton( {
	disabled,
	onClick,
	stripe,
	stripeConfiguration,
	cartKey,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	cartKey: CartKey;
} ) {
	const togglePaymentMethod = useTogglePaymentMethod();
	const paymentRequestOptions = usePaymentRequestOptions( stripeConfiguration, cartKey );
	const onSubmit = useCallback< SubmitCompletePaymentMethodTransaction >(
		( { name, paymentMethodToken } ) => {
			debug( 'submitting stripe payment with key', paymentMethodToken );
			if ( ! onClick ) {
				throw new Error(
					'Missing onClick prop; GooglePaySubmitButton must be used as a payment button in CheckoutSubmitButton'
				);
			}
			onClick( {
				stripe,
				paymentMethodToken,
				name,
				stripeConfiguration,
			} );
		},
		[ onClick, stripe, stripeConfiguration ]
	);
	const { paymentRequest, allowedPaymentTypes, isLoading } = useStripePaymentRequest( {
		paymentRequestOptions,
		onSubmit,
		stripe,
	} );

	useEffect( () => {
		if ( ! isLoading ) {
			togglePaymentMethod( 'google-pay', allowedPaymentTypes.googlePay );
		}
	}, [ isLoading, allowedPaymentTypes.googlePay, togglePaymentMethod ] );

	if ( ! allowedPaymentTypes.googlePay ) {
		return null;
	}

	return (
		<PaymentRequestButton
			disabled={ isLoading ? true : disabled }
			paymentRequest={ paymentRequest }
			paymentType="google-pay"
		/>
	);
}

export function GooglePaySummary() {
	return <Fragment>Google Pay</Fragment>;
}
