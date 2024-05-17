import { JETPACK_MULTI_OPTION_PRODUCTS } from './constants';

export function isJetpackMultiOptionProduct( productSlug: string ): boolean {
	return ( JETPACK_MULTI_OPTION_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
