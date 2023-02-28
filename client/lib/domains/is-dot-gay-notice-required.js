import { find, get } from 'lodash';

export function isDotGayNoticeRequired( productSlug, productsList ) {
	const product = find( productsList, [ 'product_slug', productSlug ] ) || {};

	return get( product, 'is_dot_gay_notice_required', false );
}
