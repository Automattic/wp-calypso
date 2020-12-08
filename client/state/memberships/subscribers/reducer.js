/**
 * External dependencies
 */
import { get, filter } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
} from '../../action-types';

const list = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SUBSCRIBERS_RECEIVE:
			state = {
				...state,

				[ action.siteId ]: {
					total: get( action, 'subscribers.total', 0 ),
					ownerships: get( action, 'subscribers.ownerships', [] ).reduce(
						( prev, item ) => {
							prev[ item.id ] = item;
							return prev;
						},
						{ ...get( state, [ action.siteId, 'ownerships' ], {} ) }
					),
				},
			};
			break;
		case MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS: {
			const ownerships = filter(
				get( state, [ action.siteId, 'ownerships' ], {} ),
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
} );

export default combineReducers( {
	list,
} );
