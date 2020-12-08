/**
 * Internal dependencies
 */
import {
	MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST,
	MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE,
} from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';

import 'calypso/state/memberships/init';

export function listMembershipsConnectedAccounts() {
	return ( dispatch ) => {
		dispatch( { type: MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST } );

		return wpcom.req.get( '/me/connected_accounts/list' ).then( ( endpointResponse ) => {
			const accounts = endpointResponse.accounts.reduce( ( accumulator, item ) => {
				accumulator[ item.connected_destination_account_id ] = item;
				return accumulator;
			}, {} );
			dispatch( {
				type: MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE,
				accounts,
			} );
			return Promise.resolve( accounts );
		} );
	};
}
