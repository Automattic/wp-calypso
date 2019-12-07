/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'state/utils';
import { MEMBERSHIPS_SUBSCRIBERS_RECEIVE } from '../../action-types';

const list = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SUBSCRIBERS_RECEIVE:
			return {
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
	}

	return state;
} );

export default combineReducers( {
	list,
} );
