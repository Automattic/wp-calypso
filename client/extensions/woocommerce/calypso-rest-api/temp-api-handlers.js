/** @format */

// TODO: This file is temporary. Remove it after all API calls have been ported.
// This file exists to bootstrap existing application code to fill the data state.
// After fetching is moved over to use `rest-api-client`, this can be removed.

/**
 * Internal dependencies
 */
import { requestedAction, receivedAction } from 'woocommerce/rest-api-client/actions';
import {
	WOOCOMMERCE_PRODUCT_REQUEST,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_REQUEST ]: [
		( { dispatch }, { siteId, productId } ) =>
			dispatch( requestedAction( siteId, 'products', [ productId ] ) ),
	],
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: [
		( { dispatch }, { siteId, data } ) =>
			dispatch( receivedAction( siteId, 'products', [ data ] ) ),
	],
};
