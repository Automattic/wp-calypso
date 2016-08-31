/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import buildConnection from 'lib/happychat/connection';
import {
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
} from 'state/action-types';

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

const connection = buildConnection();

const setChatConnecting = () => ( { type: HAPPYCHAT_CONNECTING } );
const setChatConnected = () => ( { type: HAPPYCHAT_CONNECTED } );
const setChatMessage = message => {
	if ( isEmpty( message ) ) {
		connection.notTyping();
	}
	return { type: HAPPYCHAT_SET_MESSAGE, message };
};

const clearChatMessage = () => setChatMessage( '' );

const receiveChatEvent = event => ( { type: HAPPYCHAT_RECEIVE_EVENT, event } );

const sendTyping = throttle( message => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

/**
 * Opens Happychat Socket.IO client connection.
 * @return {Thunk} Action thunk
 */
export const connectChat = () => ( dispatch, getState ) => {
	const { users, currentUser } = getState();
	const { id: user_id } = currentUser;
	const user = users.items[ user_id ];
	dispatch( setChatConnecting() );
	// create new session id and get signed identity data for authenticating
	startSession()
	.then( ( { session_id } ) => sign( { user, session_id } ) )
	.then( ( { jwt } ) => connection.open( user_id, jwt ) )
	.then(
		() => {
			dispatch( setChatConnected() );
			connection.on( 'message', ( event ) => {
				dispatch( receiveChatEvent( event ) );
			} );
		},
		e => debug( 'failed to start happychat session', e, e.stack )
	);
};

export const updateChatMessage = message => dispatch => {
	dispatch( setChatMessage( message ) );
	if ( ! isEmpty( message ) ) {
		sendTyping( message );
	}
};

export const sendChatMessage = message => dispatch => {
	debug( 'sending message', message );
	dispatch( clearChatMessage() );
	connection.send( message );
};
