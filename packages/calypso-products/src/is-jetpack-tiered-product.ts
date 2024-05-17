import { JETPACK_TIERED_PRODUCTS } from './constants';

export function isJetpackTieredProduct( productSlug: string ): boolean {
	return ( JETPACK_TIERED_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
