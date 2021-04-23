/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackScanSlug } from './is-jetpack-scan-slug';

export function isJetpackScan( product ) {
	product = snakeCase( product );

	return isJetpackScanSlug( product.product_slug );
}
