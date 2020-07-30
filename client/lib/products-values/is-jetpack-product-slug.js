/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';

export function isJetpackProductSlug( productSlug ) {
	return includes( JETPACK_PRODUCTS_LIST, productSlug );
}
