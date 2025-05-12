import { formatCurrency } from '@automattic/number-formatters';
import { translate, useTranslate } from 'i18n-calypso';
import { getContactDetailsType } from './get-contact-details-type';
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
	product: ResponseCartProduct,
	costOverride: ResponseCartCostOverride
): boolean {
	if ( ! isOverrideCodeIntroductoryOffer( costOverride.override_code ) ) {
		return false;
	}
	if ( ! product.introductory_offer_terms?.enabled ) {
		return false;
	}

	const priceBeforeOverride = costOverride.old_subtotal_integer;
	const priceAfterOverride = costOverride.new_subtotal_integer;
	const monthsForProductBeforeOverride = product.months_per_bill_period ?? 1;
	const priceBeforeOverrideMonthly = priceBeforeOverride / monthsForProductBeforeOverride;
	const monthsForProductAfterOverride = getBillPeriodMonthsForIntroductoryOfferInterval(
		product.introductory_offer_terms.interval_unit
	);
	const priceAfterOverrideMonthly = priceAfterOverride / monthsForProductAfterOverride;

	// If you will pay less per month for the subscription in the cart with the
	// offer than without the offer, this is not a price increase.
	if ( priceBeforeOverrideMonthly >= priceAfterOverrideMonthly ) {
		return false;
	}
	return true;
}

export function doesIntroductoryOfferHavePriceIncrease( product: ResponseCartProduct ): boolean {
	if ( ! product.introductory_offer_terms?.enabled ) {
		return false;
	}
	const hasIntroOfferOverrideWithPriceIncrease = product.cost_overrides?.some( ( override ) =>
		doesIntroductoryOfferCostOverrideHavePriceIncrease( product, override )
	);
	if ( ! hasIntroOfferOverrideWithPriceIncrease ) {
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

/**
 * Return a shopping-cart line item's cost before any discounts are applied.
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
export function getSubtotalWithoutDiscountsForProduct( product: ResponseCartProduct ): number {
	// Return the last original cost override's new price.
	const originalCostOverrides =
		product.cost_overrides?.filter( ( override ) => override.does_override_original_cost ) ?? [];
	if ( originalCostOverrides.length > 0 ) {
		const lastOriginalCostOverride = originalCostOverrides.pop();
		if ( lastOriginalCostOverride ) {
			return lastOriginalCostOverride.new_subtotal_integer;
		}
	}

	// If there is an introductory offer override that increases the price,
	// consider that part of the base price because it's confusing to show
	// "Subtotal before discounts" as lower than the "Subtotal". The details of
	// the price increase will be displayed elsewhere.
	if ( doesIntroductoryOfferHavePriceIncrease( product ) ) {
		const introOffer = product.cost_overrides?.find( ( offer ) =>
			isOverrideCodeIntroductoryOffer( offer.override_code )
		);
		if ( introOffer ) {
			return introOffer.new_subtotal_integer;
		}
	}

	// If there are no original cost overrides, return the first cost override's
	// old price.
	if ( product.cost_overrides && product.cost_overrides.length > 0 ) {
		const firstOverride = product.cost_overrides[ 0 ];
		if ( firstOverride ) {
			return firstOverride.old_subtotal_integer;
		}
	}

	// If there are no cost overrides, return the item's cost, since it has no
	// discounts.
	return product.item_subtotal_integer;
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
 * This does not include credits which are not a discount; they reduce the
 * final price after taxes.
 *
 * Note that this function returns the cost in the currency's smallest unit.
 */
export function getTotalDiscountsWithoutCredits( responseCart: ResponseCart ): number {
	const filteredOverrides = responseCart.products.reduce< ResponseCartCostOverride[] >(
		( overrides, product ) => {
			product.cost_overrides.forEach( ( override ) => {
				if ( override.does_override_original_cost ) {
					return;
				}
				if ( doesIntroductoryOfferCostOverrideHavePriceIncrease( product, override ) ) {
					return;
				}
				overrides.push( override );
			} );
			return overrides;
		},
		[]
	);
	return -filteredOverrides.reduce( ( total, override ) => {
		total = total + ( override.old_subtotal_integer - override.new_subtotal_integer );
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

/**
 * True if the billing/contact info is not filled in on a shopping cart (and it
 * needs to be filled in).
 */
export function isBillingInfoEmpty( responseCart: ResponseCart ): boolean {
	if ( getContactDetailsType( responseCart ) === 'none' ) {
		return false;
	}
	if ( responseCart.tax.location.country_code ) {
		return false;
	}
	return true;
}
