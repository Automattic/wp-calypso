import { getJetpackProductsWhatIsIncluded } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Includes" info based on the product purchase object.
 */
export function getJetpackProductWhatIsIncluded( product: Product, quantity?: number | null ) {
	const slug = quantity ? `${ product.product_slug }:-q-${ quantity }` : product.product_slug;

	const jetpackProductsIncludesInfo = getJetpackProductsWhatIsIncluded();
	return jetpackProductsIncludesInfo[ slug ];
}
