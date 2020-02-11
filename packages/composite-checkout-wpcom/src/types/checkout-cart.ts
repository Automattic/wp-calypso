/**
 * Internal dependencies
 */
import { CheckoutPaymentMethodSlug } from './checkout-payment-method-slug';
import { ResponseCart, ResponseCartProduct } from './backend/shopping-cart-endpoint';

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
		is_domain_registration?: boolean;
	};
};

export interface WPCOMCart {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartItem;
	subtotal: CheckoutCartItem;
	coupon: CheckoutCartItem | null;
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
	} as CheckoutCartItem,
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

export function addWPCOMCartItemToResponseCart(
	responseCart: ResponseCart,
	wpcomCartItem: WPCOMCartItem
): ResponseCart {
	const uuid = getFreshCartItemUUID( responseCart );
	const newProductItem = convertWPCOMCartItemToResponseCartProduct( wpcomCartItem, uuid );
	return {
		...responseCart,
		products: [ ...responseCart.products, newProductItem ],
	};
}

function getFreshCartItemUUID( responseCart: ResponseCart ): string {
	const maxUUID = responseCart.products
		.map( product => product.uuid )
		.reduce( ( accum, current ) => ( accum > current ? accum : current ), '' );
	return maxUUID + '1';
}

function convertWPCOMCartItemToResponseCartProduct(
	wpcomCartItem: WPCOMCartItem,
	uuid: string
): ResponseCartProduct {
	return {
		product_name: wpcomCartItem.label,
		product_slug: wpcomCartItem.type,
		product_id: wpcomCartItem.wpcom_meta.product_id,
		currency: wpcomCartItem.amount.currency,
		item_subtotal_integer: wpcomCartItem.amount.value,
		item_subtotal_display: wpcomCartItem.amount.displayValue,
		is_domain_registration: wpcomCartItem.wpcom_meta.is_domain_registration ?? false,
		meta: wpcomCartItem.wpcom_meta.meta ?? '',
		volume: wpcomCartItem.wpcom_meta.volume ?? 1,
		extra: wpcomCartItem.wpcom_meta.extra,
		uuid,
	};
}
