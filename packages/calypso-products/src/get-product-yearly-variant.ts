/**
 * Internal dependencies
 */
import { TERM_ANNUALLY } from './index';
import { PRODUCTS_LIST } from './products-list';

/**
 * Type dependencies
 */
import type { ProductSlug } from './types';

/**
 * Return the yearly variant of a product
 *
 * @param {ProductSlug} productSlug Slug of the product to get the yearly variant from
 * @returns {string} Slug of the yearly variant
 */
export function getProductYearlyVariant( productSlug: ProductSlug ): string | undefined {
	const product = PRODUCTS_LIST[ productSlug ];

	if ( product ) {
		return Object.values( PRODUCTS_LIST )
			.filter( ( { type } ) => type === product.type )
			.find( ( { term } ) => TERM_ANNUALLY === term )?.product_slug;
	}
	return undefined;
}
