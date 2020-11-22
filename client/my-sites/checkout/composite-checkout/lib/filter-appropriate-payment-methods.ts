/**
 * External dependencies
 */
import debugFactory from 'debug';
import type { PaymentMethod, LineItem } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { CheckoutCartItem } from '../types/checkout-cart';
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import doesPurchaseHaveFullCredits from './does-purchase-have-full-credits';
import { readCheckoutPaymentMethodSlug } from './translate-payment-method-names';
import isPaymentMethodEnabled from './is-payment-method-enabled';

const debug = debugFactory( 'calypso:composite-checkout:filter-appropriate-payment-methods' );

export default function filterAppropriatePaymentMethods( {
	paymentMethodObjects,
	countryCode,
	total,
	credits,
	subtotal,
	responseCart,
	allowedPaymentMethods,
}: {
	paymentMethodObjects: PaymentMethod[];
	countryCode: string;
	total: LineItem;
	credits: CheckoutCartItem | null;
	subtotal: CheckoutCartItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	responseCart: ResponseCart;
} ): PaymentMethod[] {
	const isPurchaseFree = total.amount.value === 0;
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
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
				return isPurchaseFree && ! isFullCredits ? true : false;
			}
			return isPurchaseFree && ! isFullCredits ? false : true;
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
			const slug = readCheckoutPaymentMethodSlug( methodObject.id );
			if ( ! slug ) {
				return false;
			}
			if ( slug === 'full-credits' ) {
				// If the full-credits payment method still exists here (see above filter), it's enabled
				return true;
			}
			if ( slug === 'free-purchase' ) {
				// If the free payment method still exists here (see above filter), it's enabled
				return true;
			}
			return isPaymentMethodEnabled( slug, allowedPaymentMethods );
		} );
}
