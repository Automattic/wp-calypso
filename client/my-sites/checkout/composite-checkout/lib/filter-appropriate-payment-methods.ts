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
	const isPurchaseFree =
		responseCart.total_cost_integer === 0 || doesPurchaseHaveFullCredits( responseCart );

	if ( isPurchaseFree ) {
		return paymentMethodObjects.filter( ( methodObject ) => methodObject.id === 'free-purchase' );
	}

	return paymentMethodObjects.filter( ( methodObject ) => {
		const slug = readCheckoutPaymentMethodSlug( methodObject.id );
		if ( ! slug || slug === 'free-purchase' ) {
			return false;
		}
		return isPaymentMethodEnabled( slug, allowedPaymentMethods );
	} );
}
