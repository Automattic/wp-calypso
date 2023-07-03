import { PRODUCT_JETPACK_STATS_FREE } from './constants';

export function isJetpackStatsFreeProductSlug( productSlug: string ) {
	return PRODUCT_JETPACK_STATS_FREE === productSlug;
}
