import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import isPaymentMethodEnabled from './is-payment-method-enabled';
import { readCheckoutPaymentMethodSlug } from './translate-payment-method-names';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';

export default function filterAppropriatePaymentMethods( {
	paymentMethodObjects,
	responseCart,
	allowedPaymentMethods,
}: {
	paymentMethodObjects: PaymentMethod[];
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	responseCart: ResponseCart;
} ): PaymentMethod[] {
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );

	return paymentMethodObjects
		.filter( ( methodObject ) => {
			// If the purchase is free, only display the free-purchase method
			if ( methodObject.id === 'free-purchase' ) {
				return isPurchaseFree || isFullCredits ? true : false;
			}
			return isPurchaseFree || isFullCredits ? false : true;
		} )
		.filter( ( methodObject ) => {
			const slug = readCheckoutPaymentMethodSlug( methodObject.id );
			if ( ! slug ) {
				return false;
			}
			return isPaymentMethodEnabled( slug, allowedPaymentMethods );
		} );
}
