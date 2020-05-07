/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
} from 'state/utils';
import {
	TITAN_USERS_REQUEST,
	TITAN_USERS_REQUEST_FAILURE,
	TITAN_USERS_REQUEST_SUCCESS,
} from 'state/action-types';
import { usersSchema } from './schema';

export const usersReducer = withSchemaValidation( usersSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case TITAN_USERS_REQUEST_FAILURE:
			return null;

		case TITAN_USERS_REQUEST_SUCCESS: {
			const {
				response: { accounts },
			} = action;

			return accounts;
		}
	}

	return state;
} );

export const requestErrorReducer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case TITAN_USERS_REQUEST:
			return false;

		case TITAN_USERS_REQUEST_FAILURE:
			return true;

		case TITAN_USERS_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

export const requestingReducer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case TITAN_USERS_REQUEST:
			return true;

		case TITAN_USERS_REQUEST_FAILURE:
			return false;

		case TITAN_USERS_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		users: usersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);
