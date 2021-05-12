/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import {
	GSUITE_USERS_REQUEST,
	GSUITE_USERS_REQUEST_FAILURE,
	GSUITE_USERS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { usersSchema } from './schema';

export const usersReducer = withSchemaValidation( usersSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case GSUITE_USERS_REQUEST_FAILURE:
			return null;

		case GSUITE_USERS_REQUEST_SUCCESS: {
			const {
				response: { accounts },
			} = action;

			return accounts;
		}
	}

	return state;
} );

export const requestErrorReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case GSUITE_USERS_REQUEST:
			return false;

		case GSUITE_USERS_REQUEST_FAILURE:
			return true;

		case GSUITE_USERS_REQUEST_SUCCESS:
			return false;
	}

	return state;
};

export const requestingReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case GSUITE_USERS_REQUEST:
			return true;

		case GSUITE_USERS_REQUEST_FAILURE:
			return false;

		case GSUITE_USERS_REQUEST_SUCCESS:
			return false;
	}

	return state;
};

const combinedReducer = keyedReducer(
	'siteId',
	combineReducers( {
		users: usersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);

export default withStorageKey( 'gsuiteUsers', combinedReducer );
