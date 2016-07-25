/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	PREVIEW_URL_CLEAR,
	PREVIEW_URL_SET,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import editor from './editor/reducer';
import guidedTour from './guided-tours/reducer';
import queryArguments from './query-arguments/reducer';
import reader from './reader/reducer';
import olark from './olark/reducer';
import actionLog from './action-log/reducer';

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
	}

	return state;
}

//TODO: do we really want to mix strings and booleans?
export function section( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.section !== undefined ) ? action.section : state;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.hasSidebar !== undefined ) ? action.hasSidebar : state;
	}
	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.isLoading !== undefined ) ? action.isLoading : state;
	}
	return state;
}

export const isPreviewShowing = createReducer( false, {
	[ PREVIEW_IS_SHOWING ]: ( state, { isShowing } ) =>
		isShowing !== undefined ? isShowing : state,
} );

export function currentPreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_URL_SET:
			return action.url;
		case PREVIEW_URL_CLEAR:
			return null;
	}
	return state;
}

const reducer = combineReducers( {
	section,
	isLoading,
	hasSidebar,
	isPreviewShowing,
	currentPreviewUrl,
	queryArguments,
	selectedSiteId,
	recentlySelectedSiteIds,
	guidedTour,
	editor,
	reader,
	olark,
	actionLog,
} );

export default function( state, action ) {
	if ( SERIALIZE === action.type || DESERIALIZE === action.type ) {
		return {};
	}

	return reducer( state, action );
}
