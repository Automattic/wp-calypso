/**
 * External dependencies
 */
import { find, get } from 'lodash';

export function isHstsRequired( productSlug, productsList ) {
	const product = find( productsList, [ 'product_slug', productSlug ] ) || {};

	return get( product, 'is_hsts_required', false );
}
