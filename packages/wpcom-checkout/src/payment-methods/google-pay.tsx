/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import debugFactory from 'debug';
import { ProcessPayment } from '@automattic/composite-checkout';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import PaymentRequestButton from '../payment-request-button';
import { usePaymentRequestOptions, useStripePaymentRequest } from './web-pay-utils';

const debug = debugFactory( 'wpcom-checkout:google-pay-payment-method' );

export function createGooglePayMethod(
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration
): PaymentMethod {
	return {
		id: 'google-pay',
		label: <GooglePayLabel />,
		submitButton: (
			<GooglePaySubmitButton stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		inactiveContent: <GooglePaySummary />,
		getAriaLabel: () => 'Google Pay',
	};
}

export function GooglePayLabel(): JSX.Element {
	return (
		<React.Fragment>
			<span>{ 'Google Pay' }</span>
		</React.Fragment>
	);
}

export function GooglePaySubmitButton( {
	disabled,
	onClick,
	stripe,
	stripeConfiguration,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
} ): JSX.Element {
	const paymentRequestOptions = usePaymentRequestOptions( stripeConfiguration );
	const onSubmit = useCallback(
		( { name, paymentMethodToken } ) => {
			debug( 'submitting stripe payment with key', paymentMethodToken );
			if ( ! onClick ) {
				throw new Error(
					'Missing onClick prop; GooglePaySubmitButton must be used as a payment button in CheckoutSubmitButton'
				);
			}
			onClick( 'google-pay', {
				stripe,
				paymentMethodToken,
				name,
				stripeConfiguration,
			} );
		},
		[ onClick, stripe, stripeConfiguration ]
	);
	const { paymentRequest, canMakePayment, isLoading } = useStripePaymentRequest( {
		webPaymentType: 'google-pay',
		paymentRequestOptions,
		onSubmit,
		stripe,
	} );

	if ( ! isLoading && ! canMakePayment ) {
		// This should never occur because we should not display this payment
		// method as an option if it is not supported.
		throw new Error( 'This payment type is not supported' );
	}

	return (
		<PaymentRequestButton
			disabled={ isLoading ? true : disabled }
			paymentRequest={ paymentRequest }
			paymentType="google-pay"
		/>
	);
}

export function GooglePaySummary(): JSX.Element {
	return <React.Fragment>{ 'Google Pay' }</React.Fragment>;
}
