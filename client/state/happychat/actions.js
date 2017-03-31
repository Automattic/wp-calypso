/** IMPORTANT NOTE BEFORE EDITING THIS FILE **
 *
 * We're in the process of moving the side-effecting logic (anything to do with connection)
 * into Redux middleware. If you're implementing something new or changing something,
 * please consider moving any related side-effects into middleware.js.
 */

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SEND_BROWSER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';
import { getHappychatConnectionStatus } from './selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';

// This import will be deleted when the refactor is complete:
import { connection } from './common';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

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

export const requestChatTranscript = () => ( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );
export const receiveChatTranscript = ( messages, timestamp ) => ( {
	type: HAPPYCHAT_TRANSCRIPT_RECEIVE, messages, timestamp
} );

const setChatConnecting = () => ( { type: HAPPYCHAT_CONNECTING } );
const setChatConnected = () => ( { type: HAPPYCHAT_CONNECTED } );
const setChatDisconnected = () => ( { type: HAPPYCHAT_DISCONNECTED } );

const setHappychatAvailable = isAvailable => ( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable } );

export const setChatMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
export const clearChatMessage = () => setChatMessage( '' );

const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );

export const sendBrowserInfo = siteUrl => ( { type: HAPPYCHAT_SEND_BROWSER_INFO, siteUrl } );

/**
 * Opens Happychat Socket.IO client connection.
 * @return {Thunk} Action thunk
 */
export const connectChat = () => ( dispatch, getState ) => {
	const state = getState();
	const user = getCurrentUser( state );
	const locale = getCurrentUserLocale( state );

	debug( 'opening with chat locale', locale );

	// if chat is already connected then do nothing
	if ( getHappychatConnectionStatus( state ) === 'connected' ) {
		return;
	}
	dispatch( setChatConnecting() );
	// create new session id and get signed identity data for authenticating
	startSession()
	.then( ( { session_id } ) => sign( { user, session_id } ) )
	.then( ( { jwt } ) => connection.open( user.ID, jwt, locale ) )
	.then(
		() => {
			dispatch( setChatConnected() );
			dispatch( requestChatTranscript() );
			connection
			.on( 'connect', () => dispatch( setChatConnected() ) )
			.on( 'message', event => dispatch( receiveChatEvent( event ) ) )
			.on( 'status', status => dispatch( setHappychatChatStatus( status ) ) )
			.on( 'accept', accept => dispatch( setHappychatAvailable( accept ) ) )
			.on( 'disconnect', () => dispatch( setChatDisconnected() ) )
			.on( 'reconnecting', () => dispatch( setChatConnecting() ) );
		},
		e => debug( 'failed to start happychat session', e, e.stack )
	);
};

export const sendChatMessage = message => ( { type: HAPPYCHAT_SEND_MESSAGE, message } );
