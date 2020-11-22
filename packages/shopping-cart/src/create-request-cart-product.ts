/**
 * Internal dependencies
 */
import { RequestCartProduct } from './shopping-cart-endpoint';

export default function createRequestCartProduct(
	properties: Partial< RequestCartProduct > &
		Pick< RequestCartProduct, 'product_slug' | 'product_id' >
): RequestCartProduct {
	if ( ! properties.product_slug || ! properties.product_id ) {
		throw new Error( 'Both product_slug and product_id are required for createRequestCartProduct' );
	}
	return {
		meta: '',
		volume: 1,
		extra: {},
		...properties,
	};
}
