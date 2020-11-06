/**
 * External dependencies
 */
import debugFactory from 'debug';
import type { PaymentMethod, LineItem } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { CheckoutCartItem } from '../types/checkout-cart';
import { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );

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
			return isPaymentMethodEnabled(
				methodObject.id as CheckoutPaymentMethodSlug,
				allowedPaymentMethods
			);
		} )
		.filter(
			( methodObject ) =>
				! isPaymentMethodLegallyRestricted( methodObject.id as CheckoutPaymentMethodSlug )
		);
}

function isPaymentMethodLegallyRestricted( paymentMethodId: CheckoutPaymentMethodSlug ): boolean {
	// Add the names of any legally-restricted payment methods to this list.
	const restrictedPaymentMethods: CheckoutPaymentMethodSlug[] = [];

	return restrictedPaymentMethods.includes( paymentMethodId );
}

function isPaymentMethodEnabled(
	method: CheckoutPaymentMethodSlug,
	allowedPaymentMethods: null | CheckoutPaymentMethodSlug[]
): boolean {
	// By default, allow all payment methods
	if ( ! allowedPaymentMethods?.length ) {
		return true;
	}
	return allowedPaymentMethods.includes( method );
}
