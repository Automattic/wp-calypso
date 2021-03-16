/**
 * External dependencies
 */
import type { ResponseCartProductExtra, ResponseCartProduct } from '@automattic/shopping-cart';
import type { LineItem } from '@automattic/composite-checkout';

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

export interface WPCOMCart {
	items: WPCOMCartItem[];
	total: LineItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
}
