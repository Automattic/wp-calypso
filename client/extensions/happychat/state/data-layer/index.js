/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:extensions:happychat' );

/**
 * Internal dependencies
 */
import { addHandlers } from 'state/data-layer/extensions-middleware';
import {
	HAPPYCHAT_CONNECT,
	HAPPYCHAT_INITIALIZE,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SEND_USER_INFO,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
	HELP_CONTACT_FORM_SITE_SELECT,
	// sendEvent actions
	COMMENTS_CHANGE_STATUS,
	EXPORT_COMPLETE,
	EXPORT_FAILURE,
	EXPORT_STARTED,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	POST_SAVE_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	ROUTE_SET,
	SITE_SETTINGS_SAVE_SUCCESS,
	// end of sendEvent actions
} from 'state/action-types';
import connectChat from './connect-chat';
import connectIfRecentlyActive from './connect-if-recently-active';
import sendEvent from './send-event';
import getEventMessage from './send-event/message-events';
import sendInfo from './send-info';
import sendMessage from './send-message';
import sendTyping from './send-typing';
import setPreferences from './set-preferences';
import transcriptRequest from './transcript-request';

export default function installActionHandlers( connection = null ) {
	// Allow a connection object to be specified for
	// testing. If blank, use a real connection.
	if ( connection == null ) {
		connection = require( 'extensions/happychat/state/common' ).connection;
	}

	const handlers = {
		[ HAPPYCHAT_CONNECT ]: [ connectChat( connection ) ],
		[ HAPPYCHAT_INITIALIZE ]: [ connectIfRecentlyActive( connection ) ],
		[ HAPPYCHAT_SEND_MESSAGE ]: [ sendMessage( connection ) ],
		[ HAPPYCHAT_SEND_USER_INFO ]: [ sendInfo( connection ) ],
		[ HAPPYCHAT_SET_MESSAGE ]: [ sendTyping( connection ) ],
		[ HAPPYCHAT_TRANSCRIPT_REQUEST ]: [ transcriptRequest( connection ) ],
		[ HELP_CONTACT_FORM_SITE_SELECT ]: [ setPreferences( connection ) ],
		// sendEvent actions
		[ COMMENTS_CHANGE_STATUS ]: [ sendEvent( connection, getEventMessage ) ],
		[ EXPORT_COMPLETE ]: [ sendEvent( connection, getEventMessage ) ],
		[ EXPORT_FAILURE ]: [ sendEvent( connection, getEventMessage ) ],
		[ EXPORT_STARTED ]: [ sendEvent( connection, getEventMessage ) ],
		[ HAPPYCHAT_BLUR ]: [ sendEvent( connection, getEventMessage ) ],
		[ HAPPYCHAT_FOCUS ]: [ sendEvent( connection, getEventMessage ) ],
		[ POST_SAVE_SUCCESS ]: [ sendEvent( connection, getEventMessage ) ],
		[ PUBLICIZE_CONNECTION_CREATE ]: [ sendEvent( connection, getEventMessage ) ],
		[ PUBLICIZE_CONNECTION_DELETE ]: [ sendEvent( connection, getEventMessage ) ],
		[ ROUTE_SET ]: [ sendEvent( connection, getEventMessage ) ],
		[ SITE_SETTINGS_SAVE_SUCCESS ]: [ sendEvent( connection, getEventMessage ) ],
		// end of sendEvent actions
	};

	const added = addHandlers( 'happychat', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "happychat"' );
	}
}
