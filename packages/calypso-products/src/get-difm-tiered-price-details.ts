import { isDIFMProduct } from './is-difm-product';
import type { Product, ProductSlug } from './types';

export type DIFMPriceTierProduct = Pick< Product, 'price_tier_list' > & {
	product_slug: string | ProductSlug;
};

/**
 * Returns meaningful DIFM purchase details related to tiered difm prices if available
 * Returns null if this is not a DIFM purchase or the proper related price tier information is not available.
 * Returns just the price details if noOfPages is not passed.
 * Returns the price details alongwith calculated values of extraPageCount and extraPagesPrice is noOfPages is passed.
 *
 * @param { Product | any } product  product to get details from
 * @param { number } noOfPages  the number of pages required
 * @returns {Object} with the relevent tier details
 */
export function getDIFMTieredPriceDetails(
	product: undefined | null | DIFMPriceTierProduct,
	noOfPages?: number
): null | {
	extraPageCount: number | null;
	oneTimeFee: number;
	formattedOneTimeFee: string | null;
	extraPagesPrice: number | null | undefined;
	numberOfIncludedPages: number | null | undefined;
	perExtraPagePrice: number | null | undefined;
} {
	if (
		! product ||
		! isDIFMProduct( product ) ||
		! product.price_tier_list ||
		! Array.isArray( product.price_tier_list ) ||
		product.price_tier_list.length === 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = product.price_tier_list;
	const perExtraPagePrice = tier1.minimum_price - tier0.minimum_price;

	const {
		maximum_units: numberOfIncludedPages,
		minimum_price: oneTimeFee,
		minimum_price_display: formattedOneTimeFee,
	} = tier0;

	let extraPagesPrice: number | null = null;
	let extraPageCount: number | null = null;
	if ( numberOfIncludedPages && noOfPages ) {
		if ( noOfPages <= numberOfIncludedPages ) {
			return {
				extraPageCount: 0,
				numberOfIncludedPages,
				extraPagesPrice: 0,
				oneTimeFee,
				formattedOneTimeFee,
				perExtraPagePrice,
			};
		}
		extraPageCount = noOfPages - numberOfIncludedPages;
		extraPagesPrice = extraPageCount * perExtraPagePrice;
	}

	return {
		extraPageCount,
		numberOfIncludedPages,
		extraPagesPrice,
		oneTimeFee,
		formattedOneTimeFee,
		perExtraPagePrice,
	};
}
