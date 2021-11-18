import { JETPACK_VIDEOPRESS_PRODUCTS } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackVideoPress( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const products = JETPACK_VIDEOPRESS_PRODUCTS as ReadonlyArray< string >;
	if ( 'product_slug' in product ) {
		return products.includes( product.product_slug );
	}
	return products.includes( product.productSlug );
}
