/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
	withStorageKey,
} from 'calypso/state/utils';
import {
	EMAIL_ACCOUNTS_REQUEST,
	EMAIL_ACCOUNTS_REQUEST_FAILURE,
	EMAIL_ACCOUNTS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import emailAccountsSchema from './schema';

export const emailAccountsReducer = withSchemaValidation(
	emailAccountsSchema,
	( state = null, action ) => {
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
	}
);

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

export default withStorageKey(
	'emailAccounts',
	keyedReducer(
		'siteId',
		combineReducers( {
			accounts: emailAccountsReducer,
			requesting: requestingReducer,
			requestError: requestErrorReducer,
		} )
	)
);
