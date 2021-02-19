/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
import {
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
	WOOCOMMERCE_PROMOTIONS_SEARCH,
} from 'woocommerce/state/action-types';

const initialState = {
	currentPage: 1,
	perPage: 10,
	searchFilter: '',
};

export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PROMOTIONS_PAGE_SET:
			return promotionsPageSet( state, action );
		case WOOCOMMERCE_PROMOTIONS_SEARCH:
			return promotionsSearch( state, action );
	}

	return state;
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
