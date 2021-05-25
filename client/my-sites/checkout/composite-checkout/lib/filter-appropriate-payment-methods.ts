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
			const slug = readCheckoutPaymentMethodSlug( methodObject.id );
			if ( ! slug ) {
				return false;
			}
			return isPaymentMethodEnabled( slug, allowedPaymentMethods, countryCode );
		} );
}
