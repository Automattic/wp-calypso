/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from './constants';

export function isJetpackProductSlug( productSlug ) {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}
