/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from '../types';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateWpcomCartToCheckoutCart( serverCart: ResponseCart ): WPCOMCart {
	const {
		products,
		total_tax_integer,
		total_tax_display,
		total_cost_integer,
		total_cost_display,
		currency,
		credits_integer,
		credits_display,
		allowed_payment_methods,
		sub_total_integer,
		sub_total_display,
	} = serverCart;

	const taxLineItem: CheckoutCartItem = {
		id: 'tax-line-item',
		label: 'Tax',
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	const totalItem: CheckoutCartItem = {
		id: 'total',
		type: 'total',
		label: 'Total',
		amount: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
	};

	const subtotalItem: CheckoutCartItem = {
		id: 'subtotal',
		type: 'subtotal',
		label: 'Subtotal',
		amount: {
			currency: currency,
			value: sub_total_integer,
			displayValue: sub_total_display,
		},
	};

	return {
		items: products.map( translateWpcomCartItemToCheckoutCartItem ),
		tax: taxLineItem,
		total: totalItem,
		subtotal: subtotalItem,
		credits: {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			amount: { value: credits_integer, displayValue: credits_display, currency },
		},
		allowedPaymentMethods: allowed_payment_methods
			.filter( slug => {
				return slug !== 'WPCOM_Billing_MoneyPress_Paygate';
			} ) // TODO: stop returning this from the server
			.map( readWPCOMPaymentMethodClass )
			.map( translateWpcomPaymentMethodToCheckoutPaymentMethod )
			.filter( Boolean ),
	};
}

/**
 * Convert a backend cart item to a checkout cart item
 *
 * @param serverCartItem Cart item object as provided by the backend
 * @param index Index into an array of products; used as a uuid
 * @returns Cart item suitable for passing to the checkout component,
 *     with extra WPCOM specific data attached
 */
function translateWpcomCartItemToCheckoutCartItem(
	serverCartItem: ResponseCartProduct,
	index: number
): WPCOMCartItem {
	const {
		product_id,
		product_name,
		product_slug,
		currency,
		item_subtotal_integer,
		item_subtotal_display,
		is_domain_registration,
		meta,
		extra,
		volume,
	} = serverCartItem;

	// Sublabel is the domain name for registrations
	const sublabel = is_domain_registration ? meta : undefined;

	return {
		id: String( index ),
		label: product_name,
		sublabel: sublabel,
		type: product_slug,
		amount: {
			currency,
			value: item_subtotal_integer,
			displayValue: item_subtotal_display,
		},
		wpcom_meta: {
			uuid: String( index ),
			meta: typeof meta === 'string' ? meta : undefined,
			product_id,
			extra,
			volume,
		},
	};
}
