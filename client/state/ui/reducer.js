/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SET_SECTION,
	SERIALIZE,
	DESERIALIZE,
	SHOW_GUIDESTOUR,
	UPDATE_GUIDESTOUR,
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
		case SET_SECTION:
			return ( action.section !== undefined ) ? action.section : state;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.hasSidebar !== undefined ) ? action.hasSidebar : state;
	}
	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SET_SECTION:
			return ( action.isLoading !== undefined ) ? action.isLoading : state;
	}
	return state;
}

export function guidesTour( state = {}, action ) {
	switch ( action.type ) {
		case SHOW_GUIDESTOUR:
			const { stepName = 'init' } = action;
			return {
				stepName,
				shouldShow: action.shouldShow,
				shouldDelay: action.shouldDelay,
				shouldReallyShow: ( action.shouldShow || state.shouldShow ) && ! action.shouldDelay,
				tour: action.tour,
			};
		case UPDATE_GUIDESTOUR:
			return Object.assign( {}, state, omit( action, 'type' ) );
	}
	return state;
}

const reducer = combineReducers( {
	section,
	isLoading,
	hasSidebar,
	selectedSiteId,
	recentlySelectedSiteIds,
	guidesTour,
	editor,
	reader,
} );

export default function( state, action ) {
	if ( SERIALIZE === action.type || DESERIALIZE === action.type ) {
		return {};
	}

	return reducer( state, action );
}
