import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
} from './constants';

export function isJetpackStatsPaidTieredProductSlug( productSlug: string ) {
	return (
		[
			PRODUCT_JETPACK_STATS_BI_YEARLY,
			PRODUCT_JETPACK_STATS_YEARLY,
			PRODUCT_JETPACK_STATS_MONTHLY,
		] as ReadonlyArray< string >
	 ).includes( productSlug );
}
