/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_UPDATE_ZONES
} from '../action-types';

export const requesting = createReducer( {}, {
	[ ZONINATOR_REQUEST_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ ZONINATOR_REQUEST_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const items = createReducer( {}, {
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
}, itemsSchema );

export default combineReducers( {
	requesting,
	items,
} );
