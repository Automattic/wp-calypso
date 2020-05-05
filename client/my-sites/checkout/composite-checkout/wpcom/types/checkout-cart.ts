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
		product_slug: string;
		extra: object;
		volume?: number;
		item_original_cost_display: string;
		item_original_cost_integer: number;
		is_bundled?: boolean;
		is_domain_registration?: boolean;
		couponCode?: string;
		product_cost_integer?: number;
		product_cost_display?: string;
	};
};

export type WPCOMCartCouponItem = CheckoutCartItem & {
	wpcom_meta: {
		couponCode: string;
	};
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem | null;
	total: CheckoutCartItem;
	subtotal: CheckoutCartItem;
	coupon: WPCOMCartCouponItem | null;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: CheckoutCartItem;
	couponCode: string | null;
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
	coupon: {
		id: 'coupon-line-item',
		label: 'Coupon',
		type: 'coupon',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
		wpcom_meta: {
			couponCode: '',
		},
	} as WPCOMCartCouponItem,
	total: {
		label: 'Total',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
	} as CheckoutCartItem,
	subtotal: {
		label: 'Subtotal',
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
	couponCode: null,
} as WPCOMCart;
