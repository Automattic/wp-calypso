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
	return {
		type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
		payload: {
			siteId,
			data,
		}
	};
}

