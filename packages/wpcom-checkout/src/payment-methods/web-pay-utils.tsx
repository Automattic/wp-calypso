import { useShoppingCart } from '@automattic/shopping-cart';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useState, useEffect, useMemo } from 'react';
import { getLabel } from '../checkout-labels';
import { useStableCallback } from '../use-stable-callback';
import type { StripeConfiguration, PaymentRequestOptions } from '@automattic/calypso-stripe';
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
	stripeConfiguration: StripeConfiguration | undefined | null,
	cartKey: CartKey | undefined
): PaymentRequestOptions | null {
	const { responseCart } = useShoppingCart( cartKey );
	const country = getProcessorCountryFromStripeConfiguration( stripeConfiguration );
	const currency = responseCart.currency;
	const { __ } = useI18n();
	const paymentRequestOptions = useMemo( () => {
		debug( 'generating payment request options' );
		if ( ! currency ) {
			return null;
		}
		const total = {
			label: __( 'Total' ),
			amount: responseCart.total_cost_integer,
		};
		return {
			country,
			currency: currency?.toLowerCase(),
			total,
			displayItems: getDisplayItemsForLineItems( responseCart.products ),
			...PAYMENT_REQUEST_OPTIONS,
		};
	}, [ country, currency, responseCart.total_cost_integer, responseCart.products, __ ] );
	debug(
		'returning stripe payment request options',
		paymentRequestOptions,
		'from currency',
		currency
	);
	return paymentRequestOptions;
}

export interface PaymentRequestState {
	paymentRequest: PaymentRequest | undefined | null;
	allowedPaymentTypes: {
		applePay: boolean;
		googlePay: boolean;
	};
	isLoading: boolean;
}

const initialPaymentRequestState: PaymentRequestState = {
	paymentRequest: undefined,
	allowedPaymentTypes: {
		applePay: false,
		googlePay: false,
	},
	isLoading: true,
};

export function useStripePaymentRequest( {
	paymentRequestOptions,
	onSubmit,
	stripe,
}: {
	paymentRequestOptions: PaymentRequestOptions | null;
	stripe: Stripe | null;
	onSubmit: SubmitCompletePaymentMethodTransaction;
} ): PaymentRequestState {
	const [ paymentRequestState, setPaymentRequestState ] = useState< PaymentRequestState >(
		initialPaymentRequestState
	);

	// We have to memoize this to prevent re-creating the paymentRequest
	const callback = useStableCallback( ( paymentMethodResponse ) => {
		completePaymentMethodTransaction( {
			onSubmit,
			...paymentMethodResponse,
		} );
	} );

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
				setPaymentRequestState( ( state ) => ( {
					...state,
					allowedPaymentTypes: {
						applePay: Boolean( result?.applePay ),
						googlePay: Boolean( result?.googlePay ),
					},
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
					allowedPaymentTypes: {
						applePay: false,
						googlePay: false,
					},
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
	}, [ stripe, paymentRequestOptions, callback ] );

	debug(
		'returning stripe payment request; isLoading:',
		paymentRequestState.isLoading,
		'allowedPaymentTypes:',
		paymentRequestState.allowedPaymentTypes
	);
	return paymentRequestState;
}

function getDisplayItemsForLineItems( products: ResponseCartProduct[] ) {
	return products.map( ( product ) => ( {
		label: getLabel( product ),
		amount: product.item_subtotal_integer,
	} ) );
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

function getProcessorCountryFromStripeConfiguration(
	stripeConfiguration: StripeConfiguration | undefined | null
) {
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
