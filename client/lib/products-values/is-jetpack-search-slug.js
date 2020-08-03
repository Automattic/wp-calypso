/**
 * External dependencies
 */
import { JETPACK_SEARCH_PRODUCTS } from 'lib/products-values/constants';

export function isJetpackSearchSlug( productSlug ) {
	return JETPACK_SEARCH_PRODUCTS.includes( productSlug );
}
