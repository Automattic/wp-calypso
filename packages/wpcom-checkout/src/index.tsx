/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import type { LineItem } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

export function getLineItemsFromCart( cart: ResponseCart ): LineItem[] {
	return cart.products.map( ( product ) => ( {
		id: product.uuid,
		type: 'product',
		label: product.product_name,
		amount: {
			currency: cart.currency,
			value: product.item_subtotal_integer,
			displayValue: product.item_subtotal_display,
		},
	} ) );
}

export function getTotalLineItemFromCart( cart: ResponseCart ): LineItem {
	return {
		id: 'total',
		type: 'total',
		// translators: The label of the total line item in checkout
		label: String( translate( 'Total' ) ),
		amount: {
			currency: cart.currency,
			value: cart.total_cost_integer,
			displayValue: cart.total_cost_display,
		},
	};
}

export function getCouponLineItemFromCart( responseCart: ResponseCart ): LineItem | null {
	if ( ! responseCart.coupon || ! responseCart.coupon_savings_total_integer ) {
		return null;
	}
	return {
		id: 'coupon-line-item',
		// translators: The label of the coupon line item in checkout, including the coupon code
		label: String(
			translate( 'Coupon: %(couponCode)s', { args: { couponCode: responseCart.coupon } } )
		),
		type: 'coupon',
		amount: {
			currency: responseCart.currency,
			value: responseCart.coupon_savings_total_integer,
			// translators: The displayed discount of the coupon line item in checkout
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: { discountAmount: responseCart.coupon_savings_total_display },
				} )
			),
		},
	};
}

export function getSubtotalLineItemFromCart( responseCart: ResponseCart ): LineItem {
	return {
		id: 'subtotal',
		type: 'subtotal',
		// translators: The label of the subtotal line item in checkout
		label: String( translate( 'Subtotal' ) ),
		amount: {
			currency: responseCart.currency,
			value: responseCart.sub_total_integer,
			displayValue: responseCart.sub_total_display,
		},
	};
}

export function getTaxLineItemFromCart( responseCart: ResponseCart ): LineItem | null {
	if ( ! responseCart.tax.display_taxes ) {
		return null;
	}
	return {
		id: 'tax-line-item',
		// translators: The label of the taxes line item in checkout
		label: String( translate( 'Tax' ) ),
		type: 'tax',
		amount: {
			currency: responseCart.currency,
			value: responseCart.total_tax_integer,
			displayValue: responseCart.total_tax_display,
		},
	};
}

export function getCreditsLineItemFromCart( responseCart: ResponseCart ): LineItem | null {
	if ( responseCart.credits_integer <= 0 ) {
		return null;
	}
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	return {
		id: 'credits',
		// translators: The label of the credits line item in checkout
		label: String( translate( 'Credits' ) ),
		type: 'credits',
		amount: {
			currency: responseCart.currency,
			// Clamp the credits value to the total
			value: isFullCredits
				? responseCart.sub_total_with_taxes_integer
				: responseCart.credits_integer,
			// translators: The discount amount of the credits line item in checkout
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: {
						// Clamp the credits display value to the total
						discountAmount: isFullCredits
							? responseCart.sub_total_with_taxes_display
							: responseCart.credits_display,
					},
				} )
			),
		},
	};
}

export function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const subtotal = cart.sub_total_integer;
	const taxes = cart.total_tax_integer;
	const totalBeforeCredits = subtotal + taxes;
	return credits > 0 && totalBeforeCredits > 0 && credits >= totalBeforeCredits;
}
