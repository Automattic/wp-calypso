import { JETPACK_PRODUCTS_LIST } from './constants';

export function isJetpackProductSlug( productSlug: string ): boolean {
	return ( JETPACK_PRODUCTS_LIST as ReadonlyArray< string > ).includes( productSlug );
}
