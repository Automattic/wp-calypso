/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import type { LineItem } from '@automattic/composite-checkout';
import type { Stripe, StripeConfiguration } from '@automattic/calypso-stripe';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:composite-checkout:use-is-apple-pay-available' );

declare global {
	interface Window {
		ApplePaySession?: ApplePaySessionInterface;
	}
}

interface ApplePaySessionInterface {
	canMakePayments: () => boolean;
}

export interface CanMakePaymentState {
	isLoading: boolean;
	canMakePayment: boolean;
}

export default function useIsApplePayAvailable(
	stripe: Stripe | null,
	stripeConfiguration: StripeConfiguration | null,
	isStripeError: boolean,
	items: LineItem[]
): CanMakePaymentState {
	const [ canMakePayment, setCanMakePayment ] = useState< CanMakePaymentState >( {
		isLoading: true,
		canMakePayment: false,
	} );

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
			debug( 'isApplePayAvailable giving up due to stripe error' );
			setCanMakePayment( { isLoading: false, canMakePayment: false } );
			return unsubscribe;
		}

		// We'll need the Stripe library so wait until it is loaded
		if ( ! stripe || ! stripeConfiguration ) {
			debug( 'isApplePayAvailable waiting on stripe' );
			return unsubscribe;
		}

		// Our Apple Pay implementation uses the Payment Request API, so
		// check that first.
		if ( ! window.PaymentRequest ) {
			debug( 'isApplePayAvailable giving up because there is no paymentRequest API' );
			setCanMakePayment( { isLoading: false, canMakePayment: false } );
			return unsubscribe;
		}

		// Ask the browser if apple pay can be used. This can be very
		// expensive on certain Safari versions due to a bug
		// (https://trac.webkit.org/changeset/243447/webkit)
		try {
			const browserResponse = !! window.ApplePaySession?.canMakePayments();
			if ( ! browserResponse ) {
				debug( 'isApplePayAvailable giving up because apple pay is not available in browser' );
				setCanMakePayment( { isLoading: false, canMakePayment: false } );
				return unsubscribe;
			}
		} catch ( error ) {
			debug( 'isApplePayAvailable giving up because apple pay is not available in browser' );
			setCanMakePayment( { isLoading: false, canMakePayment: false } );
			return unsubscribe;
		}

		// Ask Stripe if apple pay can be used. This is async.
		let countryCode: string = 'US';

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

		const currency = items.reduce(
			( firstCurrency, item ) => firstCurrency || item.amount.currency,
			null
		);
		const paymentRequestOptions = {
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
			country: countryCode,
			currency: currency ? currency.toLowerCase() : 'usd',
			// This is just used here to determine if apple pay is available, not for the actual payment, so we leave this blank
			displayItems: [],
			total: {
				label: 'Total',
				amount: 0,
			},
		};
		const request = stripe.paymentRequest( paymentRequestOptions );
		request.canMakePayment().then( ( result ) => {
			debug( 'applePay canMakePayment returned', result );
			if ( ! isSubscribed ) {
				debug( 'useIsApplePayAvailable not subscribed; not updating' );
				return;
			}
			debug( 'isApplePayAvailable setting result from Stripe', !! result?.applePay );
			setCanMakePayment( { isLoading: false, canMakePayment: !! result?.applePay } );
		} );

		return unsubscribe;
	}, [ canMakePayment, stripe, items, stripeConfiguration, isStripeError ] );

	debug( 'useIsApplePayAvailable', canMakePayment );
	return canMakePayment;
}
