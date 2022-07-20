import { useTotal } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { getLabel } from '../checkout-labels';
import type { StripeConfiguration, PaymentRequestOptions } from '@automattic/calypso-stripe';
import type { LineItem } from '@automattic/composite-checkout';
import type { CartKey, ResponseCartProduct } from '@automattic/shopping-cart';
import type { PaymentRequest, Stripe } from '@stripe/stripe-js';

const debug = debugFactory( 'wpcom-checkout:web-pay-utils' );

export type SubmitCompletePaymentMethodTransaction = ( {
	paymentMethodToken,
	name,
}: {
	paymentMethodToken: string;
	name: string;
} ) => void;

const PAYMENT_REQUEST_OPTIONS = {
	requestPayerName: true,
	requestPayerPhone: false,
	requestPayerEmail: false,
	requestShipping: false,
};

export function usePaymentRequestOptions(
	stripeConfiguration: StripeConfiguration,
	cartKey: CartKey
): PaymentRequestOptions | null {
	const total = useTotal();
	const { responseCart } = useShoppingCart( cartKey );
	const country = getProcessorCountryFromStripeConfiguration( stripeConfiguration );
	const currency = responseCart.currency;
	const paymentRequestOptions = useMemo( () => {
		debug( 'generating payment request options' );
		if ( ! currency || ! total.amount.value ) {
			return null;
		}
		return {
			country,
			currency: currency?.toLowerCase(),
			total: getPaymentRequestTotalFromTotal( total ),
			displayItems: getDisplayItemsForLineItems( responseCart.products ),
			...PAYMENT_REQUEST_OPTIONS,
		};
	}, [ country, currency, total, responseCart.products ] );
	debug( 'returning stripe payment request options', paymentRequestOptions );
	return paymentRequestOptions;
}

export interface PaymentRequestState {
	paymentRequest: PaymentRequest | undefined | null;
	canMakePayment: boolean;
	isLoading: boolean;
}

const initialPaymentRequestState: PaymentRequestState = {
	paymentRequest: undefined,
	canMakePayment: false,
	isLoading: true,
};

export function useStripePaymentRequest( {
	webPaymentType,
	paymentRequestOptions,
	onSubmit,
	stripe,
}: {
	webPaymentType: 'google-pay' | 'apple-pay';
	paymentRequestOptions: PaymentRequestOptions | null;
	stripe: Stripe;
	onSubmit: SubmitCompletePaymentMethodTransaction;
} ): PaymentRequestState {
	const [ paymentRequestState, setPaymentRequestState ] = useState< PaymentRequestState >(
		initialPaymentRequestState
	);

	// We have to memoize this to prevent re-creating the paymentRequest
	const callback = useCallback(
		( paymentMethodResponse ) => {
			completePaymentMethodTransaction( {
				onSubmit,
				...paymentMethodResponse,
			} );
		},
		[ onSubmit ]
	);

	useEffect( () => {
		if ( ! stripe || ! paymentRequestOptions ) {
			return;
		}
		let isSubscribed = true;
		debug( 'creating stripe payment request', paymentRequestOptions );
		const request: PaymentRequest = stripe.paymentRequest( paymentRequestOptions );
		request
			.canMakePayment()
			.then( ( result ) => {
				if ( ! isSubscribed ) {
					return;
				}
				debug( 'canMakePayment returned from stripe paymentRequest', result );
				const canMakePayment =
					webPaymentType === 'google-pay' ? result?.googlePay : result?.applePay;
				setPaymentRequestState( ( state ) => ( {
					...state,
					canMakePayment: !! canMakePayment,
					isLoading: false,
				} ) );
			} )
			.catch( ( error ) => {
				if ( ! isSubscribed ) {
					return;
				}
				// eslint-disable-next-line no-console
				console.error( 'Error while creating stripe payment request', error );
				setPaymentRequestState( ( state ) => ( {
					...state,
					canMakePayment: false,
					isLoading: false,
				} ) );
			} );
		request.on( 'paymentmethod', callback );
		setPaymentRequestState( ( state ) => ( {
			...state,
			paymentRequest: request,
		} ) );
		return () => {
			isSubscribed = false;
		};
	}, [ stripe, paymentRequestOptions, callback, webPaymentType ] );

	debug(
		'returning stripe payment request; isLoading:',
		paymentRequestState.isLoading,
		'canMakePayment:',
		paymentRequestState.canMakePayment
	);
	return paymentRequestState;
}

function getDisplayItemsForLineItems( products: ResponseCartProduct[] ) {
	return products.map( ( product ) => ( {
		label: getLabel( product ),
		amount: product.item_subtotal_integer,
	} ) );
}

function getPaymentRequestTotalFromTotal( total: LineItem ) {
	return {
		label: total.label,
		amount: total.amount.value,
	};
}

function completePaymentMethodTransaction( {
	onSubmit,
	complete,
	paymentMethod,
	payerName,
}: {
	onSubmit: SubmitCompletePaymentMethodTransaction;
	complete: ( message: string ) => void;
	paymentMethod: { id: string };
	payerName: string;
} ) {
	onSubmit( { paymentMethodToken: paymentMethod.id, name: payerName } );
	complete( 'success' );
}

function getProcessorCountryFromStripeConfiguration( stripeConfiguration: StripeConfiguration ) {
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
	return countryCode;
}
