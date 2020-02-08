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
	wpcom_meta: {
		uuid: string;
		meta?: string;
		plan_length?: string;
		product_id: number;
		extra: object;
		volume?: number;
	};
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: CheckoutCartItem;
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
	} as CheckoutCartItem,
	allowedPaymentMethods: [],
	credits: {
		id: 'Credits',
		label: 'Credits',
		type: 'credits',
		amount: { value: 0, currency: 'USD', displayValue: '0' },
	},
} as WPCOMCart;
