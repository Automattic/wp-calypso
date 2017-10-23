/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
} from 'woocommerce/state/action-types';

const initialState = {
	currentPage: 1,
	perPage: 10,
};

export default createReducer( initialState, {
	[ WOOCOMMERCE_PROMOTIONS_PAGE_SET ]: promotionsPageSet,
} );

function promotionsPageSet( state, action ) {
	const currentPage = ( 0 < action.currentPage ? action.currentPage : initialState.currentPage );
	const perPage = ( 0 < action.perPage ? action.perPage : initialState.perPage );

	return { perPage, currentPage };
}

