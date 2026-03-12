import type { Purchase } from '@automattic/api-core';

// Return an ID as used in the payment method list in PaymentMethodSelector
export default function getPaymentMethodIdFromPayment( purchase: Purchase | undefined ): string {
	if ( ! purchase ) {
		return 'none';
	}

	if ( purchase.payment_type === 'credits' ) {
		return 'credits';
	}

	if ( purchase.payment_type === 'paypal' || purchase.payment_type === 'paypal_direct' ) {
		// This intentionally is not 'paypal' even though that's the key of the
		// PayPal payment method because we've decided that for now PayPal
		// agreements must be attached to the subscription for which they were
		// created; if we return 'paypal', then the PayPal option will be selected
		// in the payment method list when PayPal is enabled and in that case we
		// want the PayPal option to mean "add a new PayPal billing agreement".
		// If there's a stored_details_id, return a specific ID for this PayPal method
		// so it can be pre-selected in the list (similar to credit cards).
		if ( purchase.stored_details_id ) {
			return 'existingPayPalPPCP-' + purchase.stored_details_id;
		}
		return 'paypal-existing';
	}

	if ( purchase.payment_type === 'credit_card' && purchase.payment_card_id ) {
		return 'existingCard-' + purchase.payment_card_id;
	}

	return 'none';
}
