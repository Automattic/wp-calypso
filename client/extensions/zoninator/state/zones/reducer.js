/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	ZONINATOR_FETCH_ERROR,
	ZONINATOR_FETCH_ZONES,
	ZONINATOR_UPDATE_ZONES
} from '../action-types';

export const fetching = createReducer( {}, {
	[ ZONINATOR_FETCH_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ ZONINATOR_FETCH_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const items = createReducer( {}, {
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
}, itemsSchema );

export default combineReducers( {
	fetching,
	items,
} );
