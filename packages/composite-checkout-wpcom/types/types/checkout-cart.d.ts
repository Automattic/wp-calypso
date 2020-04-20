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
export declare type WPCOMCartItem = CheckoutCartItem & {
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
	total: CheckoutCartTotal;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
	credits: CheckoutCartItem;
}
export declare const emptyWPCOMCart: WPCOMCart;
