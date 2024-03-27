import { withStorageKey } from '@automattic/state-utils';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { productsListSchema } from './schema';

// Stores the complete list of products, indexed by the product key
export const items = withSchemaValidation( productsListSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE:
			return { ...state.productsList, ...action.productsList };
	}

	return state;
} );

// Stores the type of the last received products list
export const type = withSchemaValidation(
	{ type: [ 'string', 'null' ] },
	( state = null, action ) => {
		switch ( action.type ) {
			case PRODUCTS_LIST_RECEIVE:
				return action.productsListType;
		}

		return state;
	}
);

// Tracks product list fetching state
export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case PRODUCTS_LIST_REQUEST:
			return true;
		case PRODUCTS_LIST_RECEIVE:
			return false;
		case PRODUCTS_LIST_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	isFetching,
	items,
	type,
} );

export default withStorageKey( 'productsList', combinedReducer );
