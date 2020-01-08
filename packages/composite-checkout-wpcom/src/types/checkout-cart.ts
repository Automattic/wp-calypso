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

export interface CheckoutCartTotal {
	label: string;
	amount: CheckoutCartItemAmount;
}

/**
 * Cart item with WPCOM specific info added.
 */
export type WPCOMCartItem = CheckoutCartItem & {
	wpcom_meta: { uuid: string; plan_length?: string; product_id: number };
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartTotal;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: number;
}

export const emptyWPCOMCart = {
	items: [] as WPCOMCartItem[],
	tax: {
		id: 'tax-line-item',
		label: 'Tax',
		type: 'tax',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
	} as CheckoutCartItem,
	total: {
		label: 'Total',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
	} as CheckoutCartTotal,
	allowedPaymentMethods: [],
	credits: 0,
} as WPCOMCart;
