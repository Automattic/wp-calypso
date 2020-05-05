/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_STORE,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
} from 'state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';
import { itemsSchema } from './schema';

export const items = withSchemaValidation(
	itemsSchema,
	keyedReducer( 'siteId', ( state, { type, credentials } ) => {
		if ( JETPACK_CREDENTIALS_STORE === type ) {
			return 'object' === typeof credentials ? credentials : {};
		}

		return state;
	} )
);

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
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

export const reducer = combineReducers( {
	items,
	requestStatus,
} );
