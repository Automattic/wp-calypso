import { get } from 'lodash';
import { MEMBERSHIPS_SETTINGS_RECEIVE } from '../../action-types';

export default ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SETTINGS_RECEIVE:
			return {
				...state,

				[ action.siteId ]: {
					isConnected: get(
						action,
						'data.is_connected',
						get( action, 'data.connected_account_id', null ) > 0
					),
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
					membershipsSandboxStatus: get( action, 'data.store_context', null ),
					connectUrl: get( action, 'data.connect_url', null ),
					couponsAndGiftsEnabled: get( action, 'data.coupons_and_gifts_enabled', null ),
				},
			};
	}

	return state;
};
