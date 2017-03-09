/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING,
	HAPPYCHAT_BADGE_SET_VISIBLE
} from 'state/action-types';

const open = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_OPEN:
			return !! action.isOpen;
	}
	return state;
};

/**
 * Tracks the state of the happychat minimizing process
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const isMinimizing = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_MINIMIZING:
			return action.isMinimizing ? true : false;
	}
	return state;
};

const isBadgeVisible = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_BADGE_SET_VISIBLE:
			return action.isBadgeVisible;
	}
	return state;
};

export default combineReducers( { open, isMinimizing, isBadgeVisible } );
