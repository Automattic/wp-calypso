/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */

import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

export default ( state = {}, action ) => {
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
};
