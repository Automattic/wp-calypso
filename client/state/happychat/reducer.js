import { combineReducers } from 'redux';
import get from 'lodash/get';
import find from 'lodash/find';
import concat from 'lodash/concat';

import {
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CLOSING,
} from 'state/action-types';

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
	}
	return state;
};

const timeline = ( state = [], action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_RECEIVE_EVENT:
			const event = timeline_event( {}, action );
			const existing = find( state, ( [ , { id } ] ) => event[ 1 ].id === id );
			return existing ? state : concat( state, [ event ] );
	}
	return state;
};

const message = ( state = '', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_MESSAGE:
			return action.message;
	}
	return state;
};

const status = ( state = 'disconnected', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_CONNECTING:
			return 'connecting';
		case HAPPYCHAT_CONNECTED:
			return 'connected';
		case HAPPYCHAT_CLOSING:
			return 'closing';
	}
	return state;
};

export default combineReducers( { timeline, available, message, status } );
