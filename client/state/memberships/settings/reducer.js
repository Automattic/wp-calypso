/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

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
	}

	return state;
} );
