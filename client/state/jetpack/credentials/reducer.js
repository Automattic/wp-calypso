/** @format */
/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_STORE,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';
import { itemsSchema } from './schema';

export const items = keyedReducer( 'siteId', ( state, { type, credentials } ) => {
	if ( JETPACK_CREDENTIALS_STORE === type ) {
		return 'object' === typeof credentials ? credentials : {};
	}

	return state;
} );
items.schema = itemsSchema;

export const updateRequesting = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_CREDENTIALS_UPDATE:
			return true;

		case JETPACK_CREDENTIALS_UPDATE_SUCCESS:
		case JETPACK_CREDENTIALS_UPDATE_FAILURE:
			return false;
	}

	return state;
} );

export const reducer = combineReducers( {
	items,
	updateRequesting,
} );
