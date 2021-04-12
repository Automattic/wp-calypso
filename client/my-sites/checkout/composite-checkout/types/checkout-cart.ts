/**
 * External dependencies
 */
import type { LineItem } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import type { CheckoutPaymentMethodSlug } from './checkout-payment-method-slug';

export interface WPCOMCart {
	items: LineItem[];
	total: LineItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
}
