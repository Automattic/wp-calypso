/**
 * External dependencies
 */
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import type { CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import { readCheckoutPaymentMethodSlug } from './translate-payment-method-names';
import isPaymentMethodEnabled from './is-payment-method-enabled';

export default function filterAppropriatePaymentMethods( {
	paymentMethodObjects,
	countryCode,
	responseCart,
	allowedPaymentMethods,
}: {
	paymentMethodObjects: PaymentMethod[];
	countryCode: string;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	responseCart: ResponseCart;
} ): PaymentMethod[] {
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );

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
