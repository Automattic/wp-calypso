/**
 * External dependencies
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_UPDATE_ZONES,
	ZONINATOR_UPDATE_ZONE,
} from '../action-types';

export const requesting = createReducer( {}, {
	[ ZONINATOR_REQUEST_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ ZONINATOR_REQUEST_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const items = createReducer( {}, {
	[ ZONINATOR_UPDATE_ZONES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
	[ ZONINATOR_UPDATE_ZONE ]: ( state, { siteId, data } ) => {
		const zones = [ ...( state[ siteId ] || [] ) ];
		const idx = findIndex( zones, { term_id: data.term_id || -1 } );

		if ( idx < 0 ) {
			return { ...state, [ siteId ]: zones.concat( [ data ] ) };
		}

		zones[ idx ] = data;
		return { ...state, [ siteId ]: zones };
	},
}, itemsSchema );

export default combineReducers( {
	requesting,
	items,
} );
