/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import { MEMBERSHIPS_SUBSCRIBERS_RECEIVE } from '../../action-types';

const list = createReducer(
	{},
	{
		[ MEMBERSHIPS_SUBSCRIBERS_RECEIVE ]: ( state, data ) => ( {
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
		} ),
	}
);

export default combineReducers( {
	list,
} );
