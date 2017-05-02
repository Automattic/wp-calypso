/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { error } from '../actions';
import {
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET,
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS,
} from '../../action-types';

export function getProductCategories( siteId ) {
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET,
			payload: { siteId },
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v2/products/categories';

		return wp.req.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( getProductCategoriesSuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( error( siteId, getAction, err ) );
			} );
	};
}

export function getProductCategoriesSuccess( siteId, data ) {
	return {
		type: WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS,
		payload: {
			siteId,
			data,
		}
	};
}

