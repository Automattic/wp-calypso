import { JETPACK_SEARCH_PRODUCTS } from './constants';

export function isJetpackSearchSlug( productSlug ) {
	return JETPACK_SEARCH_PRODUCTS.includes( productSlug );
}
