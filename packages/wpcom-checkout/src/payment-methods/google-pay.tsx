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
import { PaymentMethodLogos } from '../payment-method-logos';
import { usePaymentRequestOptions, useStripePaymentRequest } from './web-pay-utils';

const debug = debugFactory( 'composite-checkout:google-pay-payment-method' );

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
			<PaymentMethodLogos className="google-pay__logo payment-logos">
				<GooglePayIcon fill="black" />
			</PaymentMethodLogos>
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

function GooglePayIcon( { fill }: { fill: string } ): JSX.Element {
	return (
		<svg
			width="38"
			height="16"
			viewBox="0 0 38 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M7.41541 2.16874C7.85525 1.626 8.15372 0.897268 8.075 0.152588C7.43114 0.184172 6.64544 0.571647 6.19055 1.11481C5.78212 1.57994 5.42062 2.33919 5.51486 3.05265C6.23762 3.1145 6.95971 2.69625 7.41541 2.16874Z"
				fill={ fill }
			/>
			<path
				d="M8.06647 3.19212C7.01685 3.13044 6.12441 3.77982 5.62317 3.77982C5.12164 3.77982 4.35406 3.2232 3.52387 3.2382C2.44331 3.25386 1.44069 3.8566 0.892353 4.81523C-0.235478 6.73296 0.594719 9.57763 1.69147 11.1395C2.22408 11.9122 2.86597 12.763 3.71175 12.7325C4.51087 12.7015 4.8241 12.222 5.79546 12.222C6.76612 12.222 7.04826 12.7325 7.89418 12.717C8.77142 12.7015 9.31985 11.9439 9.85246 11.1705C10.4635 10.2896 10.7136 9.43906 10.7293 9.39237C10.7136 9.3769 9.03775 8.74266 9.02221 6.84087C9.00639 5.24847 10.3379 4.49103 10.4006 4.44406C9.64866 3.34691 8.47379 3.2232 8.06647 3.19212Z"
				fill={ fill }
			/>
			<path
				d="M17.2059 1.03678C19.4872 1.03678 21.0758 2.58817 21.0758 4.84688C21.0758 7.11366 19.4545 8.67311 17.1487 8.67311H14.6228V12.6359H12.7979V1.03677H17.2059V1.03678ZM14.6228 7.16188H16.7168C18.3057 7.16188 19.21 6.31796 19.21 4.85494C19.21 3.39208 18.3057 2.55607 16.725 2.55607H14.6228V7.16188V7.16188Z"
				fill={ fill }
			/>
			<path
				d="M21.5527 10.2322C21.5527 8.7531 22.7016 7.84484 24.7387 7.73228L27.0851 7.59568V6.94464C27.0851 6.00413 26.4414 5.44147 25.3661 5.44147C24.3474 5.44147 23.7118 5.92367 23.5572 6.67936H21.895C21.9928 5.152 23.3126 4.02667 25.4311 4.02667C27.5088 4.02667 28.8368 5.11184 28.8368 6.80789V12.6356H27.1502V11.245H27.1096C26.6127 12.1855 25.5289 12.7803 24.4046 12.7803C22.7261 12.7803 21.5527 11.7514 21.5527 10.2322ZM27.0851 9.46864V8.80148L24.9747 8.93002C23.9237 9.00242 23.329 9.46058 23.329 10.184C23.329 10.9234 23.9482 11.4058 24.8933 11.4058C26.1236 11.4058 27.0851 10.5698 27.0851 9.46864Z"
				fill={ fill }
			/>
			<path
				d="M30.4291 15.7465V14.3398C30.5592 14.3719 30.8525 14.3719 30.9993 14.3719C31.814 14.3719 32.254 14.0344 32.5228 13.1663C32.5228 13.1501 32.6777 12.6518 32.6777 12.6438L29.5817 4.17947H31.488L33.6556 11.0603H33.688L35.8555 4.17947H37.7132L34.5027 13.0777C33.7697 15.1276 32.9223 15.7867 31.146 15.7867C30.9993 15.7867 30.5592 15.7706 30.4291 15.7465Z"
				fill={ fill }
			/>
		</svg>
	);
}
