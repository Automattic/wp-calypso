/**
 * Internal dependencies
 */
import { TERMS_LIST } from 'calypso/lib/plans/constants';
import { PRODUCTS_LIST } from 'calypso/lib/products-values/products-list';

/**
 * Type dependencies
 */
import type { ProductSlug } from './types';

/**
 * Return a list of products that are similar to the product passed as argument, but with different terms.
 *
 * @param {ProductSlug} productSlug Slug of the product to get the term variants from
 * @returns {string[]} Slugs of the product variants
 */
export function getProductTermVariants( productSlug: ProductSlug ): string[] | undefined {
	const product = PRODUCTS_LIST[ productSlug ];

	if ( product ) {
		return Object.values( PRODUCTS_LIST )
			.filter( ( { type } ) => type === product.type )
			.filter( ( { term } ) => TERMS_LIST.includes( term ) )
			.filter( ( { product_slug } ) => product_slug !== product.product_slug )
			.map( ( { product_slug } ) => product_slug );
	}
}
