/**
 * Internal dependencies
 */
import { RequestCartProduct } from './shopping-cart-endpoint';

export default function createRequestCartProduct(
	properties: Partial< RequestCartProduct > &
		Pick< RequestCartProduct, 'product_slug' | 'product_id' >
): RequestCartProduct {
	return {
		meta: '',
		volume: 1,
		extra: {},
		...properties,
	};
}
