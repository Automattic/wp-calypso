import { JETPACK_STATS_PRODUCTS } from './constants';

export function isJetpackStatsSlug( productSlug: string ) {
	return ( JETPACK_STATS_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
