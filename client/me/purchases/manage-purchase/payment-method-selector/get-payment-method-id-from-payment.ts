/**
 * Internal Dependencies
 */
import type { PurchasePayment } from 'calypso/lib/purchases/types';

// Return an ID as used in the payment method list inside CheckoutPaymentMethods.
export default function getPaymentMethodIdFromPayment( payment: PurchasePayment ): string {
	if ( payment?.type === 'credits' ) {
		return 'credits';
	}
	if ( payment?.type === 'paypal' ) {
		// This intentionally is not 'paypal' even though that's the key of the
		// PayPal payment method because we've decided that for now PayPal
		// agreements must be attached to the subscription for which they were
		// created; if we return 'paypal', then the PayPal option will be selected
		// in the payment method list when PayPal is enabled and in that case we
		// want the PayPal option to mean "add a new PayPal billing agreement".
		return 'paypal-existing';
	}
	if ( payment?.type === 'credit_card' && payment.creditCard ) {
		return 'existingCard-' + payment.creditCard.id;
	}
	return 'none';
}
