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
						( action?.data?.connected_account_id ?? null ) > 0
					),
					connectedAccountDescription: action?.data?.connected_account_description ?? null,
					connectedAccountDefaultCurrency: action?.data?.connected_account_default_currency ?? null,
					connectedAccountMinimumCurrency: action?.data?.connected_account_minimum_currency ?? null,
					membershipsSandboxStatus: action?.data?.store_context ?? null,
					connectUrl: action?.data?.connect_url ?? null,
					couponsAndGiftsEnabled: action?.data?.coupons_and_gifts_enabled ?? null,
				},
			};
	}

	return state;
};
