/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { ZONINATOR_UPDATE_FEED } from '../action-types';

export const items = createReducer( {}, {
	[ ZONINATOR_UPDATE_FEED ]: ( state, { siteId, zoneId, data } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ zoneId ]: data,
		},
	} ),
} );

export default combineReducers( { items } );
