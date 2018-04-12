/** @format */

/**
 * External dependencies
 */
import HappychatClientApi from 'happychat-client';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSkills from 'state/happychat/selectors/get-skills';
import {
	AUTH_TYPE_WPCOM_PROXY_IFRAME,
	ENTRY_CHAT,
	LAYOUT_PANEL_MAX_PARENT_SIZE,
} from 'blocks/happychat/chat-client/constants';

export default ( { state, dispatch }, {
	nodeId = 'happychat-client',
	layout = LAYOUT_PANEL_MAX_PARENT_SIZE,
	minimized = true,
	skills,
} ) => {
	// configure and open happychat
	HappychatClientApi.open( {
		authentication: {
			type: AUTH_TYPE_WPCOM_PROXY_IFRAME,
			options: {
				proxy: wpcom,
			},
		},
		entry: ENTRY_CHAT,
		layout,
		minimized,
		nodeId,
		skills: skills || getSkills( state, getSelectedSiteId( state ) ),
		user: getCurrentUser( state ),
	} );

	// events to be added
};
