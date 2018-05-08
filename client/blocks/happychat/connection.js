/** @format */

/**
 * External dependencies
 */
import HappychatClientApi from 'happychat-client';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	AUTH_TYPE_WPCOM_PROXY_IFRAME,
	ENTRY_CHAT,
	LAYOUT_PANEL_MAX_PARENT_SIZE,
} from 'blocks/happychat/chat-client/constants';

export default ( {
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

	// events to be added
};
