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
	JETPACK_CREDENTIALS_UPDATE_RESET,
	JETPACK_CREDENTIALS_UPDATE_PROGRESS_START,
	JETPACK_CREDENTIALS_UPDATE_PROGRESS_UPDATE,
} from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { itemsSchema } from './schema';

const itemsReducer = ( state, { type, credentials } ) => {
	if ( JETPACK_CREDENTIALS_STORE === type || JETPACK_CREDENTIALS_GET_SUCCESS === type ) {
		return 'object' === typeof credentials ? credentials : {};
	}

	return state;
};

export const items = withSchemaValidation(
	itemsSchema,
	keyedReducer( 'siteId', withPersistence( itemsReducer ) )
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

		case JETPACK_CREDENTIALS_UPDATE_RESET:
			return;
	}

	return state;
} );

export const errors = keyedReducer(
	'siteId',
	( state, { type, wpcomError, translatedError, transportError } ) => {
		switch ( type ) {
			case JETPACK_CREDENTIALS_GET_FAILURE:
				return { wpcomError, translatedError, transportError };

			case JETPACK_CREDENTIALS_UPDATE_FAILURE:
				return { wpcomError, translatedError, transportError };

			case JETPACK_CREDENTIALS_UPDATE_RESET:
				return;
		}

		return state;
	}
);

export const progressUpdates = keyedReducer( 'siteId', ( state, { type, update } ) => {
	switch ( type ) {
		case JETPACK_CREDENTIALS_UPDATE_PROGRESS_START:
			return [];

		case JETPACK_CREDENTIALS_UPDATE_PROGRESS_UPDATE:
			return [ ...state, update ];

		case JETPACK_CREDENTIALS_UPDATE_RESET:
			return;
	}

	return state;
} );

export const reducer = combineReducers( {
	items,
	getRequestStatus,
	updateRequestStatus,
	errors,
	progressUpdates,
} );
