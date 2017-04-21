/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	HAPPYCHAT_CONNECT,
	HAPPYCHAT_INITIALIZE,
	HAPPYCHAT_SEND_BROWSER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
	ROUTE_SET,
} from 'state/action-types';
import {
	receiveChatEvent,
	receiveChatTranscript,
	requestChatTranscript,
	setConnected,
	setConnecting,
	setDisconnected,
	setHappychatAvailable,
	setHappychatChatStatus,
	setReconnecting,
} from './actions';
import {
	getHappychatTranscriptTimestamp,
	isHappychatConnectionUninitialized,
	wasHappychatRecentlyActive,
	isHappychatClientConnected,
	isHappychatChatAssigned
} from './selectors';
import {
	getCurrentUser,
	getCurrentUserLocale,
} from 'state/current-user/selectors';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

const sendTyping = throttle( ( connection, message ) => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

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
	path: '/happychat/session'
} );

export const connectChat = ( connection, { getState, dispatch } ) => {
	const state = getState();
	if ( ! isHappychatConnectionUninitialized( state ) ) {
		// If chat has already initialized, do nothing
		return;
	}

	const user = getCurrentUser( state );
	const locale = getCurrentUserLocale( state );

	// Notify that a new connection is being established
	dispatch( setConnecting() );

	debug( 'opening with chat locale', locale );

	// Before establishing a connection, set up connection handlers
	connection
		.on( 'connected', () => {
			dispatch( setConnected() );

			// TODO: There's no need to dispatch a separate action to request a transcript.
			// The HAPPYCHAT_CONNECTED action should have its own middleware handler that does this.
			dispatch( requestChatTranscript() );
		} )
		.on( 'disconnect', reason => dispatch( setDisconnected( reason ) ) )
		.on( 'reconnecting', () => dispatch( setReconnecting() ) )
		.on( 'message', event => dispatch( receiveChatEvent( event ) ) )
		.on( 'status', status => dispatch( setHappychatChatStatus( status ) ) )
		.on( 'accept', accept => dispatch( setHappychatAvailable( accept ) ) );

	// create new session id and get signed identity data for authenticating
	return startSession()
		.then( ( { session_id } ) => sign( { user, session_id } ) )
		.then( ( { jwt } ) => connection.open( user.ID, jwt, locale ) )
		.catch( e => debug( 'failed to start happychat session', e, e.stack ) );
};

export const requestTranscript = ( connection, { getState, dispatch } ) => {
	const timestamp = getHappychatTranscriptTimestamp( getState() );
	debug( 'requesting transcript', timestamp );
	return connection.transcript( timestamp ).then(
		result => dispatch( receiveChatTranscript( result.messages, result.timestamp ) ),
		e => debug( 'failed to get transcript', e )
	);
};

const onMessageChange = ( connection, message ) => {
	if ( isEmpty( message ) ) {
		connection.notTyping();
	} else {
		sendTyping( connection, message );
	}
};

const sendMessage = ( connection, message ) => {
	debug( 'sending message', message );
	connection.send( message );
	connection.notTyping();
};

const sendBrowserInfo = ( connection, siteUrl ) => {
	const siteHelp = `Site I need help with: ${ siteUrl }\n`;
	const screenRes = ( typeof screen === 'object' ) && `Screen Resolution: ${ screen.width }x${ screen.height }\n`;
	const browserSize = ( typeof window === 'object' ) && `Browser Size: ${ window.innerWidth }x${ window.innerHeight }\n`;
	const userAgent = ( typeof navigator === 'object' ) && `User Agent: ${ navigator.userAgent }`;
	const msg = {
		text: `Info\n ${ siteHelp } ${ screenRes } ${ browserSize } ${ userAgent }`,
	};

	debug( 'sending info message', msg );
	connection.info( msg );
};

export const connectIfRecentlyActive = ( connection, store ) => {
	if ( wasHappychatRecentlyActive( store.getState() ) ) {
		connectChat( connection, store );
	}
};

export const sendRouteSetEventMessage = ( connection, { getState }, action ) =>{
	const state = getState();
	const currentUser = getCurrentUser( state );
	if ( isHappychatClientConnected( state ) &&
		isHappychatChatAssigned( state ) ) {
		connection.sendEvent( `Looking at https://wordpress.com${ action.path }?support_user=${ currentUser.username }` );
	}
};

export default function( connection = null ) {
	// Allow a connection object to be specified for
	// testing. If blank, use a real connection.
	if ( connection == null ) {
		connection = require( './common' ).connection;
	}

	return store => next => action => {
		switch ( action.type ) {
			case HAPPYCHAT_CONNECT:
				connectChat( connection, store );
				break;

			case HAPPYCHAT_INITIALIZE:
				connectIfRecentlyActive( connection, store );
				break;

			case HAPPYCHAT_SEND_BROWSER_INFO:
				sendBrowserInfo( connection, action.siteUrl );
				break;

			case HAPPYCHAT_SEND_MESSAGE:
				sendMessage( connection, action.message );
				break;

			case HAPPYCHAT_SET_MESSAGE:
				onMessageChange( connection, action.message );
				break;

			case HAPPYCHAT_TRANSCRIPT_REQUEST:
				requestTranscript( connection, store );
				break;
			case ROUTE_SET:
				sendRouteSetEventMessage( connection, store, action );
				break;
		}
		return next( action );
	};
}
