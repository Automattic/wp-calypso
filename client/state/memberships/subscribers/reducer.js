import { omit } from '@automattic/js-utils';
import { combineReducers } from 'calypso/state/utils';
import {
	MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
} from '../../action-types';

const list = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SUBSCRIBERS_RECEIVE:
			state = {
				...state,

				[ action.siteId ]: {
					total: action?.subscribers?.total ?? 0,
					ownerships: ( action?.subscribers?.ownerships ?? [] ).reduce(
						( prev, item ) => {
							prev[ item.id ] = item;
							return prev;
						},
						{ ...( state?.[ action.siteId ]?.ownerships ?? {} ) }
					),
				},
			};
			break;
		case MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS: {
			const siteState = state[ action.siteId ];
			if ( ! siteState?.ownerships?.hasOwnProperty( action.subscriptionId ) ) {
				return state;
			}

			state = {
				...state,

				[ action.siteId ]: {
					...siteState,
					total: Math.max( 0, ( siteState.total ?? 0 ) - 1 ),
					ownerships: omit( siteState.ownerships, action.subscriptionId ),
				},
			};
		}
	}

	return state;
};

export default combineReducers( {
	list,
} );
