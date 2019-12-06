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
import { WPCheckoutWrapper, mockPayPalExpressRequest } from '@automattic/composite-checkout-wpcom';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const registry = createRegistry();
const { registerStore } = registry;

const wpcom = wp.undocumented();

export const getServerCart = wpcom.getCart;

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

export function CompositeCheckoutContainer( { siteSlug } ) {
	return (
		<WPCheckoutWrapper
			siteSlug={ siteSlug }
			getCart={ wpcom.getCart }
			setCart={ wpcom.setCart }
			availablePaymentMethods={ availablePaymentMethods }
			registry={ registry }
		/>
	);
}
