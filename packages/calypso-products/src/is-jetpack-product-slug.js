/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from './index';

export function isJetpackProductSlug( productSlug ) {
	return includes( JETPACK_PRODUCTS_LIST, productSlug );
}
