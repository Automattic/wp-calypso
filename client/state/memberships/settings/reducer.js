/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	MEMBERSHIPS_SETTINGS_RECEIVE,
	MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT_SUCCESS,
} from '../../action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SETTINGS_RECEIVE:
			return {
				...state,

				[ action.siteId ]: {
					connectedAccountId: get( action, 'data.connected_account_id', null ),
					connectUrl: get( action, 'data.connect_url', null ),
				},
			};
		case MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT_SUCCESS:
			return {
				...state,

				[ action.siteId ]: {
					connectedAccountId: null,
					connectUrl: null,
				},
			};
	}

	return state;
} );
