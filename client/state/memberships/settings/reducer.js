import { get } from 'lodash';
import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

export default ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SETTINGS_RECEIVE:
			return {
				...state,

				[ action.siteId ]: {
					connectedAccountId: get( action, 'data.connected_account_id', null ),
					connectedAccountDescription: get( action, 'data.connected_account_description', null ),
					connectedAccountDefaultCurrency: get(
						action,
						'data.connected_account_default_currency',
						null
					),
					connectedAccountMinimumCurrency: get(
						action,
						'data.connected_account_minimum_currency',
						null
					),
					connectUrl: get( action, 'data.connect_url', null ),
				},
			};
	}

	return state;
};
