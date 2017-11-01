/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
// actions
import {
	initConnection,
	sendMessage,
	sendNotTyping,
	sendTyping,
} from 'state/happychat/connection/actions';
import { setCurrentMessage } from 'state/happychat/ui/actions';
import { blur, focus, closeChat, minimizeChat, minimizedChat } from 'state/happychat/ui/actions';
// selectors
import { getCurrentUser } from 'state/current-user/selectors';
import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import { getHappychatAuth } from 'state/happychat/utils';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';
import getHappychatTimeline from 'state/happychat/selectors/get-happychat-timeline';
import getCurrentMessage from 'state/happychat/selectors/get-happychat-current-message';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import isHappychatServerReachable from 'state/happychat/selectors/is-happychat-server-reachable';
import { canUserSendMessages } from 'state/happychat/selectors';
// components
import { Happychat } from './main';

const mapState = state => {
	const currentUser = getCurrentUser( state );
	return {
		chatStatus: getHappychatChatStatus( state ),
		connectionStatus: getHappychatConnectionStatus( state ),
		currentUserEmail: currentUser.email,
		disabled: ! canUserSendMessages( state ),
		getAuth: getHappychatAuth( state ),
		isChatOpen: isHappychatOpen( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
		isCurrentUser: ( { user_id, source } ) => {
			return user_id.toString() === currentUser.ID.toString() && source === 'customer';
		},
		isHappychatEnabled: config.isEnabled( 'happychat' ),
		isMinimizing: isHappychatMinimizing( state ),
		isServerReachable: isHappychatServerReachable( state ),
		message: getCurrentMessage( state ),
		timeline: getHappychatTimeline( state ),
	};
};

const mapDispatch = {
	onBlurred: blur,
	onCloseChat: closeChat,
	onFocused: focus,
	onInitConnection: initConnection,
	onMinimizeChat: minimizeChat,
	onMinimizedChat: minimizedChat,
	onSendMessage: sendMessage,
	onSendNotTyping: sendNotTyping,
	onSendTyping: sendTyping,
	onSetCurrentMessage: setCurrentMessage,
};

export default connect( mapState, mapDispatch )( localize( Happychat ) );
