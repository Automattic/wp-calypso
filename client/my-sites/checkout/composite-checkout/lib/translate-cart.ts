/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import {
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	WPCOMCartCreditsItem,
	CheckoutCartItem,
} from '../types/checkout-cart';
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from './translate-payment-method-names';
import { isPlan, isDomainTransferProduct, isDomainProduct } from 'calypso/lib/products-values';
import { isRenewal } from 'calypso/lib/cart-values/cart-items';
import doesValueExist from './does-value-exist';
import doesPurchaseHaveFullCredits from './does-purchase-have-full-credits';

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
		coupon_savings_total_display,
		coupon_savings_total_integer,
		sub_total_with_taxes_display,
		savings_total_display,
		savings_total_integer,
		currency,
		credits_integer,
		credits_display,
		allowed_payment_methods,
		sub_total_integer,
		sub_total_display,
		coupon,
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
		label: String( translate( 'Coupon: %(couponCode)s', { args: { couponCode: coupon } } ) ),
		type: 'coupon',
		amount: {
			currency: currency,
			value: coupon_savings_total_integer,
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: { discountAmount: coupon_savings_total_display },
				} )
			),
		},
		wpcom_meta: {
			couponCode: coupon,
		},
	};

	const creditsLineItem: WPCOMCartCreditsItem = {
		id: 'credits',
		label: String( translate( 'Credits' ) ),
		type: 'credits',
		amount: {
			currency: currency,
			value: credits_integer,
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: {
						// Clamp the credits display value to the total
						discountAmount: doesPurchaseHaveFullCredits( serverCart )
							? sub_total_with_taxes_display
							: credits_display,
					},
				} )
			),
		},
		wpcom_meta: {
			credits_integer,
			credits_display,
		},
	};

	const savingsLineItem: CheckoutCartItem = {
		id: 'savings-line-item',
		label: String( translate( 'Total savings' ) ),
		type: 'savings',
		amount: {
			currency: currency,
			value: savings_total_integer,
			displayValue: savings_total_display,
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

	const alwaysEnabledPaymentMethods = [ 'full-credits', 'free-purchase' ];

	const allowedPaymentMethods = [ ...allowed_payment_methods, ...alwaysEnabledPaymentMethods ]
		.map( readWPCOMPaymentMethodClass )
		.filter( doesValueExist )
		.map( translateWpcomPaymentMethodToCheckoutPaymentMethod );

	return {
		items: products.filter( isRealProduct ).map( translateReponseCartProductToWPCOMCartItem ),
		tax: tax.display_taxes ? taxLineItem : null,
		coupon: coupon && coupon_savings_total_integer ? couponLineItem : null,
		total: totalItem,
		savings: savings_total_integer > 0 ? savingsLineItem : null,
		subtotal: subtotalItem,
		credits: credits_integer > 0 ? creditsLineItem : null,
		allowedPaymentMethods,
		couponCode: coupon,
	};
}

function isRealProduct( serverCartItem: ResponseCartProduct ): boolean {
	// Credits are displayed separately, so we do not need to include the pseudo-product in the line items.
	if ( serverCartItem.product_slug === 'wordpress-com-credits' ) {
		return false;
	}
	return true;
}

// Convert a backend cart item to a checkout cart item
function translateReponseCartProductToWPCOMCartItem(
	serverCartItem: ResponseCartProduct
): WPCOMCartItem {
	const {
		product_id,
		product_name,
		product_slug,
		currency,
		item_original_cost_display,
		item_original_cost_integer,
		item_subtotal_monthly_cost_display,
		item_subtotal_monthly_cost_integer,
		item_original_subtotal_display,
		item_original_subtotal_integer,
		related_monthly_plan_cost_display,
		related_monthly_plan_cost_integer,
		is_sale_coupon_applied,
		months_per_bill_period,
		item_subtotal_display,
		item_subtotal_integer,
		is_domain_registration,
		is_bundled,
		meta,
		extra,
		volume,
		quantity,
		uuid,
		product_cost_integer,
		product_cost_display,
	} = serverCartItem;

	let label = product_name || '';
	let sublabel;
	if ( isPlan( serverCartItem ) ) {
		if ( isRenewal( serverCartItem ) ) {
			sublabel = String( translate( 'Plan Renewal' ) );
		} else {
			sublabel = String( translate( 'Plan Subscription' ) );
		}
	} else if ( 'premium_theme' === product_slug || 'concierge-session' === product_slug ) {
		sublabel = '';
	} else if (
		meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
		label = meta;
		if ( isRenewal( serverCartItem ) && product_name ) {
			sublabel = String(
				translate( '%(productName)s Renewal', { args: { productName: product_name } } )
			);
		}
		if ( isRenewal( serverCartItem ) && ! product_name ) {
			sublabel = String( translate( 'Renewal' ) );
		}
		if ( ! isRenewal( serverCartItem ) ) {
			sublabel = product_name || '';
		}
	} else if ( isRenewal( serverCartItem ) ) {
		sublabel = String( translate( 'Renewal' ) );
	}

	const type = isPlan( serverCartItem ) ? 'plan' : product_slug;

	// for displaying crossed-out original price
	const itemOriginalCostDisplay = item_original_cost_display || '';
	const itemOriginalSubtotalDisplay = item_original_subtotal_display || '';
	const itemSubtotalMonthlyCostDisplay = item_subtotal_monthly_cost_display || '';

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
			quantity,
			is_domain_registration: is_domain_registration || false,
			is_bundled: is_bundled || false,
			item_original_cost_display: itemOriginalCostDisplay,
			item_original_cost_integer: item_original_cost_integer || 0,
			item_subtotal_monthly_cost_display: itemSubtotalMonthlyCostDisplay,
			item_subtotal_monthly_cost_integer: item_subtotal_monthly_cost_integer || 0,
			item_original_subtotal_display: itemOriginalSubtotalDisplay,
			item_original_subtotal_integer: item_original_subtotal_integer || 0,
			is_sale_coupon_applied: is_sale_coupon_applied || false,
			months_per_bill_period,
			product_cost_integer: product_cost_integer || 0,
			product_cost_display: product_cost_display || '',
			related_monthly_plan_cost_integer: related_monthly_plan_cost_integer || 0,
			related_monthly_plan_cost_display: related_monthly_plan_cost_display || '',
		},
	};
}

export function getNonProductWPCOMCartItemTypes(): string[] {
	return [ 'tax', 'coupon', 'total', 'subtotal', 'credits', 'savings' ];
}
