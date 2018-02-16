
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCT_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';
import meta from '../meta';

export default {
	[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: [ handleDelete ],
	[ WOOCOMMERCE_PRODUCT_REQUEST ]: [ handleRequest ],
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: [ handleRequestSuccess ],
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: [ handleUpdate ],
};

function handleRequest( { dispatch }, action ) {
	meta.setMeta( 'product:' + action.productId, {
		lastRequest: new Date(),
	} );
}

function handleDelete( { dispatch }, action ) {
	meta.clearMeta( 'product:' + action.data.id );
}

function handleRequestSuccess( { dispatch }, action ) {
	action.products.forEach( product => {
		meta.setLastDataReceived( 'product:' + product.id );
	} );
}

function handleUpdate( { dispatch }, action ) {
	meta.setLastDataReceived( 'product:' + action.data.id );
}
