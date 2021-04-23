/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from './jetpack-constants';

export function isJetpackProductSlug( productSlug ) {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}
