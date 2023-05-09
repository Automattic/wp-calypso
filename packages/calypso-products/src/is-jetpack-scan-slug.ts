import { JETPACK_SCAN_PRODUCTS } from './constants';

export function isJetpackScanSlug( productSlug: string ): boolean {
	return ( JETPACK_SCAN_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
