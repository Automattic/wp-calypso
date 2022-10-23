import { JETPACK_PRODUCT_RECCOMENDATION_MAP } from './constants';
import { getJetpackProductsRecommendedFor } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Recommended For" based on the product purchase object.
 */
export function getJetpackProductRecommendedFor( product: Product ) {
	const jetpackProductsRecommendedFor = JETPACK_PRODUCT_RECCOMENDATION_MAP[ product.product_slug ];
	if ( ! jetpackProductsRecommendedFor ) return undefined;
	const jetpackProductsRecommendedForTranslations = getJetpackProductsRecommendedFor();
	return jetpackProductsRecommendedFor.map( ( tag ) => ( {
		tag,
		label: jetpackProductsRecommendedForTranslations[ tag ],
	} ) );
}
