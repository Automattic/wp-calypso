/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function getDomain( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	const domainToBundle = get( product, 'extra.domain_to_bundle', false );
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}
