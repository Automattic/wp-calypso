/** @format */

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
			return ( ( state, data ) => ( {
				...state,

				[ data.siteId ]: {
					total: get( data, 'subscribers.total', 0 ),
					ownerships: get( data, 'subscribers.ownerships', [] ).reduce(
						( prev, item ) => {
							prev[ item.id ] = item;
							return prev;
						},
						{ ...get( state, [ data.siteId, 'ownerships' ], {} ) }
					),
				},
			} ) )( state, action );
	}

	return state;
} );

export default combineReducers( {
	list,
} );
