/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
	WOOCOMMERCE_PROMOTIONS_SEARCH,
} from 'woocommerce/state/action-types';

const initialState = {
	currentPage: 1,
	perPage: 10,
	searchFilter: '',
};

export default createReducer( initialState, {
	[ WOOCOMMERCE_PROMOTIONS_PAGE_SET ]: promotionsPageSet,
	[ WOOCOMMERCE_PROMOTIONS_SEARCH ]: promotionsSearch,
} );

function promotionsPageSet( state, action ) {
	const currentPage = 0 < action.currentPage ? action.currentPage : initialState.currentPage;
	const perPage = 0 < action.perPage ? action.perPage : initialState.perPage;

	return { ...state, perPage, currentPage };
}

function promotionsSearch( state, action ) {
	const searchFilter = action.searchFilter || '';
	return { ...state, searchFilter, currentPage: 1 };
}
