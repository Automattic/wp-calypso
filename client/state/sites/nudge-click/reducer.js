/** @format */

/**
 * Internal dependencies
 */

import { SITE_NUDGE_CLICK_REQUEST, SITE_NUDGE_CLICK_RECEIVE } from 'state/action-types';
import { combineReducers } from 'state/utils';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_NUDGE_CLICK_RECEIVE:
			// const { siteId, nudgeName } = action.payload;
			console.log( action );
			console.log( 'in items reducer' );
			// return Object.assign( {}, state, {
			// 	[ siteId ]: [ nudgeName ],
			// } );
			return state;
	}

	return state;
};

export const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_NUDGE_CLICK_REQUEST:
			console.log( 'in requesting reducer' );
			return state;
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
} );
