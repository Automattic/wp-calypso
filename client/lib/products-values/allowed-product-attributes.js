/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import schema from 'lib/products-values/schema.json';

export function allowedProductAttributes( product ) {
	return pick( product, Object.keys( schema.properties ) );
}
