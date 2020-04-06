/**
 * External Dependencies
 */
import createDebug from 'debug';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import { channelJoined, channelJoinError, channelLeft } from './actions';
import { SOCKET } from 'state/lasagna/socket';

/**
 * Module vars
 */
const DEFAULT_NAMESPACE = 'global';
const debug = createDebug( 'lasagna:channel' );
export let CHANNELS = {};

// Expose channels in development
if ( process.env.NODE_ENV === 'development' ) {
	window.CHANNELS = CHANNELS;
}

export function joinChannel( {
	store,
	topic,
	registerEventHandlers = null,
	meta = {},
	namespace = DEFAULT_NAMESPACE,
} ) {
	if ( SOCKET === null ) {
		debug( topic, 'join, socket not opened yet' );
		return false;
	}

	if ( ! topic ) {
		debug( topic, 'join, topic missing' );
		return false;
	}

	if ( ! CHANNELS[ namespace ] ) {
		CHANNELS[ namespace ] = {};
	}

	if ( CHANNELS[ namespace ][ topic ] ) {
		debug( topic, 'join, already joined' );
		return false;
	}

	// create channel
	const channel = SOCKET.channel( topic );

	// register event handlers if we have them
	if ( registerEventHandlers !== null ) {
		registerEventHandlers( channel, topic, store );
	}

	CHANNELS[ namespace ][ topic ] = {
		ref: channel,
		meta,
		joinedAt: moment().unix(),
		updatedAt: moment().unix(),
	};

	// join channel
	debug( topic, 'attempt join' );
	channel
		.join()
		.receive( 'ok', () => {
			debug( topic, 'joined' );
			store.dispatch( channelJoined( namespace, topic ) );
		} )
		.receive( 'error', ( { reason } ) => {
			debug( topic, 'join error', reason );
			store.dispatch( channelJoinError( namespace, reason ) );
			leaveChannel( store, topic );
		} );

	return channel;
}

export function leaveChannel( { store, topic, namespace = DEFAULT_NAMESPACE } ) {
	if ( SOCKET === null ) {
		debug( topic, 'channel leave, socket not opened yet' );
		return false;
	}

	if ( ! topic ) {
		debug( topic, 'channel topic missing' );
		return false;
	}

	if ( ! CHANNELS[ namespace ] ) {
		debug( topic, 'no channel found to leave' );
		return false;
	}

	if ( ! CHANNELS[ namespace ][ topic ] ) {
		debug( topic, 'no channel found to leave' );
		return false;
	}

	debug( topic, 'channel leave' );

	const channel = CHANNELS[ namespace ][ topic ].ref;
	store.dispatch( channelLeft( namespace, topic ) );
	channel.leave();
	delete CHANNELS[ namespace ][ topic ];

	return true;
}

export function updateChannel( { topic, namespace = DEFAULT_NAMESPACE } ) {
	if ( ! CHANNELS[ namespace ] ) {
		debug( topic, 'channel update missing namespace' );
		return;
	}

	if ( ! CHANNELS[ namespace ][ topic ] ) {
		debug( topic, 'channel update missing topic' );
		return;
	}

	CHANNELS[ namespace ][ topic ].updatedAt = moment().unix();
}

export function resetChannel() {
	CHANNELS = {};
}
