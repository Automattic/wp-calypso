import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
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
	const credits = getCreditsUsedByCart( responseCart );
	if ( credits === 0 ) {
		return null;
	}
	return {
		id: 'credits',
		// translators: The label of the credits line item in checkout
		label: String( translate( 'Credits' ) ),
		type: 'credits',
		// translators: The discount amount of the credits line item in checkout
		formattedAmount: String(
			translate( '- %(discountAmount)s', {
				args: {
					discountAmount: formatCurrency( credits, responseCart.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
			} )
		),
	};
}

/**
 * Even though a user might have a number of credits available, that number may
 * be greater than the cart's total. This function returns the number of
 * credits actually being used by a cart.
 */
function getCreditsUsedByCart( responseCart: ResponseCart ): number {
	if ( responseCart.credits_integer <= 0 ) {
		return 0;
	}
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	return isFullCredits ? responseCart.sub_total_with_taxes_integer : responseCart.credits_integer;
}

/*
 * Coupon discounts are applied (or not, as appropriate) to each line item's
 * total, so the cart's subtotal includes them. However, because it's nice to
 * be able to display the coupon discount as a discount separately from the
 * subtotal, this function returns the cart's subtotal with the coupon savings
 * removed.
 */
export function getSubtotalWithoutCoupon( responseCart: ResponseCart ): number {
	return responseCart.sub_total_integer + responseCart.coupon_savings_total_integer;
}

export function getOriginalSubtotal( responseCart: ResponseCart ): number {
	return responseCart.products.reduce( ( total, product ) => {
		return total + product.item_original_subtotal_integer;
	}, 0 );
}

export function getJetpackIntroductoryDiscount( responseCart: ResponseCart ): number {
	const jetpackProduct = responseCart.products.find(
		( product ) => isJetpackProduct( product ) || isJetpackPlan( product )
	);

	if ( ! jetpackProduct || ! jetpackProduct.introductory_offer_terms?.enabled ) {
		return 0; // No Jetpack product found, or no introductory offer
	}

	if ( 24 === jetpackProduct.months_per_bill_period ) {
		// If the plan is 2-year plan, we show introductory discount for yearly variant (and the price leftover is "multi-year discount")
		const yearlyVariant = jetpackProduct.product_variants.find(
			( variant ) => 12 === variant.bill_period_in_months
		);

		if ( ! yearlyVariant ) {
			return 0; // No yearly variant found
		}

		return yearlyVariant.price_before_discounts_integer - yearlyVariant.price_integer;
	}

	// If the Jetpack is not a 2-year plan, we just simply return difference of original and current subtotal (without coupon)
	return (
		jetpackProduct.item_original_cost_integer -
		jetpackProduct.item_subtotal_integer +
		( jetpackProduct.coupon_savings_integer ?? 0 )
	);
}

export function getJetpackBiYearlyDiscount( responseCart: ResponseCart ): number {
	const introDiscount = getJetpackIntroductoryDiscount( responseCart );
	const originalSubtotal = getOriginalSubtotal( responseCart );
	const subtotal = getSubtotalWithoutCoupon( responseCart );

	// Bi-yearly discount is calculated as a leftover from introductory discount
	return originalSubtotal - introDiscount - subtotal;
}
/**
 * Credits are the only type of cart discount that is applied to the cart as a
 * whole and not to individual line items. The subtotal is only a subtotal of
 * line items and does not have credits applied. Therefore, if we want to
 * display credits as a discount along with other discounts before the
 * subtotal, we probably want to display the subtotal as having credits already
 * applied, which this function returns.
 */
export function getSubtotalWithCredits( responseCart: ResponseCart ): number {
	return responseCart.sub_total_integer - getCreditsUsedByCart( responseCart );
}

export function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const subtotal = cart.sub_total_integer;
	const taxes = cart.total_tax_integer;
	const totalBeforeCredits = subtotal + taxes;
	return credits > 0 && totalBeforeCredits > 0 && credits >= totalBeforeCredits;
}
