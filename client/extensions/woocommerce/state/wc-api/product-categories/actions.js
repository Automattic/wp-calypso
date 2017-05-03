/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { error } from '../actions';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from '../../action-types';

export function fetchProductCategories( siteId ) {
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
			payload: { siteId },
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v2/products/categories';

		return wp.req.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( fetchProductCategoriesSuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( error( siteId, getAction, err ) );
			} );
	};
}

export function fetchProductCategoriesSuccess( siteId, data ) {
	if ( ! isValidCategoriesArray( data ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
			payload: { siteId }
		};

		return error( siteId, originalAction, { message: 'Invalid Categories Array', data } );
	}

	return {
		type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
		payload: {
			siteId,
			data,
		}
	};
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
		category.id && ( typeof category.id ) === 'number' &&
		category.name && ( typeof category.name ) === 'string' &&
		category.slug && ( typeof category.slug ) === 'string'
	);
}

