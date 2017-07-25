/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST ]: [
		dispatchRequest(
			requestCategories,
			requestCategoriesSuccess,
			( store, action, next ) => next( action ),
		)
	]
};

export function requestCategories( { dispatch }, action, next ) {
	const { siteId } = action;

	dispatch( request( siteId, action ).get( 'products/categories' ) );
	return next( action );
}

export function requestCategoriesSuccess( { dispatch }, action, next, { data } ) {
	if ( ! isValidCategoriesArray( data ) ) {
		action.meta.dataLayer.error = { message: 'Invalid Categories array', data };
	}
	return next( action );
}

function isValidCategoriesArray( categories ) {
	for ( let i = 0; i < categories.length; i++ ) {
		if ( ! isValidProductCategory( categories[ i ] ) ) {
			// Short-circuit the loop and return now.
			return false;
		}
	}
	return true;
}

function isValidProductCategory( category ) {
	return (
		category &&
		category.id && ( 'number' === typeof category.id ) &&
		category.name && ( 'string' === typeof category.name ) &&
		category.slug && ( 'string' === typeof category.slug )
	);
}

