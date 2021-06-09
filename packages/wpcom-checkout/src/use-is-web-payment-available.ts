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
	currency: string | null,
	total: number | null
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

		const normalizedCurrency: string = currency ? currency.toLowerCase() : 'usd';
		// These arrays let us easily turn off web payments for particular currencies.
		// Other payment methods handle this on the backend in a similar way.
		const applePayDisabledCurrencies: string[] = [];
		const googlePayDisabledCurrencies: string[] = [ 'inr', 'idr', 'huf', 'twd' ];
		const isApplePayAllowedForCurrency = ! applePayDisabledCurrencies.includes(
			normalizedCurrency
		);
		if ( ! isApplePayAllowedForCurrency ) {
			debug( 'Apple Pay disabled by currency check.' );
		}
		const isGooglePayAllowedForCurrency = ! googlePayDisabledCurrencies.includes(
			normalizedCurrency
		);
		if ( ! isGooglePayAllowedForCurrency ) {
			debug( 'Google Pay disabled by currency check.' );
		}

		const paymentRequestOptions = {
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
			country: countryCode,
			currency: normalizedCurrency,
			// This is just used here to determine if web pay is available, not for
			// the actual payment, so we leave most of the purchase details blank
			displayItems: [],
			total: {
				label: 'Total',
				amount: total ?? 0,
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
				isApplePayAvailable: isApplePayAllowedForCurrency && !! result?.applePay,
				isGooglePayAvailable: isGooglePayAllowedForCurrency && !! result?.googlePay,
			} );
		} );

		return unsubscribe;
	}, [ canMakePayment, stripe, currency, total, stripeConfiguration, isStripeError ] );

	debug( 'useIsWebPayAvailable', canMakePayment );
	return canMakePayment;
}
