/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import debugFactory from 'debug';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';

const debug = debugFactory( 'calypso:composite-checkout:use-is-web-pay-available' );

export interface CanMakePaymentState {
	isLoading: boolean;
	isApplePayAvailable: boolean;
	isGooglePayAvailable: boolean;
}

const initialCanMakePaymentsState: CanMakePaymentState = {
	isLoading: true,
	isApplePayAvailable: false,
	isGooglePayAvailable: false,
};

export function useIsWebPayAvailable(
	stripe: Stripe | null,
	stripeConfiguration: StripeConfiguration | null,
	isStripeError: boolean,
	currency: string | null
): CanMakePaymentState {
	const [ canMakePayment, setCanMakePayment ] = useState< CanMakePaymentState >(
		initialCanMakePaymentsState
	);

	useEffect( () => {
		let isSubscribed = true;
		const unsubscribe = () => {
			isSubscribed = false;
		};

		// Only calculate this once
		if ( ! canMakePayment.isLoading ) {
			return unsubscribe;
		}

		// If stripe did not load, we will never load
		if ( isStripeError ) {
			debug( 'isWebPayAvailable giving up due to stripe error' );
			setCanMakePayment( {
				...initialCanMakePaymentsState,
				isLoading: false,
			} );
			return unsubscribe;
		}

		// We'll need the Stripe library so wait until it is loaded
		if ( ! stripe || ! stripeConfiguration ) {
			debug( 'isWebPayAvailable waiting on stripe' );
			return unsubscribe;
		}

		let countryCode = 'US';
		if ( stripeConfiguration ) {
			switch ( stripeConfiguration.processor_id ) {
				case 'stripe_ie':
					countryCode = 'IE';
					break;
				case 'stripe_au':
					countryCode = 'AU';
					break;
				case 'stripe_ca':
					countryCode = 'CA';
					break;
				default:
					break;
			}
		}

		const paymentRequestOptions = {
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
			country: countryCode,
			currency: currency ? currency.toLowerCase() : 'usd',
			// This is just used here to determine if web pay is available, not for
			// the actual payment, so we leave the purchase details blank
			displayItems: [],
			total: {
				label: 'Total',
				amount: 0,
			},
		};
		const request = stripe.paymentRequest( paymentRequestOptions );
		request.canMakePayment().then( ( result ) => {
			if ( ! isSubscribed ) {
				debug( 'useIsWebPayAvailable not subscribed; not updating' );
				return;
			}
			debug( 'stripe paymentRequest.canMakePayment returned', result );
			setCanMakePayment( {
				isLoading: false,
				isApplePayAvailable: !! result?.applePay,
				isGooglePayAvailable: !! result?.googlePay,
			} );
		} );

		return unsubscribe;
	}, [ canMakePayment, stripe, currency, stripeConfiguration, isStripeError ] );

	debug( 'useIsWebPayAvailable', canMakePayment );
	return canMakePayment;
}
