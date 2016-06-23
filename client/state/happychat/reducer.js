import { combineReducers } from 'redux';
import get from 'lodash/get';
import find from 'lodash/find';
import concat from 'lodash/concat';

import {
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_AUTOSCROLL,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CLOSING,
} from 'state/action-types';

const debug = require( 'debug' )( 'calypso:happychat:reducer' );

const available = ( state = true ) => state;

const timeline_event = ( state = [], action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_RECEIVE_EVENT:
			const event = action.event;
			return [
				event.message,
				Object.assign( {}, {
					id: event.id,
					nick: event.user.nick,
					image: event.user.picture,
					user_id: event.user.id,
					type: event.type,
					links: get( event, 'meta.links' )
				} )
			];
		default:
			return state;
	}
};

const timeline = ( state = [], action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_RECEIVE_EVENT:
			const event = timeline_event( {}, action );
			const existing = find( state, ( [ , { id } ] ) => event[ 1 ].id === id );
			debug( 'received event', existing, event );
			return existing ? state : concat( state, [ event ] );
		default:
			return state;
	}
};

const message = ( state = '', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_MESSAGE:
			return action.message;
		default:
			return state;
	}
};

const autoscroll = ( state = true, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_AUTOSCROLL:
			return action.auto;
		default:
			return state;
	}
};

const status = ( state = 'disconnected', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_CONNECTING:
			return 'connecting';
		case HAPPYCHAT_CONNECTED:
			return 'connected';
		case HAPPYCHAT_CLOSING:
			return 'closing';
		default:
			return state;
	}
};

export default combineReducers( { timeline, available, message, autoscroll, status } );
