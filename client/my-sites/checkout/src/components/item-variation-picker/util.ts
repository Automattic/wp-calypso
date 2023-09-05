import type { WPCOMProductVariant } from './types';

export function getItemVariantCompareToPrice(
	variant: WPCOMProductVariant,
	compareTo?: WPCOMProductVariant
): number | undefined {
	// This is the price that the compareTo variant would be if it was using the
	// billing term of the variant. For example, if the price of the compareTo
	// variant was 120 per year, and the variant we are displaying here is 5 per
	// month, then `compareToPriceForVariantTerm` would be (120 / 12) * 1,
	// or 10 (per month). In this case, selecting the variant would save the user
	// 50% (5 / 10).
	if ( ! compareTo ) {
		return undefined;
	}

	// CompareTo price with introductory offers (For Jetpack)
	if (
		compareTo.introductoryInterval === 1 &&
		compareTo.introductoryTerm === 'year' &&
		variant.introductoryInterval === 2 &&
		variant.introductoryTerm === 'year'
	) {
		return compareTo.priceInteger + compareTo.priceBeforeDiscounts;
	}

	// CompareTo price without intro offers (For WPCOM)
	return ( compareTo.priceInteger / compareTo.termIntervalInMonths ) * variant.termIntervalInMonths;
}

export function getItemVariantDiscountPercentage(
	variant: WPCOMProductVariant,
	compareTo?: WPCOMProductVariant
): number {
	const compareToPriceForVariantTerm = getItemVariantCompareToPrice( variant, compareTo );
	// Extremely low "discounts" are possible if the price of the longer term has been rounded
	// if they cannot be rounded to at least a percentage point we should not show them.
	const discountPercentage = compareToPriceForVariantTerm
		? Math.round( 100 - ( variant.priceInteger / compareToPriceForVariantTerm ) * 100 )
		: 0;
	return discountPercentage;
}
