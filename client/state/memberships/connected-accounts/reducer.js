/** @format */

/**
 * Internal dependencies
 */

import { createReducer, combineReducers } from 'state/utils';

const accounts = createReducer(
	{},
	{
		[ 'MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE' ]: ( state, data ) => ( {
			...state,
			...data.accounts,
		} ),
	}
);

const isFetching = createReducer( false, {
	[ 'MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE' ]: () => false,
	[ 'MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST' ]: () => true,
} );

export default combineReducers( {
	accounts,
	isFetching,
} );
