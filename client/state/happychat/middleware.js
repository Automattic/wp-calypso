/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_TRANSCRIPT_REQUEST,
	ROUTE_SET,
} from 'state/action-types';
import { receiveChatTranscript } from './actions';
import {
	getHappychatTranscriptTimestamp,
	isHappychatClientConnected,
	isHappychatChatAssigned
} from './selectors';
import { getCurrentUser } from 'state/current-user/selectors';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

export const requestTranscript = ( connection, { getState, dispatch } ) => {
	const timestamp = getHappychatTranscriptTimestamp( getState() );
	debug( 'requesting transcript', timestamp );
	return connection.transcript( timestamp ).then(
		result => dispatch( receiveChatTranscript( result.messages, result.timestamp ) ),
		e => debug( 'failed to get transcript', e )
	);
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
