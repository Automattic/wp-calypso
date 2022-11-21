import { AnyAction } from 'redux';
import {
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD,
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE,
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_CLEAR,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { ProductsStore } from '../types';

const initialState: ProductsStore = {
	selectedProductSlugs: [],
};

const selectedProductSlugs = ( state = initialState.selectedProductSlugs, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD:
			return Array.isArray( action.productSlugs )
				? [ ...state, ...action.productSlugs ]
				: [ ...state, action.productSlugs ];
		case JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE:
			return Array.isArray( action.productSlugs )
				? state.filter( ( productSlug ) => ! action.productSlugs.includes( productSlug ) )
				: state.filter( ( productSlug ) => productSlug !== action.productSlugs );
		case JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_CLEAR:
			return [];
	}

	return state;
};

export default combineReducers( {
	selectedProductSlugs,
} );
