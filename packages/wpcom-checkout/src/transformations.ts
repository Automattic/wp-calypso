import { formatCurrency } from '@automattic/format-currency';
import { translate } from 'i18n-calypso';
import type { LineItemType } from './types';
import type { ResponseCart, TaxBreakdownItem } from '@automattic/shopping-cart';

export function getTotalLineItemFromCart( cart: ResponseCart ): LineItemType {
	return {
		id: 'total',
		type: 'total',
		// translators: The label of the total line item in checkout
		label: String( translate( 'Total' ) ),
		formattedAmount: formatCurrency( cart.total_cost_integer, cart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};
}

export function getCouponLineItemFromCart( responseCart: ResponseCart ): LineItemType | null {
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
		// translators: The displayed discount of the coupon line item in checkout
		formattedAmount: String(
			translate( '- %(discountAmount)s', {
				args: {
					discountAmount: formatCurrency(
						responseCart.coupon_savings_total_integer,
						responseCart.currency,
						{ isSmallestUnit: true, stripZeros: true }
					),
				},
			} )
		),
	};
}

export function getSubtotalLineItemFromCart( responseCart: ResponseCart ): LineItemType {
	return {
		id: 'subtotal',
		type: 'subtotal',
		// translators: The label of the subtotal line item in checkout
		label: String( translate( 'Subtotal' ) ),
		formattedAmount: formatCurrency( responseCart.sub_total_integer, responseCart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};
}

export function getTaxLineItemFromCart( responseCart: ResponseCart ): LineItemType | null {
	if ( ! responseCart.tax.display_taxes ) {
		return null;
	}
	return {
		id: 'tax-line-item',
		// translators: The label of the taxes line item in checkout
		label: String( translate( 'Tax' ) ),
		type: 'tax',
		formattedAmount: formatCurrency( responseCart.total_tax_integer, responseCart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};
}

export function getTaxBreakdownLineItemsFromCart( responseCart: ResponseCart ): LineItemType[] {
	if ( ! responseCart.tax.display_taxes ) {
		return [];
	}
	if (
		! Array.isArray( responseCart.total_tax_breakdown ) ||
		responseCart.total_tax_breakdown.length === 0
	) {
		const lineItem = getTaxLineItemFromCart( responseCart );
		return lineItem ? [ lineItem ] : [];
	}
	return responseCart.total_tax_breakdown.map(
		( taxBreakdownItem: TaxBreakdownItem ): LineItemType => {
			const id = `tax-line-item-${ taxBreakdownItem.label ?? taxBreakdownItem.rate }`;
			const label = taxBreakdownItem.label
				? `${ taxBreakdownItem.label } (${ taxBreakdownItem.rate_display })`
				: String( translate( 'Tax' ) );
			return {
				id,
				label,
				type: 'tax',
				formattedAmount: formatCurrency(
					taxBreakdownItem.tax_collected_integer,
					responseCart.currency,
					{
						isSmallestUnit: true,
						stripZeros: true,
					}
				),
			};
		}
	);
}

export function getCreditsLineItemFromCart( responseCart: ResponseCart ): LineItemType | null {
	if ( responseCart.credits_integer <= 0 ) {
		return null;
	}
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	return {
		id: 'credits',
		// translators: The label of the credits line item in checkout
		label: String( translate( 'Credits' ) ),
		type: 'credits',
		// translators: The discount amount of the credits line item in checkout
		formattedAmount: String(
			translate( '- %(discountAmount)s', {
				args: {
					// Clamp the credits display value to the total
					discountAmount: formatCurrency(
						isFullCredits
							? responseCart.sub_total_with_taxes_integer
							: responseCart.credits_integer,
						responseCart.currency,
						{ isSmallestUnit: true, stripZeros: true }
					),
				},
			} )
		),
	};
}

export function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const subtotal = cart.sub_total_integer;
	const taxes = cart.total_tax_integer;
	const totalBeforeCredits = subtotal + taxes;
	return credits > 0 && totalBeforeCredits > 0 && credits >= totalBeforeCredits;
}
