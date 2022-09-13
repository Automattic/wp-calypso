import { isDIFMProduct } from './is-difm-product';
import type { Product, ProductSlug } from './types';

export type DIFMPriceTierProduct = Pick< Product, 'price_tier_list' > & {
	product_slug: string | ProductSlug;
};

/**
 * Returns meaningful DIFM purchase details related to tiered difm prices if available
 * Returns null if this is not a DIFM purchase or the proper related price tier information is not available.
 *
 * @param { Product | any } product  product to get details from
 * @param { number } noOfPages  the number of pages required
 * @returns {object} with the relevent tier details
 */
export function getDIFMTieredPriceDetails(
	product: undefined | DIFMPriceTierProduct,
	noOfPages: number
): null | {
	extraPageCount: number | null;
	oneTimeFee: number;
	oneTimeFeeNormalUnits: number;
	formattedOneTimeFee: string | null;
	extraPagesPrice: number | null | undefined;
	extraPagesPriceNormalUnits: number | null | undefined;
	numberOfIncludedPages: number | null | undefined;
	perExtraPagePriceNormalUnits: number;
} {
	if (
		! product ||
		! isDIFMProduct( product ) ||
		! product.price_tier_list ||
		! Array.isArray( product.price_tier_list ) ||
		product.price_tier_list.length === 0 ||
		noOfPages < 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = product.price_tier_list;
	const perExtraPagePrice = tier1.minimum_price - tier0.minimum_price;
	const perExtraPagePriceNormalUnits =
		tier1.minimum_price_in_display_units - tier0.minimum_price_in_display_units;

	const {
		maximum_units: numberOfIncludedPages,
		minimum_price: oneTimeFee,
		minimum_price_in_display_units: oneTimeFeeNormalUnits,
		minimum_price_display: formattedOneTimeFee,
	} = tier0;

	let extraPagesPrice: number | null = null;
	let extraPagesPriceNormalUnits: number | null = null;
	let extraPageCount: number | null = null;
	if ( numberOfIncludedPages ) {
		if ( noOfPages <= numberOfIncludedPages ) {
			return {
				extraPageCount: 0,
				numberOfIncludedPages,
				extraPagesPrice: 0,
				extraPagesPriceNormalUnits: 0,
				oneTimeFee,
				oneTimeFeeNormalUnits,
				formattedOneTimeFee,
				perExtraPagePriceNormalUnits,
			};
		}
		extraPageCount = noOfPages - numberOfIncludedPages;
		extraPagesPrice = extraPageCount * perExtraPagePrice;
		extraPagesPriceNormalUnits = extraPageCount * perExtraPagePriceNormalUnits;
	}

	return {
		extraPageCount,
		numberOfIncludedPages,
		extraPagesPrice,
		extraPagesPriceNormalUnits,
		oneTimeFee,
		oneTimeFeeNormalUnits,
		formattedOneTimeFee,
		perExtraPagePriceNormalUnits,
	};
}
