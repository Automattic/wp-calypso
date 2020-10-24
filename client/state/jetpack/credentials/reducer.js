/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_GET,
	JETPACK_CREDENTIALS_GET_SUCCESS,
	JETPACK_CREDENTIALS_GET_FAILURE,
	JETPACK_CREDENTIALS_STORE,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

export const items = withSchemaValidation(
	itemsSchema,
	keyedReducer( 'siteId', ( state, { type, credentials } ) => {
		if ( JETPACK_CREDENTIALS_STORE === type || JETPACK_CREDENTIALS_GET_SUCCESS === type ) {
			return 'object' === typeof credentials ? credentials : {};
		}

		return state;
	} )
);

export const getRequestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_CREDENTIALS_GET:
			return 'pending';

		case JETPACK_CREDENTIALS_GET_SUCCESS:
			return 'success';

		case JETPACK_CREDENTIALS_GET_FAILURE:
			return 'failed';
	}
	return state;
} );

export const updateRequestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_CREDENTIALS_UPDATE:
			return 'pending';

		case JETPACK_CREDENTIALS_UPDATE_SUCCESS:
			return 'success';

		case JETPACK_CREDENTIALS_UPDATE_FAILURE:
			return 'failed';
	}

	return state;
} );

export const errors = keyedReducer( 'siteId', ( state, { type, error } ) => {
	switch ( type ) {
		case JETPACK_CREDENTIALS_GET_FAILURE:
			return error;

		case JETPACK_CREDENTIALS_UPDATE_FAILURE:
			return error;
	}

	return state;
} );

export const reducer = combineReducers( {
	items,
	getRequestStatus,
	updateRequestStatus,
	errors,
} );
