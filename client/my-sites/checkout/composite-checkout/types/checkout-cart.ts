/**
 * External dependencies
 */
import { ResponseCartProductExtra } from '@automattic/shopping-cart';

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
		extra: ResponseCartProductExtra;
		volume?: number;
		quantity?: number | null;
		item_original_cost_display: string;
		item_original_cost_integer: number;
		item_subtotal_monthly_cost_display: string;
		item_subtotal_monthly_cost_integer: number;
		item_original_subtotal_display: string;
		item_original_subtotal_integer: number;
		months_per_bill_period: null | number;
		is_bundled?: boolean;
		is_domain_registration?: boolean;
		is_sale_coupon_applied?: boolean;
		couponCode?: string;
		product_cost_integer?: number;
		product_cost_display?: string;

		// Temporary optional properties for the monthly pricing test
		related_monthly_plan_cost_display?: string;
		related_monthly_plan_cost_integer?: number;
	};
};

export type WPCOMCartCouponItem = CheckoutCartItem & {
	wpcom_meta: {
		couponCode: string;
	};
};

export type WPCOMCartCreditsItem = CheckoutCartItem & {
	wpcom_meta: {
		credits_integer: number;
		credits_display: string;
	};
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem | null;
	total: CheckoutCartItem;
	savings: CheckoutCartItem | null;
	subtotal: CheckoutCartItem;
	coupon: WPCOMCartCouponItem | null;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: CheckoutCartItem | null;
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
		id: 'coupon',
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
		id: 'total',
		label: 'Total',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
	} as CheckoutCartItem,
	savings: {
		id: 'savings',
		label: 'Savings',
		type: 'savings',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as CheckoutCartItemAmount,
	} as CheckoutCartItem,
	subtotal: {
		id: 'subtotal',
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
		amount: { value: 0, currency: 'USD', displayValue: '0' } as CheckoutCartItemAmount,
	} as CheckoutCartItem,
	couponCode: null,
} as WPCOMCart;
