/**
 * Internal dependencies
 */
import {
	LASAGNA_CHANNEL_JOINED,
	LASAGNA_CHANNEL_JOIN_ERROR,
	LASAGNA_CHANNEL_LEFT,
	LASAGNA_SOCKET_CONNECT,
	LASAGNA_SOCKET_CONNECT_ERROR,
	LASAGNA_SOCKET_DISCONNECT,
	LASAGNA_SOCKET_CLOSED,
	LASAGNA_SOCKET_DISCONNECTED,
	LASAGNA_SOCKET_CONNECTED,
} from './action-types';

export const socketConnect = () => ( { type: LASAGNA_SOCKET_CONNECT } );
export const socketConnectError = () => ( { type: LASAGNA_SOCKET_CONNECT_ERROR } );
export const socketClosed = () => ( { type: LASAGNA_SOCKET_CLOSED } );
export const socketDisconnect = () => ( { type: LASAGNA_SOCKET_DISCONNECT } );
export const socketConnected = () => ( { type: LASAGNA_SOCKET_CONNECTED } );
export const socketDisconnected = () => ( { type: LASAGNA_SOCKET_DISCONNECTED } );

export const channelJoined = ( namespace, topic ) => ( {
	type: LASAGNA_CHANNEL_JOINED,
	namespace,
	topic,
} );
export const channelJoinError = ( namespace, topic, reason ) => ( {
	type: LASAGNA_CHANNEL_JOIN_ERROR,
	namespace,
	topic,
	reason,
} );
export const channelLeft = ( namespace, topic ) => ( {
	type: LASAGNA_CHANNEL_LEFT,
	namespace,
	topic,
} );
