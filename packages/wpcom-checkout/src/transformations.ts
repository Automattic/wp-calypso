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
	IntroductoryOfferUnit,
	ResponseCart,
	ResponseCartCostOverride,
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
		hasDeleteButton: ! responseCart.has_auto_renew_coupon_been_automatically_applied,
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
		label: String(
			translate( 'Tax', {
				context: "Shortened form of 'Sales Tax', not a country-specific tax name",
			} )
		),
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
				: String(
						translate( 'Tax', {
							context: "Shortened form of 'Sales Tax', not a country-specific tax name",
						} )
				  );
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
	product: ResponseCartProduct,
	terms: IntroductoryOfferTerms,
	translate: ReturnType< typeof useTranslate >,
	allowFreeText: boolean,
	isPriceIncrease: boolean
): string {
	return getIntroductoryOfferIntervalDisplay( {
		translate,
		intervalUnit: terms.interval_unit,
		intervalCount: terms.interval_count,
		isFreeTrial: product.item_subtotal_integer === 0 && allowFreeText,
		isPriceIncrease,
		context: 'checkout',
		remainingRenewalsUsingOffer: terms.transition_after_renewal_count,
	} );
}

export interface CostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;

	/**
	 * The amount saved by this cost override in the currency's smallest unit.
	 */
	discountAmount: number;
}

export interface LineItemCostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;

	/**
	 * The amount saved by this cost override in the currency's smallest unit.
	 *
	 * If not set, a number will not be displayed. This can be useful for some
	 * types of discounts where the amount will be communicated in some other
	 * manner.
	 */
	discountAmount?: number;
}

export function isUserVisibleCostOverride( costOverride: {
	does_override_original_cost: boolean;
	override_code: string;
} ): boolean {
	if ( costOverride.does_override_original_cost ) {
		// We won't display original cost overrides since they are
		// included in the original cost that's being displayed. They
		// are not discounts.
		return false;
	}
	return true;
}

function makeSaleCostOverrideUnique(
	costOverride: ResponseCartCostOverride,
	product: ResponseCartProduct,
	translate: ReturnType< typeof useTranslate >
): ResponseCartCostOverride {
	// Separate out Sale Coupons because we want to show the name
	// of each item on sale.
	if ( costOverride.override_code === 'sale-coupon-discount-1' ) {
		return {
			...costOverride,
			human_readable_reason: translate( 'Sale: %(productName)s', {
				textOnly: true,
				args: { productName: product.product_name },
			} ),
		};
	}
	return costOverride;
}

/**
 * Replace introductory offer cost override text with wording specific to that
 * offer, like "Discount for first 3 months" instead of "Introductory offer".
 */
function makeIntroductoryOfferCostOverrideUnique(
	costOverride: ResponseCartCostOverride,
	product: ResponseCartProduct,
	translate: ReturnType< typeof useTranslate >,
	allowFreeText: boolean
): ResponseCartCostOverride {
	if ( 'introductory-offer' !== costOverride.override_code || ! product.introductory_offer_terms ) {
		return costOverride;
	}
	const isPriceIncrease = costOverride.old_subtotal_integer < costOverride.new_subtotal_integer;

	// Renewals get generic text because an introductory offer manual renewal
	// can be hard to explain simply and saying "Discount for first 3 months"
	// may not be accurate.
	if ( product.is_renewal ) {
		return {
			...costOverride,
			human_readable_reason: isPriceIncrease
				? translate( 'Prorated renewal' )
				: translate( 'Prorated renewal discount' ),
		};
	}

	return {
		...costOverride,
		human_readable_reason: getDiscountReasonForIntroductoryOffer(
			product,
			product.introductory_offer_terms,
			translate,
			allowFreeText,
			isPriceIncrease
		),
	};
}

function getDiscountForCostOverrideForDisplay( costOverride: ResponseCartCostOverride ): number {
	return costOverride.old_subtotal_integer - costOverride.new_subtotal_integer;
}

function getBillPeriodMonthsForIntroductoryOfferInterval(
	interval: IntroductoryOfferUnit
): number {
	switch ( interval ) {
		case 'month':
			return 1;
		case 'year':
			return 12;
		default:
			return 0;
	}
}

/**
 * Returns true if the product has an introductory offer which is for a
 * different term length than the term length of the product (eg: a 3 month
 * discount for an annual plan).
 */
export function doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
	costOverrides: { override_code: string }[] | undefined,
	introductoryOfferTerms: ResponseCartProduct[ 'introductory_offer_terms' ] | undefined,
	monthsPerBillPeriodForProduct: number | undefined | null
): boolean {
	if (
		costOverrides?.some( ( costOverride ) => {
			! isOverrideCodeIntroductoryOffer( costOverride.override_code );
		} )
	) {
		return false;
	}
	if ( ! introductoryOfferTerms?.enabled ) {
		return false;
	}
	if (
		getBillPeriodMonthsForIntroductoryOfferInterval( introductoryOfferTerms.interval_unit ) ===
		monthsPerBillPeriodForProduct
	) {
		return false;
	}
	return true;
}

function doesIntroductoryOfferCostOverrideHavePriceIncrease(
	costOverride: ResponseCartCostOverride
): boolean {
	if ( ! isOverrideCodeIntroductoryOffer( costOverride.override_code ) ) {
		return false;
	}
	if ( costOverride.old_subtotal_integer >= costOverride.new_subtotal_integer ) {
		return false;
	}
	return true;
}

export function doesIntroductoryOfferHavePriceIncrease( product: ResponseCartProduct ): boolean {
	const introOffer = product.cost_overrides?.find(
		doesIntroductoryOfferCostOverrideHavePriceIncrease
	);
	if ( ! introOffer ) {
		return false;
	}
	if ( ! product.introductory_offer_terms?.enabled ) {
		return false;
	}
	return true;
}

export function filterCostOverridesForLineItem(
	product: ResponseCartProduct,
	translate: ReturnType< typeof useTranslate >
): LineItemCostOverrideForDisplay[] {
	const costOverrides = product?.cost_overrides ?? [];

	return (
		costOverrides
			.filter( ( costOverride ) => isUserVisibleCostOverride( costOverride ) )
			// Hide coupon overrides because they will be displayed separately.
			.filter( ( costOverride ) => costOverride.override_code !== 'coupon-discount' )
			.map( ( costOverride ) => makeSaleCostOverrideUnique( costOverride, product, translate ) )
			.map( ( costOverride ) =>
				makeIntroductoryOfferCostOverrideUnique( costOverride, product, translate, true )
			)
			.map( ( costOverride ) => {
				// Introductory offers which are renewals may have a prorated
				// discount amount which is hard to display as a simple
				// discount, so we will hide the discounted amount here.
				if ( costOverride.override_code === 'introductory-offer' && product.is_renewal ) {
					return {
						humanReadableReason: costOverride.human_readable_reason,
						overrideCode: costOverride.override_code,
					};
				}

				// Introductory offer discounts with term lengths that differ from
				// the term length of the product (eg: a 3 month discount for an
				// annual plan) need to be displayed differently because the
				// discount is only temporary and the user will still be charged
				// the remainder before the next renewal.
				if (
					isOverrideCodeIntroductoryOffer( costOverride.override_code ) &&
					doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
						product.cost_overrides,
						product.introductory_offer_terms,
						product.months_per_bill_period
					)
				) {
					return {
						humanReadableReason: costOverride.human_readable_reason,
						overrideCode: costOverride.override_code,
					};
				}

				// Introductory offer discounts which are price increases
				// should have their full details displayed because displaying
				// them as a simple price change can be confusing. We therefore
				// hide the price change amount.
				if ( doesIntroductoryOfferHavePriceIncrease( product ) ) {
					return {
						humanReadableReason: costOverride.human_readable_reason,
						overrideCode: costOverride.override_code,
					};
				}

				return {
					humanReadableReason: costOverride.human_readable_reason,
					overrideCode: costOverride.override_code,
					discountAmount: getDiscountForCostOverrideForDisplay( costOverride ),
				};
			} )
	);
}

/**
 * Returns cost overrides (typically discounts) for display in checkout.
 *
 * Cost overrides are applied to shopping-cart line items, but they are
 * displayed as if they applied to the entire cart. For example, we may have
 * two items which have a "Coupon code" discount, but we will only display one
 * "Coupon code" discount line which shows the savings from both of those items
 * combined.
 *
 * This function therefore merges the discounts for each line item in the cart
 * by the item's human-readable reason.
 *
 * In most cases, the human-readable reasons are provided directly by the
 * shopping-cart, but each cost override also includes a unique code which
 * identifies it and we can use those codes to perform special behaviors for
 * certain discounts. For example we rename Sale Coupon discounts to mention
 * the item on sale.
 *
 * This function also removes original cost overrides since they are never
 * displayed to users (they represent a change to the product's base price
 * rather than a discount).
 *
 * Finally, this adds a fake "multi-year" pseudo-discount in some cases (see
 * `canDisplayMultiYearDiscountForProduct()`). In that case, the cart item's
 * total will also need to be increased by this amount for the discount to be
 * subtracted without messing up the math. See
 * `getMultiYearDiscountForProduct()`,
 * `getSubtotalWithoutDiscountsForProduct()`, and
 * `getSubtotalWithoutDiscounts().`
 */
export function filterAndGroupCostOverridesForDisplay(
	responseCart: ResponseCart,
	translate: ReturnType< typeof useTranslate >
): CostOverrideForDisplay[] {
	// Collect cost overrides from each line item and group them by type so we
	// can show them all together after the line item list.
	const costOverridesGrouped = responseCart.products.reduce<
		Record< string, CostOverrideForDisplay >
	>( ( grouped: Record< string, CostOverrideForDisplay >, product ) => {
		const costOverrides = product?.cost_overrides ?? [];

		costOverrides
			.filter( ( costOverride ) => isUserVisibleCostOverride( costOverride ) )
			// Remove intro offers which increase the cost because they are not
			// discounts and will have their terms displayed elsewhere.
			.filter(
				( costOverride ) => ! doesIntroductoryOfferCostOverrideHavePriceIncrease( costOverride )
			)
			.map( ( costOverride ) => makeSaleCostOverrideUnique( costOverride, product, translate ) )
			.map( ( costOverride ) =>
				makeIntroductoryOfferCostOverrideUnique( costOverride, product, translate, false )
			)
			.forEach( ( costOverride ) => {
				// Group discounts by human_readable_reason.
				const discountAmount = grouped[ costOverride.human_readable_reason ]?.discountAmount ?? 0;
				grouped[ costOverride.human_readable_reason ] = {
					humanReadableReason: costOverride.human_readable_reason,
					overrideCode: costOverride.override_code,
					discountAmount: discountAmount + getDiscountForCostOverrideForDisplay( costOverride ),
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
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
function getMultiYearDiscountForProduct( product: ResponseCartProduct ): number {
	if ( ! product.months_per_bill_period || ! canDisplayMultiYearDiscountForProduct( product ) ) {
		return 0;
	}

	const oneYearVariant = getYearlyVariantFromProduct( product );
	if ( oneYearVariant ) {
		const numberOfYears = product.months_per_bill_period / 12;
		const expectedMultiYearPrice = oneYearVariant.price_before_discounts_integer * numberOfYears;
		const actualMultiYearPrice = product.item_original_cost_integer;
		const multiYearDiscount = expectedMultiYearPrice - actualMultiYearPrice;
		if ( multiYearDiscount > 0 ) {
			return multiYearDiscount;
		}
	}

	return 0;
}

/**
 * Return a shopping-cart line item's cost before any discounts are applied.
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
export function getSubtotalWithoutDiscountsForProduct( product: ResponseCartProduct ): number {
	// If there is a fake multi-year pseudo-discount being displayed for this
	// line item, we need to increase the total of the line item by that amount
	// so that the math for the discount makes sense. See
	// `getMultiYearDiscountForProduct()`.
	const multiYearDiscount = getMultiYearDiscountForProduct( product );

	// Return the last original cost override's new price.
	const originalCostOverrides =
		product.cost_overrides?.filter( ( override ) => override.does_override_original_cost ) ?? [];
	if ( originalCostOverrides.length > 0 ) {
		const lastOriginalCostOverride = originalCostOverrides.pop();
		if ( lastOriginalCostOverride ) {
			return lastOriginalCostOverride.new_subtotal_integer + multiYearDiscount;
		}
	}

	// If there is an introductory offer override that increases the price,
	// consider that part of the base price because it's confusing to show
	// "Subtotal before discounts" as lower than the "Subtotal". The details of
	// the price increase will be displayed elsewhere.
	if ( doesIntroductoryOfferHavePriceIncrease( product ) ) {
		const introOffer = product.cost_overrides?.find(
			( offer ) => offer.override_code === 'introductory-offer'
		);
		if ( introOffer ) {
			return introOffer.new_subtotal_integer + multiYearDiscount;
		}
	}

	// If there are no original cost overrides, return the first cost override's
	// old price.
	if ( product.cost_overrides && product.cost_overrides.length > 0 ) {
		const firstOverride = product.cost_overrides[ 0 ];
		if ( firstOverride ) {
			return firstOverride.old_subtotal_integer + multiYearDiscount;
		}
	}

	// If there are no cost overrides, return the item's cost, since it has no
	// discounts.
	return product.item_subtotal_integer + multiYearDiscount;
}

/**
 * Return the shopping-cart subtotal before any discounts have been applied to
 * any cart item.
 *
 * This does not include credits which are not a discount; they reduce the
 * final price after taxes.
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
export function getSubtotalWithoutDiscounts( responseCart: ResponseCart ): number {
	return responseCart.products.reduce( ( total, product ) => {
		return total + getSubtotalWithoutDiscountsForProduct( product );
	}, 0 );
}

/**
 * Return the total savings from shopping-cart item discounts.
 *
 * This includes fake "multi-year" pseudo-discounts. See
 * `getMultiYearDiscountForProduct()`.
 *
 * This does not include credits which are not a discount; they reduce the
 * final price after taxes.
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
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

export function isOverrideCodeIntroductoryOffer( overrideCode: string ): boolean {
	switch ( overrideCode ) {
		case 'introductory-offer':
			return true;
		case 'prorated-introductory-offer':
			return true;
		case 'quantity-upgrade-introductory-offer':
			return true;
	}
	return false;
}
