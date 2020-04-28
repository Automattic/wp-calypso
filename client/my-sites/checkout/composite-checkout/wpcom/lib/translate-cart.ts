/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	TempResponseCartProduct,
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	CheckoutCartItem,
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from '../types';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param translate Localization function
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateResponseCartToWPCOMCart(
	translate: ( arg0: string, arg1?: any ) => string, //eslint-disable-line @typescript-eslint/no-explicit-any
	serverCart: ResponseCart
): WPCOMCart {
	const {
		products,
		total_tax_integer,
		total_tax_display,
		total_cost_integer,
		total_cost_display,
		savings_total_display,
		savings_total_integer,
		currency,
		credits_integer,
		credits_display,
		allowed_payment_methods,
		sub_total_integer,
		sub_total_display,
		coupon,
		is_coupon_applied,
		tax,
	} = serverCart;

	const taxLineItem: CheckoutCartItem = {
		id: 'tax-line-item',
		label: translate( 'Tax' ),
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	const couponLineItem: WPCOMCartCouponItem = {
		id: 'coupon-line-item',
		label: translate( 'Coupon: %s', { args: coupon } ),
		type: 'coupon',
		amount: {
			currency: currency,
			value: savings_total_integer,
			displayValue: savings_total_display,
		},
		wpcom_meta: {
			couponCode: coupon,
		},
	};

	const totalItem: CheckoutCartItem = {
		id: 'total',
		type: 'total',
		label: translate( 'Total' ),
		amount: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
	};

	const subtotalItem: CheckoutCartItem = {
		id: 'subtotal',
		type: 'subtotal',
		label: translate( 'Subtotal' ),
		amount: {
			currency: currency,
			value: sub_total_integer,
			displayValue: sub_total_display,
		},
	};

	return {
		items: products.map( translateReponseCartProductToWPCOMCartItem ),
		tax: tax.display_taxes ? taxLineItem : null,
		coupon: is_coupon_applied ? couponLineItem : null,
		total: totalItem,
		subtotal: subtotalItem,
		credits: {
			id: 'credits',
			type: 'credits',
			label: translate( 'Credits' ),
			amount: { value: credits_integer, displayValue: credits_display, currency },
		},
		allowedPaymentMethods: allowed_payment_methods
			.filter( ( slug ) => {
				return slug !== 'WPCOM_Billing_MoneyPress_Paygate';
			} ) // TODO: stop returning this from the server
			.map( readWPCOMPaymentMethodClass )
			.map( translateWpcomPaymentMethodToCheckoutPaymentMethod )
			.filter( Boolean ),
		couponCode: coupon,
	};
}

// Convert a backend cart item to a checkout cart item
function translateReponseCartProductToWPCOMCartItem(
	serverCartItem: ResponseCartProduct | TempResponseCartProduct
): WPCOMCartItem {
	const {
		product_id,
		product_name,
		product_slug,
		currency,
		item_original_cost_display,
		item_original_cost_integer,
		item_subtotal_display,
		item_subtotal_integer,
		is_domain_registration,
		is_bundled,
		meta,
		extra,
		volume,
		uuid,
		product_cost_integer,
		product_cost_display,
	} = serverCartItem;

	return {
		id: uuid,
		label: product_name || '',
		sublabel: meta,
		type: product_slug,
		amount: {
			currency: currency || '',
			value: item_subtotal_integer || 0,
			displayValue: item_subtotal_display || '',
		},
		wpcom_meta: {
			uuid: uuid,
			meta,
			product_id,
			product_slug,
			extra,
			volume,
			is_domain_registration: is_domain_registration || false,
			is_bundled: is_bundled || false,
			item_original_cost_display: item_original_cost_display || '',
			item_original_cost_integer: item_original_cost_integer || 0,
			product_cost_integer: product_cost_integer || 0,
			product_cost_display: product_cost_display || '',
		},
	};
}

export function getNonProductWPCOMCartItemTypes(): string[] {
	return [ 'tax', 'coupon', 'total', 'subtotal', 'credits' ];
}
