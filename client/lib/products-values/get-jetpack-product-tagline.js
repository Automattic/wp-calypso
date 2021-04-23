/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { getJetpackProductsTaglines } from 'calypso/lib/products-values/translations';

/**
 * Get Jetpack product tagline based on the product purchase object.
 *
 * @param   product  {object}           Product purchase object
 * @param   isOwned  {boolean}          Whether the site owns the product
 * @returns          {string|object} 	Product tagline
 */
export function getJetpackProductTagline( product, isOwned = false ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsTaglines = getJetpackProductsTaglines();

	const productTagline = jetpackProductsTaglines?.[ product.product_slug ];

	return isOwned ? productTagline?.owned || productTagline?.default : productTagline?.default;
}
