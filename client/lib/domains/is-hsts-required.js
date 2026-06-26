import { get } from 'lodash';

export function isHstsRequired( productSlug, productsList ) {
	const product =
		Object.values( productsList ?? {} ).find( ( item ) => item.product_slug === productSlug ) || {};

	return get( product, 'is_hsts_required', false );
}
