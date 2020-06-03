/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

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
import { isPlan, isDomainTransferProduct, isDomainProduct } from 'lib/products-values';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateResponseCartToWPCOMCart( serverCart: ResponseCart ): WPCOMCart {
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
		label: String( translate( 'Tax' ) ),
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	const couponLineItem: WPCOMCartCouponItem = {
		id: 'coupon-line-item',
		label: String( translate( 'Coupon: %s', { args: coupon } ) ),
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
		label: String( translate( 'Total' ) ),
		amount: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
	};

	const subtotalItem: CheckoutCartItem = {
		id: 'subtotal',
		type: 'subtotal',
		label: String( translate( 'Subtotal' ) ),
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
			label: String( translate( 'Credits' ) ),
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
		item_original_monthly_cost_display,
		item_original_monthly_cost_integer,
		item_original_subtotal_display,
		item_original_subtotal_integer,
		months_per_bill_period,
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

	let label = product_name || '';
	let sublabel;
	if ( isPlan( serverCartItem ) ) {
		sublabel = String( translate( 'Plan Subscription' ) );
	} else if ( 'premium_theme' === product_slug || 'concierge-session' === product_slug ) {
		sublabel = '';
	} else if (
		meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
		label = meta;
		sublabel = product_name || '';
	}

	const type = isPlan( serverCartItem ) ? 'plan' : product_slug;

	// for displaying crossed-out original price
	let itemOriginalCostDisplay = item_original_cost_display || '';
	let itemOriginalSubtotalDisplay = item_original_subtotal_display || '';
	let itemOriginalMonthlyCostDisplay = item_original_monthly_cost_display || '';
	// but for the credits item this is confusing and unnecessary
	if ( 'wordpress-com-credits' === product_slug ) {
		itemOriginalCostDisplay = '';
		itemOriginalSubtotalDisplay = '';
		itemOriginalMonthlyCostDisplay = '';
	}

	return {
		id: uuid,
		label,
		sublabel,
		type,
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
			item_original_cost_display: itemOriginalCostDisplay,
			item_original_cost_integer: item_original_cost_integer || 0,
			item_original_monthly_cost_display: itemOriginalMonthlyCostDisplay,
			item_original_monthly_cost_integer: item_original_monthly_cost_integer || 0,
			item_original_subtotal_display: itemOriginalSubtotalDisplay,
			item_original_subtotal_integer: item_original_subtotal_integer || 0,
			months_per_bill_period,
			product_cost_integer: product_cost_integer || 0,
			product_cost_display: product_cost_display || '',
		},
	};
}

export function getNonProductWPCOMCartItemTypes(): string[] {
	return [ 'tax', 'coupon', 'total', 'subtotal', 'credits' ];
}
