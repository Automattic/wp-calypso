import { JETPACK_SEARCH_FREE_PRODUCTS } from './constants';

export function isJetpackSearchFreeSlug( productSlug: string ): boolean {
	return ( JETPACK_SEARCH_FREE_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
