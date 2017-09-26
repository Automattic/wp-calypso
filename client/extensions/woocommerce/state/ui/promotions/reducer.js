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
	const { currentPage, perPage } = action;

	return { perPage, currentPage };
}

