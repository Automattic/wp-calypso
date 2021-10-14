import { formatProduct } from './format-product';
import { isJetpackSearchSlug } from './is-jetpack-search-slug';

export function isJetpackSearch( product ) {
	product = formatProduct( product );

	return isJetpackSearchSlug( product.product_slug );
}
