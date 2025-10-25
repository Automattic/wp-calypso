import { toNumber } from '../normalize-utils';
import { wpcom } from '../wpcom-fetcher';
import type { Product } from './types';
import type { PriceTierEntry } from '../upgrades';

/**
 * Normalizes a PriceTierEntry object to ensure all number fields are actual numbers.
 */
function normalizePriceTierEntry( entry: PriceTierEntry ): PriceTierEntry {
	return {
		...entry,
		minimum_units: toNumber( entry.minimum_units ),
		maximum_units: toNumber( entry.maximum_units ),
		minimum_price: toNumber( entry.minimum_price ),
		maximum_price: toNumber( entry.maximum_price ),
	};
}

/**
 * Normalizes a Product object to ensure all number fields are actual numbers.
 */
function normalizeProduct( product: Product ): Product {
	return {
		...product,
		product_id: toNumber( product.product_id ),
		cost: toNumber( product.cost ),
		cost_smallest_unit: toNumber( product.cost_smallest_unit ),
		price_tier_list: product.price_tier_list.map( normalizePriceTierEntry ),
		price_tier_usage_quantity: toNumber( product.price_tier_usage_quantity ),
		...( product.sale_cost !== undefined && {
			sale_cost: toNumber( product.sale_cost ),
		} ),
		...( product.sale_coupon !== undefined && {
			sale_coupon: {
				...product.sale_coupon,
				discount: toNumber( product.sale_coupon.discount ),
				product_ids: product.sale_coupon.product_ids.map( ( id ) => toNumber( id ) ),
				tld_rank: toNumber( product.sale_coupon.tld_rank ),
			},
		} ),
		...( product.introductory_offer !== undefined && {
			introductory_offer: {
				...product.introductory_offer,
				cost_per_interval: toNumber( product.introductory_offer.cost_per_interval ),
				interval_count: toNumber( product.introductory_offer.interval_count ),
				transition_after_renewal_count: toNumber(
					product.introductory_offer.transition_after_renewal_count
				),
				usage_limit: toNumber( product.introductory_offer.usage_limit ),
			},
		} ),
		...( product.hundred_year_combined_cost_smallest_unit !== undefined && {
			hundred_year_combined_cost_smallest_unit: toNumber(
				product.hundred_year_combined_cost_smallest_unit
			),
		} ),
	};
}

export async function fetchProducts(): Promise< Record< string, Product > > {
	const products: Record< string, Product > = await wpcom.req.get( {
		path: '/products/',
	} );
	return Object.fromEntries(
		Object.entries( products ).map( ( [ key, product ] ) => [ key, normalizeProduct( product ) ] )
	);
}
