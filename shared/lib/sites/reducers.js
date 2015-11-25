/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SET_SELECTED_SITE,
	RECEIVE_SITE
} from './action-types';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selected( state = null, action ) {
	switch ( action.type ) {
		case SET_SELECTED_SITE:
			state = action.siteId;
			break;
	}

	return state;
}

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function byId( state = {}, action ) {
	switch ( action.type ) {
		case RECEIVE_SITE:
			state = Object.assign( {}, state, {
				[ action.site.ID ]: action.site
			} );
			break;
	}

	return state;
}

export default combineReducers( {
	selected,
	byId
} );
