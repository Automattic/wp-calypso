/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

export default createReducer(
	{},
	{
		[ MEMBERSHIPS_SETTINGS_RECEIVE ]: ( state, data ) => ( {
			...state,
			[ data.siteId ]: {
				connectedAccountId: get( data, 'data.connected_account_id', null ),
				connectUrl: get( data, 'data.connect_url', null ),
			},
		} ),
	}
);
