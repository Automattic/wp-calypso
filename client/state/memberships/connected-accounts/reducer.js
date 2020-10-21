/**
 * Internal dependencies
 */
import {
	MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST,
	MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE,
} from 'calypso/state/action-types';
import { combineReducers, withoutPersistence } from 'calypso/state/utils';

const accounts = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE:
			return {
				...state,
				...action.accounts,
			};
	}

	return state;
} );

const isFetching = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE:
			return false;
		case MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST:
			return true;
	}

	return state;
} );

export default combineReducers( {
	accounts,
	isFetching,
} );
