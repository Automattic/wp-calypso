/**
 * Internal Dependencies
 */
import type { PurchasePayment } from 'calypso/lib/purchases/types';

// Return an ID as used in the payment method list in PaymentMethodSelector
export default function getPaymentMethodIdFromPayment(
	payment: PurchasePayment | undefined
): string {
	if ( payment?.type === 'credit_card' && payment.creditCard ) {
		return 'existingCard-' + payment.creditCard.id;
	}
	return 'none';
}
