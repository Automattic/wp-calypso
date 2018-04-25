/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';

export const handleListConnectedAccounts = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: '/me/connected_accounts/list',
			},
			action
		),
	fromApi: function( endpointResponse ) {
		// We are remapping keys to index by account id.
		return endpointResponse.accounts.reduce( ( accumulator, item ) => {
			accumulator[ item.connected_destination_account_id ] = item;
			return accumulator;
		}, {} );
	},
	onSuccess: ( raw, accounts ) => ( {
		type: 'MEMBERSHIPS_CONNECTED_ACCOUNTS_RECEIVE',
		accounts,
	} ),
	onError: noop,
} );

export default {
	[ 'MEMBERSHIPS_CONNECTED_ACCOUNTS_LIST' ]: [ handleListConnectedAccounts ],
};
