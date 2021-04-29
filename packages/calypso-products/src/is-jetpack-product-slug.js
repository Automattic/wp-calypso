/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from './index';

export function isJetpackProductSlug( productSlug ) {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}
