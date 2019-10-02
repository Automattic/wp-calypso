/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SETTINGS_RECEIVE:
			return ( ( state, data ) => ( {
				...state,

				[ data.siteId ]: {
					connectedAccountId: get( data, 'data.connected_account_id', null ),
					connectUrl: get( data, 'data.connect_url', null ),
				},
			} ) )( state, action );
	}

	return state;
} );
