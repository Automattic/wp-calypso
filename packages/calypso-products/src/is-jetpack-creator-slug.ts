import { JETPACK_CREATOR_PRODUCTS } from './constants';

export function isJetpackCreatorSlug( productSlug: string ): boolean {
	return ( JETPACK_CREATOR_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
