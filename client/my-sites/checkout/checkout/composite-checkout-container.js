/**
 * External dependencies
 */
import React from 'react';
import {
	createRegistry,
	createPayPalMethod,
	createStripeMethod,
	createApplePayMethod,
} from '@automattic/composite-checkout';
import {
	WPCheckoutWrapper,
	makeShoppingCartHook,
	mockPayPalExpressRequest,
} from '@automattic/composite-checkout-wpcom';
import { useTranslate } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import notices from 'notices';

const debug = debugFactory( 'calypso:composite-checkout-container' );

const initialCart = {
	coupon: '',
	currency: 'BRL',
	is_coupon_applied: false,
	products: [
		{
			extra: {
				context: 'signup',
				domain_registration_agreement_url:
					'https://wordpress.com/automattic-domain-name-registration-agreement/',
				privacy: true,
				privacy_available: true,
				registrar: 'KS_RAM',
			},
			free_trial: false,
			meta: 'asdkfjalsdkjfalsdjkflaksdjflkajsdfffd.com',
			product_id: 106,
			volume: 1,
		},
		{
			extra: {
				context: 'signup',
				domain_to_bundle: 'asdkfjalsdkjfalsdjkflaksdjflkajsdfffd.com',
			},
			free_trial: false,
			meta: '',
			product_id: 1009,
			volume: 1,
		},
	],
	tax: {
		display_taxes: false,
		location: {},
	},
	temporary: false,
};

const registry = createRegistry();
const { registerStore } = registry;

const wpcom = wp.undocumented();

const useShoppingCart = makeShoppingCartHook(
	( cartKey, cartParam ) => wpcom.setCart( cartKey, cartParam ),
	initialCart
);

async function fetchStripeConfiguration( requestArgs ) {
	return wpcom.stripeConfiguration( requestArgs );
}

async function sendStripeTransaction() {
	// return await wpcom.req.post( '/me/transactions', transaction );
	return {
		success: true,
	};
}

const stripeMethod = createStripeMethod( {
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
} );

const paypalMethod = createPayPalMethod( {
	registerStore: registerStore,
	makePayPalExpressRequest: mockPayPalExpressRequest,
} );

const applePayMethod = isApplePayAvailable()
	? createApplePayMethod( {
			registerStore,
			fetchStripeConfiguration,
	  } )
	: null;

export function isApplePayAvailable() {
	// Our Apple Pay implementation uses the Payment Request API, so check that first.
	if ( ! window.PaymentRequest ) {
		return false;
	}

	// Check if Apple Pay is available. This can be very expensive on certain
	// Safari versions due to a bug (https://trac.webkit.org/changeset/243447/webkit),
	// and there is no way it can change during a page request, so cache the
	// result.
	if ( typeof isApplePayAvailable.canMakePayments === 'undefined' ) {
		try {
			isApplePayAvailable.canMakePayments = Boolean(
				window.ApplePaySession && window.ApplePaySession.canMakePayments()
			);
		} catch ( error ) {
			console.error( error ); // eslint-disable-line no-console
			return false;
		}
	}
	return isApplePayAvailable.canMakePayments;
}

const availablePaymentMethods = [ applePayMethod, stripeMethod, paypalMethod ].filter( Boolean );

export default function CompositeCheckoutContainer() {
	const translate = useTranslate();
	const onSuccess = () => {
		debug( 'success' );
		notices.success( translate( 'Your purchase was successful!' ) );
	};

	const onFailure = error => {
		debug( 'error', error );
		const message = error && error.toString ? error.toString() : error;
		notices.error( message || translate( 'An error occurred during your purchase.' ) );
	};

	return (
		<WPCheckoutWrapper
			useShoppingCart={ useShoppingCart }
			availablePaymentMethods={ availablePaymentMethods }
			registry={ registry }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
		/>
	);
}
