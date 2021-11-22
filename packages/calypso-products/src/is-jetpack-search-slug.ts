import { JETPACK_SEARCH_PRODUCTS } from './constants';

export function isJetpackSearchSlug( productSlug: string ): boolean {
	return ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
