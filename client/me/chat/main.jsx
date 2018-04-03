/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

// TODO: HAPPYCHAT_CLEANUP this is not used anymore, instead we use blocks/happychat/page, we keep it to make sure we
// have happychat-client parity, it should be removed when doing happychat cleanup.

import config from 'config';
import { isExternal } from 'lib/url';
// actions
import { sendMessage, sendNotTyping, sendTyping } from 'state/happychat/connection/actions';
import { blur, focus, setCurrentMessage } from 'state/happychat/ui/actions';
// selectors
import canUserSendMessages from 'state/happychat/selectors/can-user-send-messages';
import { getCurrentUser } from 'state/current-user/selectors';
import getCurrentMessage from 'state/happychat/selectors/get-happychat-current-message';
import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';
import getHappychatTimeline from 'state/happychat/selectors/get-happychat-timeline';
import isHappychatServerReachable from 'state/happychat/selectors/is-happychat-server-reachable';
// UI components
import HappychatConnection from 'components/happychat/connection-connected';
import { Composer } from 'components/happychat/composer';
import { Notices } from 'components/happychat/notices';
import { Timeline } from 'components/happychat/timeline';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	render() {
		return (
			<div className="chat chat__page" aria-live="polite" aria-relevant="additions">
				<Happychat layout={ LAYOUT_FULLSCREEN } />
			</div>
		);
	}
}

export default connect()( localize( HappychatPage ) );
