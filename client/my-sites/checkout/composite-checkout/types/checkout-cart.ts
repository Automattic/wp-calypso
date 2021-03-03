/**
 * External dependencies
 */
import type { ResponseCartProductExtra, ResponseCartProduct } from '@automattic/shopping-cart';
import type { LineItem, LineItemAmount } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import type { CheckoutPaymentMethodSlug } from './checkout-payment-method-slug';

/**
 * Cart item with WPCOM specific info added.
 */
export type WPCOMCartItem = LineItem & {
	wpcom_response_cart_product: ResponseCartProduct;
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

export type WPCOMCartCouponItem = LineItem & {
	wpcom_meta: {
		couponCode: string;
	};
};

export type WPCOMCartCreditsItem = LineItem & {
	wpcom_meta: {
		credits_integer: number;
		credits_display: string;
	};
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: LineItem | null;
	total: LineItem;
	savings: LineItem | null;
	subtotal: LineItem;
	coupon: WPCOMCartCouponItem | null;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: LineItem | null;
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
		} as LineItemAmount,
	} as LineItem,
	coupon: {
		id: 'coupon',
		label: 'Coupon',
		type: 'coupon',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as LineItemAmount,
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
		} as LineItemAmount,
	} as LineItem,
	savings: {
		id: 'savings',
		label: 'Savings',
		type: 'savings',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as LineItemAmount,
	} as LineItem,
	subtotal: {
		id: 'subtotal',
		label: 'Subtotal',
		amount: {
			value: 0,
			currency: '',
			displayValue: '',
		} as LineItemAmount,
	} as LineItem,
	allowedPaymentMethods: [],
	credits: {
		id: 'Credits',
		label: 'Credits',
		type: 'credits',
		amount: { value: 0, currency: 'USD', displayValue: '0' } as LineItemAmount,
	} as LineItem,
	couponCode: null,
} as WPCOMCart;
