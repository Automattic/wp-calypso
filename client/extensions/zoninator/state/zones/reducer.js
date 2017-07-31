/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
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

export const zones = createReducer( {}, {
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
} );

export default combineReducers( {
	fetching,
	zones,
} );
