/** @format */

/**
 * External dependencies
 */
import HappychatClientApi from 'happychat-client';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { setChatOpen, showPanel, hidePanel } from 'state/happychat/ui/actions';
import {
	setConnectionStatus,
	receiveStatus,
	receiveAccept,
} from 'state/happychat/connection/actions';
import { updateActivity } from 'state/happychat/chat/actions';
import {
	AUTH_TYPE_WPCOM_PROXY_IFRAME,
	ENTRY_CHAT,
	HAPPYCHAT_EVENT_CHAT_AVAILABILITY,
	HAPPYCHAT_EVENT_CHAT_LAST_ACTIVITY,
	HAPPYCHAT_EVENT_CHAT_PANEL_OPEN,
	HAPPYCHAT_EVENT_CHAT_STATUS,
	HAPPYCHAT_EVENT_CONNECTION_STATUS,
	LAYOUT_PANEL_MAX_PARENT_SIZE,
} from 'blocks/happychat/chat-client/constants';

export default ( {
	dispatch,
	skills,
	user,
	nodeId = 'happychat-client',
	layout = LAYOUT_PANEL_MAX_PARENT_SIZE,
	minimized = true,
} ) => {
	// configure and open happychat
	HappychatClientApi.open( {
		layout,
		minimized,
		nodeId,
		skills,
		user,
		authentication: {
			type: AUTH_TYPE_WPCOM_PROXY_IFRAME,
			options: {
				proxy: wpcom,
			},
		},
		entry: ENTRY_CHAT,
	} );

	// client events
	HappychatClientApi.on( HAPPYCHAT_EVENT_CHAT_AVAILABILITY, payload =>
		dispatch( receiveAccept( payload ) )
	);
	HappychatClientApi.on( HAPPYCHAT_EVENT_CHAT_LAST_ACTIVITY, () => dispatch( updateActivity() ) );
	HappychatClientApi.on( HAPPYCHAT_EVENT_CHAT_STATUS, status =>
		dispatch( receiveStatus( status ) )
	);
	HappychatClientApi.on( HAPPYCHAT_EVENT_CHAT_PANEL_OPEN, payload => {
		dispatch( setChatOpen( payload ) );
		if ( ! payload.isOpen ) {
			dispatch( showPanel() );
		} else {
			dispatch( hidePanel() );
		}
	} );
	HappychatClientApi.on( HAPPYCHAT_EVENT_CONNECTION_STATUS, payload =>
		dispatch( setConnectionStatus( payload ) )
	);

	// unload events
	window.unload = () => {
		HappychatClientApi.off( HAPPYCHAT_EVENT_CHAT_AVAILABILITY );
		HappychatClientApi.off( HAPPYCHAT_EVENT_CONNECTION_STATUS );
		HappychatClientApi.off( HAPPYCHAT_EVENT_CHAT_LAST_ACTIVITY );
		HappychatClientApi.off( HAPPYCHAT_EVENT_CHAT_STATUS );
		HappychatClientApi.off( HAPPYCHAT_EVENT_CHAT_PANEL_OPEN );
	};
};
