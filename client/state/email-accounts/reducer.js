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
	EMAIL_ACCOUNTS_REQUEST,
	EMAIL_ACCOUNTS_REQUEST_FAILURE,
	EMAIL_ACCOUNTS_REQUEST_SUCCESS,
} from 'state/action-types';
import { usersSchema } from './schema';

export const usersReducer = withSchemaValidation( usersSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_ACCOUNTS_REQUEST_FAILURE:
			return null;

		case EMAIL_ACCOUNTS_REQUEST_SUCCESS: {
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
		case EMAIL_ACCOUNTS_REQUEST:
			return false;

		case EMAIL_ACCOUNTS_REQUEST_FAILURE:
			return true;

		case EMAIL_ACCOUNTS_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

export const requestingReducer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case EMAIL_ACCOUNTS_REQUEST:
			return true;

		case EMAIL_ACCOUNTS_REQUEST_FAILURE:
			return false;

		case EMAIL_ACCOUNTS_REQUEST_SUCCESS:
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
