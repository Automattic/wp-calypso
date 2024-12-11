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
	let isPayPalPPCPEnabled = false;
	return paymentMethodObjects
		.filter( ( methodObject ) => {
			const slug = readCheckoutPaymentMethodSlug( methodObject.id );
			if ( ! slug ) {
				return false;
			}
			if ( ! isPaymentMethodEnabled( slug, allowedPaymentMethods ) ) {
				return false;
			}
			if ( slug === 'paypal-js' ) {
				isPayPalPPCPEnabled = true;
			}
			return true;
		} )
		.filter( ( methodObject ) => {
			// Only allow one of 'paypal-express' or 'paypal-js' in checkout. We
			// don't want to confuse users with both options, even if they are both
			// available. 'paypal-js' takes precedence.
			const slug = readCheckoutPaymentMethodSlug( methodObject.id );
			if ( ! slug ) {
				return false;
			}
			if ( isPayPalPPCPEnabled && slug === 'paypal-express' ) {
				return false;
			}
			return true;
		} );
}
