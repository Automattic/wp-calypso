import { isPaymentMethodEnabled, readCheckoutPaymentMethodSlug } from './index';
import type { CheckoutPaymentMethodSlug } from './types';
import type { PaymentMethod } from '@automattic/composite-checkout';

export function filterAppropriatePaymentMethods( {
	paymentMethodObjects,
	allowedPaymentMethods,
}: {
	paymentMethodObjects: PaymentMethod[];
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
} ): PaymentMethod[] {
	return paymentMethodObjects.filter( ( methodObject ) => {
		const slug = readCheckoutPaymentMethodSlug( methodObject.id );
		if ( ! slug ) {
			return false;
		}
		return isPaymentMethodEnabled( slug, allowedPaymentMethods );
	} );
}
