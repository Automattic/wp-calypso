/**
 * External dependencies
 */
import debugFactory from 'debug';
import type { PaymentMethod, LineItem } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import type { CheckoutCartItem } from '../types/checkout-cart';
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import { isRedirectPaymentMethod } from './translate-payment-method-names';
import config from 'calypso/config';

const debug = debugFactory( 'calypso:composite-checkout:filter-appropriate-payment-methods' );

export default function filterAppropriatePaymentMethods( {
	paymentMethodObjects,
	countryCode,
	total,
	credits,
	subtotal,
	allowedPaymentMethods,
}: {
	paymentMethodObjects: PaymentMethod[];
	countryCode: string;
	total: LineItem;
	credits: CheckoutCartItem | null;
	subtotal: CheckoutCartItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
} ): PaymentMethod[] {
	const isPurchaseFree = total.amount.value === 0;
	const isFullCredits =
		! isPurchaseFree &&
		credits &&
		credits.amount.value > 0 &&
		credits.amount.value >= subtotal.amount.value;
	debug( 'filtering payment methods with this input', {
		total,
		credits,
		subtotal,
		allowedPaymentMethods,
		isPurchaseFree,
		isFullCredits,
		countryCode,
	} );

	return paymentMethodObjects
		.filter( ( methodObject ) => {
			// If the purchase is free, only display the free-purchase method
			if ( methodObject.id === 'free-purchase' ) {
				return isPurchaseFree ? true : false;
			}
			return isPurchaseFree ? false : true;
		} )
		.filter( ( methodObject ) => {
			// If the purchase is full-credits, only display the full-credits method
			if ( methodObject.id === 'full-credits' ) {
				return isFullCredits ? true : false;
			}
			return isFullCredits ? false : true;
		} )
		.filter( ( methodObject ) => {
			// Some country-specific payment methods should only be available if that
			// country is selected in the contact information.
			if ( methodObject.id === 'netbanking' && countryCode !== 'IN' ) {
				return false;
			}
			if ( methodObject.id === 'ebanx-tef' && countryCode !== 'BR' ) {
				return false;
			}
			return true;
		} )
		.filter( ( methodObject ) => {
			if ( methodObject.id.startsWith( 'existingCard-' ) ) {
				return isPaymentMethodEnabled( 'card', allowedPaymentMethods );
			}
			if ( methodObject.id === 'full-credits' ) {
				// If the full-credits payment method still exists here (see above filter), it's enabled
				return true;
			}
			if ( methodObject.id === 'free-purchase' ) {
				// If the free payment method still exists here (see above filter), it's enabled
				return true;
			}
			return isPaymentMethodEnabled( methodObject.id, allowedPaymentMethods );
		} )
		.filter( ( methodObject ) => ! isPaymentMethodLegallyRestricted( methodObject.id ) );
}

function isPaymentMethodLegallyRestricted( paymentMethodId: CheckoutPaymentMethodSlug ): boolean {
	// Add the names of any legally-restricted payment methods to this list.
	const restrictedPaymentMethods: CheckoutPaymentMethodSlug[] = [];

	return restrictedPaymentMethods.includes( paymentMethodId );
}

function isPaymentMethodEnabled(
	slug: CheckoutPaymentMethodSlug,
	allowedPaymentMethods: null | CheckoutPaymentMethodSlug[]
): boolean {
	// Redirect payments might not be possible in some cases - for example in the desktop app
	if ( isRedirectPaymentMethod( slug ) && ! config.isEnabled( 'upgrades/redirect-payments' ) ) {
		return false;
	}

	// By default, allow all payment methods
	if ( ! allowedPaymentMethods?.length ) {
		return true;
	}

	return allowedPaymentMethods.includes( slug );
}
