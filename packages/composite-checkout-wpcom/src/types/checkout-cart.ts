/**
 * Internal dependencies
 */
import { CheckoutPaymentMethodSlug } from './checkout-payment-method-slug';

/**
 * Amount object as used by composite-checkout. If that
 * package used TS this would belong there.
 */
export interface CheckoutCartItemAmount {
	currency: string;
	value: number;
	displayValue: string;
}

/**
 * Cart item object as used by composite-checkout. If that
 * package used TS this would belong there.
 */
export interface CheckoutCartItem {
	id: string;
	label: string;
	sublabel?: string;
	type: string;
	amount: CheckoutCartItemAmount;
}

/**
 * Cart item with WPCOM specific info added.
 */
export type WPCOMCartItem = CheckoutCartItem & {
	wpcom_meta: { uuid: string; plan_length?: string };
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartItemAmount;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
}
