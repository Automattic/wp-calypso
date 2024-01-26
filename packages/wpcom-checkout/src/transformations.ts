import {
	isBiennially,
	isJetpackPlan,
	isJetpackProduct,
	isJetpackSocialAdvancedSlug,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { translate, useTranslate } from 'i18n-calypso';
import type { LineItemType } from './types';
import type {
	ResponseCart,
	ResponseCartProduct,
	TaxBreakdownItem,
} from '@automattic/shopping-cart';

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

export interface CostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;
	discountAmount: number;
}

export function filterAndGroupCostOverridesForDisplay(
	responseCart: ResponseCart,
	translate: ReturnType< typeof useTranslate >
): CostOverrideForDisplay[] {
	// Collect cost overrides from each line item and group them by type so we
	// can show them all together after the line item list.
	const costOverridesGrouped = responseCart.products.reduce<
		Record< string, CostOverrideForDisplay >
	>( ( grouped, product ) => {
		const costOverrides = product?.cost_overrides;
		if ( ! costOverrides ) {
			return grouped;
		}

		const isJetpack = isJetpackProduct( product ) || isJetpackPlan( product );
		let productDiscountAmountTotal = 0;

		costOverrides.forEach( ( costOverride ) => {
			if ( costOverride.does_override_original_cost ) {
				// We won't display original cost overrides since they are
				// included in the original cost that's being displayed. They
				// are not discounts.
				return;
			}

			// Do not group Sale Coupons because we want to show the name of each item on sale.
			if ( costOverride.override_code === 'sale-coupon-discount-1' ) {
				const newDiscountAmount =
					costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;

				grouped[ costOverride.override_code + '__' + product.uuid ] = {
					humanReadableReason: translate( 'Sale: %(productName)s', {
						textOnly: true,
						args: { productName: product.product_name },
					} ),
					overrideCode: costOverride.override_code,
					discountAmount: newDiscountAmount,
				};
				return;
			}

			const discountAmount = grouped[ costOverride.override_code ]?.discountAmount ?? 0;
			let newDiscountAmount = costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;
			let overrideReason = '';

			// Overrides for Jetpack biennial intro offers
			if ( 'introductory-offer' === costOverride.override_code ) {
				if ( isJetpack ) {
					overrideReason = translate( 'Introductory offer*' );
				}
				if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
					// Social Advanced has free trial that we don't consider "introduction offer"
					return;
				} else if ( isJetpack && isBiennially( product ) ) {
					// For all other products, we show introductory discount for yearly variant (the rest is considered multi-year discount)
					const yearlyVariant = getYearlyVariantFromProduct( product );
					if ( yearlyVariant ) {
						newDiscountAmount =
							yearlyVariant.price_before_discounts_integer - yearlyVariant.price_integer;
					}
				}
			}
			grouped[ costOverride.override_code ] = {
				humanReadableReason: overrideReason || costOverride.human_readable_reason,
				overrideCode: costOverride.override_code,
				discountAmount: discountAmount + newDiscountAmount,
			};
			productDiscountAmountTotal += newDiscountAmount;
		} );

		// Add a fake cost override for introductory offers until D134600-code
		// is merged because they are otherwise discounts that are invisible to
		// the list of cost overrides. Remove this once that diff is merged.
		if (
			product.introductory_offer_terms?.enabled &&
			! costOverrides.some( ( override ) => override.override_code === 'introductory-offer' )
		) {
			const discountAmount = grouped[ 'introductory-offer' ]?.discountAmount ?? 0;
			let newDiscountAmount =
				product.item_original_subtotal_integer - product.item_subtotal_before_discounts_integer;
			// Override for Jetpack two-year products: we show introductory discount for yearly variant (the rest is considered multi-year discount)
			if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
				// Social Advanced has free trial that we don't consider "introduction offer"
				newDiscountAmount = 0;
			} else if ( isJetpack && isBiennially( product ) ) {
				// For all other products, we show introductory discount for yearly variant (the rest is considered multi-year discount)
				const yearlyVariant = getYearlyVariantFromProduct( product );
				if ( yearlyVariant ) {
					newDiscountAmount =
						yearlyVariant.price_before_discounts_integer - yearlyVariant.price_integer;
				}
			}
			if ( newDiscountAmount > 0 ) {
				grouped[ 'introductory-offer' ] = {
					humanReadableReason: isJetpack
						? translate( 'Introductory offer*' )
						: translate( 'Introductory offer' ),
					overrideCode: 'introductory-offer',
					discountAmount: discountAmount + newDiscountAmount,
				};
				productDiscountAmountTotal += newDiscountAmount;
			}
		}

		if ( isJetpack && isBiennially( product ) ) {
			const discountAmount = grouped[ 'multi-year-discount' ]?.discountAmount ?? 0;
			const yearlyVariant = getYearlyVariantFromProduct( product );
			const biennialVariant = getBiennialVariantFromProduct( product );

			if ( yearlyVariant && biennialVariant ) {
				// Coupon is added on top of multi-year discount, so we don't include it in the calculation
				const discountWithoutCoupon =
					productDiscountAmountTotal - ( product.coupon_savings_integer ?? 0 );
				const newDiscountAmount =
					2 * yearlyVariant.price_before_discounts_integer -
					discountWithoutCoupon -
					biennialVariant.price_integer;

				if ( newDiscountAmount > 0 ) {
					grouped[ 'multi-year-discount' ] = {
						humanReadableReason: translate( 'Multi-year discount' ),
						overrideCode: 'multi-year-discount',
						discountAmount: discountAmount + newDiscountAmount,
					};
				}
			}
		}
		return grouped;
	}, {} );

	return Object.values( costOverridesGrouped );
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

function getBiennialVariantFromProduct( product: ResponseCartProduct ) {
	return product.product_variants.find( ( variant ) => 24 === variant.bill_period_in_months );
}

function getYearlyVariantFromProduct( product: ResponseCartProduct ) {
	return product.product_variants.find( ( variant ) => 12 === variant.bill_period_in_months );
}

export function getSubtotalWithoutDiscounts( responseCart: ResponseCart ): number {
	return responseCart.products.reduce( ( total, product ) => {
		const isJetpack = isJetpackProduct( product ) || isJetpackPlan( product );

		if ( isJetpack && isBiennially( product ) ) {
			const yearlyVariant = getYearlyVariantFromProduct( product );

			if ( yearlyVariant ) {
				return total + yearlyVariant.price_before_discounts_integer * 2;
			}
		}
		return total + product.item_original_subtotal_integer;
	}, 0 );
}

export function hasIntroductoryDiscount( responseCart: ResponseCart ): boolean {
	return responseCart.products.some(
		( product ) =>
			( isJetpackPlan( product ) || isJetpackProduct( product ) ) &&
			!! product.introductory_offer_terms?.enabled
	);
}

export function getTotalDiscountsWithoutCredits(
	responseCart: ResponseCart,
	translate: ReturnType< typeof useTranslate >
): number {
	const filteredOverrides = filterAndGroupCostOverridesForDisplay( responseCart, translate );
	return -filteredOverrides.reduce( ( total, override ) => {
		total = total + override.discountAmount;
		return total;
	}, 0 );
}

export function doesPurchaseHaveFullCredits( cart: ResponseCart ): boolean {
	const credits = cart.credits_integer;
	const subtotal = cart.sub_total_integer;
	const taxes = cart.total_tax_integer;
	const totalBeforeCredits = subtotal + taxes;
	return credits > 0 && totalBeforeCredits > 0 && credits >= totalBeforeCredits;
}
