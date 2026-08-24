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
			const ownerships = Object.values( state?.[ action.siteId ]?.ownerships ?? {} ).filter(
				( { id } ) => id !== action.subscriptionId
			);
			state = {
				...state,

				[ action.siteId ]: {
					total: ownerships.length,
					ownerships: { ...ownerships },
				},
			};
		}
	}

	return state;
};

export default combineReducers( {
	list,
} );
