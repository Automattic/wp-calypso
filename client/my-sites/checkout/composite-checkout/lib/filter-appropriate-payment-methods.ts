import isPaymentMethodEnabled from './is-payment-method-enabled';
import { readCheckoutPaymentMethodSlug } from './translate-payment-method-names';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';

export default function filterAppropriatePaymentMethods( {
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
