/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackProductSlug } from './is-jetpack-product-slug';

export function isJetpackProduct( product ) {
	product = snakeCase( product );
	return isJetpackProductSlug( product.product_slug );
}
