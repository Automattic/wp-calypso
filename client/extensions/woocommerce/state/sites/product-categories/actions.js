/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { setError } from '../../site/status/wc-api/actions';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from 'woocommerce/state/action-types';

export function fetchProductCategories( siteId ) {
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
			siteId,
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v2/products/categories';

		// TODO: Modify this to use the extensions data layer.
		return wp.req.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( fetchProductCategoriesSuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( setError( siteId, getAction, err ) );
			} );
	};
}

export function fetchProductCategoriesSuccess( siteId, data ) {
	if ( ! isValidCategoriesArray( data ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
			siteId,
		};

		return setError( siteId, originalAction, { message: 'Invalid Categories Array', data } );
	}

	return {
		type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
		siteId,
		data,
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
		category.id && ( 'number' === typeof category.id ) &&
		category.name && ( 'string' === typeof category.name ) &&
		category.slug && ( 'string' === typeof category.slug )
	);
}

