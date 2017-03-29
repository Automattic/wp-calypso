/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SEND_BROWSER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';
import { receiveChatTranscript } from './actions';
import { getHappychatTranscriptTimestamp } from './selectors';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

const sendTyping = throttle( ( connection, message ) => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

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

export default function( connection = null ) {
	// Allow a connection object to be specified for
	// testing. If blank, use a real connection.
	if ( connection == null ) {
		connection = require( './common' ).connection;
	}

	return store => next => action => {
		switch ( action.type ) {
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
		}
		return next( action );
	};
}
