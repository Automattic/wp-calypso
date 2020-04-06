/**
 * External Dependencies
 */
import createDebug from 'debug';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import config from 'config';
import { socketConnected, socketDisconnected } from 'state/lasagna/actions';
import {
	channelJoined,
	channelJoinError,
	channelLeft,
	socketClosed,
	socketConnectError,
} from './actions';

/**
 * Module vars
 */
export let SOCKET = null;
export let CHANNELS = {};

const DEFAULT_NAMESPACE = 'global';
const debug = createDebug( 'lasagna:socket' );
const url = config( 'lasagna_url' );

// Expose socket & channels in development
if ( process.env.NODE_ENV === 'development' ) {
	window.SOCKET = SOCKET;
	window.CHANNELS = CHANNELS;
}

export function socketConnect( { store, jwt, userId } ) {
	if ( SOCKET !== null ) {
		return;
	}

	import( 'phoenix' ).then( ( { Socket } ) => {
		SOCKET = new Socket( url, { params: { jwt, user_id: userId } } );

		SOCKET.onOpen( () => {
			debug( 'socket opened' );
			store.dispatch( socketConnected() );
		} );

		SOCKET.onClose( () => {
			debug( 'socket closed' );
			store.dispatch( socketClosed() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		SOCKET.onError( () => {
			debug( 'socket error' );
			store.dispatch( socketConnectError() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		SOCKET.connect();
	} );
}

export function socketDisconnect( { store } ) {
	debug( 'socket disconnected' );
	SOCKET && SOCKET.disconnect();
	SOCKET = null;
	CHANNELS = {};
	store.dispatch( socketDisconnected() );
}

export function channelJoin( {
	store,
	topic,
	registerEventHandlers,
	meta,
	namespace = DEFAULT_NAMESPACE,
} ) {
	if ( SOCKET === null ) {
		debug( 'channel join, socket not opened yet', topic );
		return false;
	}

	if ( ! topic ) {
		debug( 'channel topic missing', topic );
		return false;
	}

	if ( ! CHANNELS[ namespace ] ) {
		CHANNELS[ namespace ] = {};
	}

	if ( CHANNELS[ namespace ][ topic ] ) {
		debug( 'channel already joined', topic );
		return false;
	}

	// create channel
	const channel = SOCKET.channel( topic );
	registerEventHandlers( channel, topic, store );

	CHANNELS[ namespace ][ topic ] = {
		ref: channel,
		meta,
		joinedAt: moment().unix(),
		updatedAt: moment().unix(),
	};

	// join channel
	debug( 'channel join', topic );
	channel
		.join()
		.receive( 'ok', () => {
			debug( 'channel joined', topic );
			store.dispatch( channelJoined( namespace, topic ) );
		} )
		.receive( 'error', ( { reason } ) => {
			debug( 'channel join error', reason );
			store.dispatch( channelJoinError( namespace, reason ) );
			channelLeave( store, topic );
		} );

	return channel;
}

export function channelLeave( { store, topic, namespace = DEFAULT_NAMESPACE } ) {
	if ( SOCKET === null ) {
		debug( 'channel leave, socket not opened yet', topic );
		return false;
	}

	if ( ! topic ) {
		debug( 'channel topic missing', topic );
		return false;
	}

	if ( ! CHANNELS[ namespace ] ) {
		debug( 'no channel found to leave', topic );
		return false;
	}

	if ( ! CHANNELS[ namespace ][ topic ] ) {
		debug( 'no channel found to leave', topic );
		return false;
	}

	debug( 'channel leave', topic );

	const channel = CHANNELS[ namespace ][ topic ].ref;
	store.dispatch( channelLeft( namespace, topic ) );
	channel.leave();
	delete CHANNELS[ namespace ][ topic ];

	return true;
}

export function channelUpdated( { topic, namespace = DEFAULT_NAMESPACE } ) {
	if ( ! CHANNELS[ namespace ] ) {
		debug( 'channel update missing namespace', topic );
		return;
	}

	if ( ! CHANNELS[ namespace ][ topic ] ) {
		debug( 'channel update missing topic', topic );
		return;
	}

	CHANNELS[ namespace ][ topic ].updatedAt = moment().unix();
}
