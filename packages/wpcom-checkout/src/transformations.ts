import {
	isBiennially,
	isJetpackPlan,
	isJetpackProduct,
	isJetpackSocialAdvancedSlug,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { translate, useTranslate } from 'i18n-calypso';
import { getIntroductoryOfferIntervalDisplay } from './introductory-offer';
import type { LineItemType } from './types';
import type {
	IntroductoryOfferTerms,
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

function getDiscountReasonForIntroductoryOffer(
	terms: IntroductoryOfferTerms,
	translate: ReturnType< typeof useTranslate >
): string {
	return getIntroductoryOfferIntervalDisplay(
		translate,
		terms.interval_unit,
		terms.interval_count,
		false,
		'checkout',
		terms.transition_after_renewal_count
	);
}

export interface CostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;
	uniqueId: string;
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
	>( ( grouped: Record< string, CostOverrideForDisplay >, product ) => {
		const costOverrides = product?.cost_overrides;
		if ( ! costOverrides ) {
			return grouped;
		}

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
					uniqueId: costOverride.override_code + '__' + product.uuid,
					discountAmount: newDiscountAmount,
				};
				return;
			}

			// Do not group introductory offers and replace their text with
			// wording specific to that offer.
			if (
				'introductory-offer' === costOverride.override_code &&
				product.introductory_offer_terms?.enabled
			) {
				if ( ! canDisplayIntroductoryOfferDiscountForProduct( product ) ) {
					return;
				}
				const newDiscountAmount =
					costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;
				grouped[ 'introductory-offer__' + product.uuid ] = {
					overrideCode: costOverride.override_code,
					uniqueId: costOverride.override_code + '__' + product.uuid,
					discountAmount: newDiscountAmount,
					humanReadableReason: getDiscountReasonForIntroductoryOffer(
						product.introductory_offer_terms,
						translate
					),
				};
				return;
			}

			// Most cost overrides go here.
			const discountAmount = grouped[ costOverride.override_code ]?.discountAmount ?? 0;
			const newDiscountAmount =
				costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;
			grouped[ costOverride.override_code ] = {
				humanReadableReason: costOverride.human_readable_reason,
				overrideCode: costOverride.override_code,
				uniqueId: costOverride.override_code,
				discountAmount: discountAmount + newDiscountAmount,
			};
		} );

		// Add a fake "multi-year" discount if applicable. These are not real
		// discounts in terms of our billing system; they are just the
		// difference in cost between a multi-year version of a product and
		// that product's yearly version multiplied by the number of years.
		const multiYearDiscount = getMultiYearDiscountForProduct( product );
		if ( multiYearDiscount > 0 ) {
			const discountAmount = grouped[ 'multi-year-discount' ]?.discountAmount ?? 0;
			grouped[ 'multi-year-discount' ] = {
				humanReadableReason: translate( 'Multi-year discount' ),
				overrideCode: 'multi-year-discount',
				uniqueId: 'multi-year-discount',
				discountAmount: discountAmount + multiYearDiscount,
			};
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

function getYearlyVariantFromProduct( product: ResponseCartProduct ) {
	return product.product_variants.find( ( variant ) => 12 === variant.bill_period_in_months );
}

/**
 * Introductory offer discounts can sometimes be misleading. If we want to hide
 * them for a product in checkout, we can do so in this function.
 */
function canDisplayIntroductoryOfferDiscountForProduct( product: ResponseCartProduct ): boolean {
	// Social Advanced has free trial that we don't consider "introduction offer"
	if ( isJetpackSocialAdvancedSlug( product.product_slug ) ) {
		return false;
	}
	return true;
}

/**
 * The idea of a multi-year discount is conceptual; it is not a true discount
 * in terms of our billing system. Purchases of different product renewal
 * intervals have different prices set and the amount they save depends on what
 * you compare them to.
 *
 * This function allows us to control which store product IDs will be
 * considered for a multi-year discount by `getMultiYearDiscountForProduct()`.
 */
function canDisplayMultiYearDiscountForProduct( product: ResponseCartProduct ): boolean {
	const isJetpack = isJetpackProduct( product ) || isJetpackPlan( product );
	if (
		isJetpack &&
		isBiennially( product ) &&
		! isJetpackSocialAdvancedSlug( product.product_slug )
	) {
		return true;
	}
	return false;
}

/**
 * We want to be able to display a discount for a multi-year purchase, although
 * this is not a true discount; purchases of different product renewal
 * intervals have different prices set and the amount they save depends on what
 * you compare them to.
 *
 * In this case we will ignore monthly intervals and only concern ourselves
 * with the discount of the currently selected product compared to the yearly
 * version of that product multiplied by the number of years, if such a product
 * exists. In order to display the difference in the multi-year price versus
 * the yearly price as a discount, we need to INCREASE the subtotal of the
 * product by the same amount.
 *
 * This function returns the amount by which we'd need to increase that price,
 * which is also the amount of the pseudo-discount.
 */
function getMultiYearDiscountForProduct( product: ResponseCartProduct ): number {
	if ( ! product.months_per_bill_period || ! canDisplayMultiYearDiscountForProduct( product ) ) {
		return 0;
	}
	const oneYearVariant = getYearlyVariantFromProduct( product );
	if ( oneYearVariant ) {
		const numberOfYears = product.months_per_bill_period / 12;
		const multiYearDiscount =
			oneYearVariant.price_before_discounts_integer * numberOfYears -
			product.item_original_cost_integer;
		if ( multiYearDiscount > 0 ) {
			return multiYearDiscount;
		}
	}
	return 0;
}

function getSubtotalWithoutDiscountsForProduct( product: ResponseCartProduct ): number {
	// Increase the undiscounted subtotal (which does not include a multi-year
	// discount, since that is not a real discount) by the cost of each
	// product's multi-year discount so that we can display that savings as a
	// discount.
	const multiYearDiscount = getMultiYearDiscountForProduct( product );
	if ( multiYearDiscount ) {
		return product.item_original_subtotal_integer + multiYearDiscount;
	}

	return product.item_original_subtotal_integer;
}

export function getSubtotalWithoutDiscounts( responseCart: ResponseCart ): number {
	return responseCart.products.reduce( ( total, product ) => {
		return total + getSubtotalWithoutDiscountsForProduct( product );
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
