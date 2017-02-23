/**
 * External Dependencies
 */
import { throttle, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_CONNECTION_OPEN,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	CURRENT_USER_ID_SET
} from 'state/action-types';
import wpcom from 'lib/wp';
import { updateChatMessage } from 'state/happychat/actions';
import {
	isHappychatChatActive,
	getHappychatConnectionStatus,
	getHappychatTranscriptTimestamp
} from 'state/happychat/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

import buildConnection from 'lib/happychat/connection';

const connection = buildConnection();

const debug = require( 'debug' )( 'calypso:happychat:middleware' );

// Promise based interface for wpcom.request
const request = ( ... args ) => new Promise( ( resolve, reject ) => {
	wpcom.request( ... args, ( error, response ) => {
		if ( error ) {
			return reject( error );
		}
		resolve( response );
	} );
} );

const sign = ( payload ) => request( {
	method: 'POST',
	path: '/jwt/sign',
	body: { payload: JSON.stringify( payload ) }
} );

const startSession = () => request( {
	method: 'POST',
	path: '/happychat/session' }
);

const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS, status
} );

const setHappychatAvailable = isAvailable => ( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable } );

const actionOfType = type => () => ( { type } );

const setChatConnecting = actionOfType( HAPPYCHAT_CONNECTING );
const setChatConnected = actionOfType( HAPPYCHAT_CONNECTED );
const setChatDisconnected = actionOfType( HAPPYCHAT_DISCONNECTED );

const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );

const connectChat = ( { dispatch, getState } ) => {
	const state = getState();
	const user = getCurrentUser( state );
	const connectionStatus = getHappychatConnectionStatus( state );

	// if chat is already connected then do nothing
	if ( connectionStatus !== 'disconnected' ) {
		debug( 'chat already initialized' );
		return;
	}
	debug( 'opening happychat for user', user, connectionStatus );

	dispatch( setChatConnecting() );
	// create new session id and get signed identity data for authenticating
	connection
	.on( 'connect', () => {
		debug( 'set connected!' );
		dispatch( setChatConnected() );
	} )
	.on( 'reconnect', () => dispatch( setChatConnecting() ) )
	.on( 'disconnect', () => dispatch( setChatDisconnected() ) )
	.on( 'message', event => dispatch( receiveChatEvent( event ) ) )
	.on( 'status', status => {
		debug( 'set chat status', status );
		dispatch( setHappychatChatStatus( status ) );
	} )
	.on( 'accept', isAvailable => dispatch( setHappychatAvailable( isAvailable ) ) );

	debug( 'opening chat session', connection );

	startSession()
	.then( ( { session_id } ) => sign( { user, session_id } ) )
	.then( ( { jwt } ) => connection.open( user.ID, jwt ) )
	.then(
		() => debug( 'socket connection opened' ),
		e => debug( 'failed to start happychat session', e, e.stack )
	);
};

const sendTyping = throttle( message => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

const onMessageChange = ( store, message ) => {
	if ( ! isEmpty( message ) ) {
		sendTyping( message );
	} else {
		connection.notTyping();
	}
};

const sendMessage = ( { dispatch }, message ) => {
	dispatch( updateChatMessage( '' ) );
	connection.send( message );
};

const receiveChatTranscript = ( messages, timestamp ) => ( {
	type: HAPPYCHAT_TRANSCRIPT_RECEIVE, messages, timestamp
} );

const requestTranscript = ( { getState, dispatch } ) => {
	const timestamp = getHappychatTranscriptTimestamp( getState() );
	connection.transcript( timestamp ).then(
		result => dispatch( receiveChatTranscript( result.messages, result.timestamp ) ),
		e => debug( 'failed to get transcript', e )
	);
};

export default ( store ) => {
	return next => action => {
		switch ( action.type ) {
			case CURRENT_USER_ID_SET:
				if ( isHappychatChatActive( store.getState() ) ) {
					connectChat( store );
				}
			case HAPPYCHAT_CONNECTION_OPEN:
				connectChat( store );
				break;
			case HAPPYCHAT_SET_MESSAGE:
				onMessageChange( store, action.message );
				break;
			case HAPPYCHAT_SEND_MESSAGE:
				sendMessage( store, action.message );
				break;
			case HAPPYCHAT_TRANSCRIPT_REQUEST:
				requestTranscript( store );
				break;
		}
		return next( action );
	};
};
