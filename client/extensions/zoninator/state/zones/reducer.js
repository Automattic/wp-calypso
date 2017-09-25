/**
 * Internal dependencies
 */
import { ZONINATOR_REQUEST_ERROR, ZONINATOR_REQUEST_ZONES, ZONINATOR_UPDATE_ZONE, ZONINATOR_UPDATE_ZONES } from '../action-types';
import { itemsSchema } from './schema';
import { combineReducers, createReducer } from 'state/utils';

export const requesting = createReducer( {}, {
	[ ZONINATOR_REQUEST_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ ZONINATOR_REQUEST_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const items = createReducer( {}, {
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
	[ ZONINATOR_UPDATE_ZONE ]: ( state, { siteId, zoneId, data } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ zoneId ]: data,
		}
	} ),
}, itemsSchema );

export default combineReducers( {
	requesting,
	items,
} );
