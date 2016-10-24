import { combineReducers } from 'redux';

import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING
} from 'state/action-types';

const open = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_OPEN:
			return !! action.isOpen;
	}
	return state;
};

const debug = require( 'debug' )( 'calypso:happychat:ui-reducer' );

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
			debug( "set minimizing", action );
			return action.isMinimizing ? true : false;
	}
	return state;
};

export default combineReducers( { open, isMinimizing } );
