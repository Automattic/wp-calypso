/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SET_SECTION,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import editor from './editor/reducer';
import reader from './reader/reducer';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selectedSiteId( state = null, action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			return action.siteId || null;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null
	}

	return state;
}

/**
 * Tracks the four most recently selected site IDs.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function recentlySelectedSiteIds( state = [], action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			state = [ action.siteId, ...state ];
			if ( state.length === 3 ) {
				state.pop();
			}
			return state;
		case SERIALIZE:
			return [];
		case DESERIALIZE:
			return [];
	}

	return state;
}

//TODO: do we really want to mix strings and booleans?
export function section( state = false, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.section !== undefined ) ? action.section : state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.hasSidebar !== undefined ) ? action.hasSidebar : state;
		case SERIALIZE:
			return true;
		case DESERIALIZE:
			return true;
	}
	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.isLoading !== undefined ) ? action.isLoading : state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}
	return state;
}

export function chunkName( state = false, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.chunkName !== undefined ) ? action.chunkName : state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}
	return state;
}

export default combineReducers( {
	section,
	isLoading,
	hasSidebar,
	chunkName,
	selectedSiteId,
	recentlySelectedSiteIds,
	editor,
	reader
} );
