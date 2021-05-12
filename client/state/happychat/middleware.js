/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_IO_INIT,
	HAPPYCHAT_IO_REQUEST_TRANSCRIPT,
	HAPPYCHAT_IO_SEND_MESSAGE_EVENT,
	HAPPYCHAT_IO_SEND_MESSAGE_LOG,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_IO_SEND_MESSAGE_USERINFO,
	HAPPYCHAT_IO_SEND_PREFERENCES,
	HAPPYCHAT_IO_SEND_TYPING,
	HAPPYCHAT_IO_SET_CUSTOM_FIELDS,
} from 'calypso/state/action-types';
import { sendEvent, setChatCustomFields } from 'calypso/state/happychat/connection/actions';
import buildConnection from 'calypso/lib/happychat/connection-async';
import isHappychatClientConnected from 'calypso/state/happychat/selectors/is-happychat-client-connected';
import isHappychatChatAssigned from 'calypso/state/happychat/selectors/is-happychat-chat-assigned';

const noop = () => {};
const eventMessage = {
	HAPPYCHAT_BLUR: 'Stopped looking at Happychat',
	HAPPYCHAT_FOCUS: 'Started looking at Happychat',
};

export const socketMiddleware = ( connection = null ) => {
	// Allow a connection object to be specified for
	// testing. If blank, use a real connection.
	if ( connection == null ) {
		connection = buildConnection();
	}

	return ( store ) => ( next ) => ( action ) => {
		const state = store.getState();

		switch ( action.type ) {
			case HAPPYCHAT_IO_INIT:
				connection.init( store.dispatch, action.auth );
				break;

			case HAPPYCHAT_IO_REQUEST_TRANSCRIPT:
				connection.request( action, action.timeout );
				break;

			case HAPPYCHAT_IO_SEND_MESSAGE_USERINFO:
				// When user info is sent, pass it through in a message...
				connection.send( action );
				// ... and also set a few of the values in Custom Fields
				store.dispatch(
					setChatCustomFields( {
						howCanWeHelp: get( action, 'payload.meta.howCanWeHelp', null ),
						howYouFeel: get( action, 'payload.meta.howYouFeel', null ),
					} )
				);
				break;

			case HAPPYCHAT_IO_SEND_MESSAGE_EVENT:
			case HAPPYCHAT_IO_SEND_MESSAGE_LOG:
			case HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE:
			case HAPPYCHAT_IO_SEND_PREFERENCES:
			case HAPPYCHAT_IO_SEND_TYPING:
			case HAPPYCHAT_IO_SET_CUSTOM_FIELDS:
				connection.send( action );
				break;

			case HAPPYCHAT_BLUR:
			case HAPPYCHAT_FOCUS:
				isHappychatClientConnected( state ) &&
				isHappychatChatAssigned( state ) &&
				eventMessage[ action.type ]
					? store.dispatch( sendEvent( eventMessage[ action.type ] ) )
					: noop;
				break;
		}

		return next( action );
	};
};

export default socketMiddleware();
