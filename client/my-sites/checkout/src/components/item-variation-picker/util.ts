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

	// If the same product is being compared to itself, there is no discount
	if ( variant.productSlug === compareTo.productSlug ) {
		return undefined;
	}

	// A variant with a shorter term should never be cheaper than a variant with a longer term
	if ( compareTo.termIntervalInMonths > variant.termIntervalInMonths ) {
		return undefined;
	}

	// Ignore a 1 month discount when calculating the discount percentage
	if (
		variant.termIntervalInMonths === 24 &&
		compareTo.introductoryInterval === 1 &&
		compareTo.introductoryTerm === 'month'
	) {
		return compareTo.priceBeforeDiscounts * 2;
	}

	// CompareTo price for first-year introductory offers
	if (
		compareTo.introductoryInterval === 1 &&
		compareTo.introductoryTerm === 'year' &&
		variant.introductoryInterval === 2 &&
		variant.introductoryTerm === 'year'
	) {
		return compareTo.priceInteger + compareTo.priceBeforeDiscounts;
	}

	// CompareTo price for Biennial, Triennial, Quadrennial, and so on, products
	if ( compareTo.termIntervalInMonths >= 12 && variant.termIntervalInMonths >= 24 ) {
		const compareToTermIntervalInYears = compareTo.termIntervalInMonths / 12;

		const compareToPricePerYear = compareTo.priceInteger / compareToTermIntervalInYears;
		const compareToPricePerYearBeforeDiscounts =
			compareTo.priceBeforeDiscounts / compareToTermIntervalInYears;

		return (
			compareToPricePerYear +
			compareToPricePerYearBeforeDiscounts * ( variant.termIntervalInMonths / 12 - 1 )
		);
	}

	// Default
	return ( compareTo.priceInteger / compareTo.termIntervalInMonths ) * variant.termIntervalInMonths;
}

export function getItemVariantDiscountPercentage(
	variant: WPCOMProductVariant,
	compareTo?: WPCOMProductVariant
): number {
	const compareToPriceForVariantTerm = getItemVariantCompareToPrice( variant, compareTo );

	// Ignore intro discount if it is a 1 month only discount
	const variantPrice =
		variant.introductoryInterval === 1 && variant.introductoryTerm === 'month'
			? variant.priceBeforeDiscounts
			: variant.priceInteger;

	// Extremely low "discounts" are possible if the price of the longer term has been rounded
	// if they cannot be rounded to at least a percentage point we should not show them.
	const discountPercentage = compareToPriceForVariantTerm
		? Math.round( 100 - ( variantPrice / compareToPriceForVariantTerm ) * 100 )
		: 0;

	return discountPercentage;
}
