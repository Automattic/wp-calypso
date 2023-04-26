import { JETPACK_BOOST_PRODUCTS } from './constants';

export function isJetpackBoostSlug( productSlug: string ): boolean {
	return ( JETPACK_BOOST_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
