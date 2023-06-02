import { JETPACK_VIDEOPRESS_PRODUCTS } from './constants';

export function isJetpackVideoPressSlug( productSlug: string ): boolean {
	return ( JETPACK_VIDEOPRESS_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
