/**
 * External dependencies
 */
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/constants';

export function isJetpackProductSlug( productSlug: string ): boolean {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}
