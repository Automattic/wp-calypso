/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { isExternal } from 'client/lib/url';
// actions
import { sendMessage, sendNotTyping, sendTyping } from 'client/state/happychat/connection/actions';
import {
	blur,
	focus,
	closeChat,
	minimizeChat,
	minimizedChat,
	setCurrentMessage,
} from 'client/state/happychat/ui/actions';
// selectors
import canUserSendMessages from 'client/state/happychat/selectors/can-user-send-messages';
import { getCurrentUser } from 'client/state/current-user/selectors';
import getCurrentMessage from 'client/state/happychat/selectors/get-happychat-current-message';
import getHappychatChatStatus from 'client/state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'client/state/happychat/selectors/get-happychat-connection-status';
import getHappychatTimeline from 'client/state/happychat/selectors/get-happychat-timeline';
import isHappychatMinimizing from 'client/state/happychat/selectors/is-happychat-minimizing';
import isHappychatOpen from 'client/state/happychat/selectors/is-happychat-open';
import isHappychatServerReachable from 'client/state/happychat/selectors/is-happychat-server-reachable';
// UI components
import HappychatConnection from './connection-connected';
import { Title } from './title';
import { Composer } from './composer';
import { Notices } from './notices';
import { Timeline } from './timeline';

/*
 * Main chat UI component
 */
export class Happychat extends Component {
	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	// transform-class-properties syntax so this is bound within the function
	onCloseChatTitle = () => {
		const { onMinimizeChat, onMinimizedChat, onCloseChat } = this.props;
		onMinimizeChat();
		setTimeout( () => {
			onMinimizedChat();
			onCloseChat();
		}, 500 );
	};

	render() {
		const {
			chatStatus,
			connectionStatus,
			currentUserEmail,
			disabled,
			isChatOpen,
			isCurrentUser,
			isExternalUrl,
			isMinimizing,
			isServerReachable,
			message,
			onSendMessage,
			onSendNotTyping,
			onSendTyping,
			onSetCurrentMessage,
			timeline,
			translate,
			twemojiUrl,
		} = this.props;

		return (
			<div className="happychat">
				<HappychatConnection />
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing,
					} ) }
				>
					<Title onCloseChat={ this.onCloseChatTitle } translate={ translate } />
					<Timeline
						currentUserEmail={ currentUserEmail }
						isCurrentUser={ isCurrentUser }
						isExternalUrl={ isExternalUrl }
						timeline={ timeline }
						translate={ translate }
						twemojiUrl={ twemojiUrl }
					/>
					<Notices
						chatStatus={ chatStatus }
						connectionStatus={ connectionStatus }
						isServerReachable={ isServerReachable }
						translate={ translate }
					/>
					<Composer
						disabled={ disabled }
						message={ message }
						onSendMessage={ onSendMessage }
						onSendNotTyping={ onSendNotTyping }
						onSendTyping={ onSendTyping }
						onSetCurrentMessage={ onSetCurrentMessage }
						translate={ translate }
					/>
				</div>
			</div>
		);
	}
}

Happychat.propTypes = {
	chatStatus: PropTypes.string,
	connectionStatus: PropTypes.string,
	currentUserEmail: PropTypes.string,
	disabled: PropTypes.bool,
	isChatOpen: PropTypes.bool,
	isCurrentUser: PropTypes.func,
	isExternalUrl: PropTypes.func,
	isMinimizing: PropTypes.bool,
	isServerReachable: PropTypes.bool,
	message: PropTypes.string,
	onCloseChat: PropTypes.func,
	onMinimizeChat: PropTypes.func,
	onMinimizedChat: PropTypes.func,
	onSendMessage: PropTypes.func,
	onSendNotTyping: PropTypes.func,
	onSendTyping: PropTypes.func,
	onSetCurrentMessage: PropTypes.func,
	setBlurred: PropTypes.func,
	setFocused: PropTypes.func,
	timeline: PropTypes.array,
	translate: PropTypes.func,
	twemojiUrl: PropTypes.string,
};

const isMessageFromCurrentUser = currentUser => ( { user_id, source } ) => {
	return user_id.toString() === currentUser.ID.toString() && source === 'customer';
};

const mapState = state => {
	const currentUser = getCurrentUser( state );
	return {
		chatStatus: getHappychatChatStatus( state ),
		connectionStatus: getHappychatConnectionStatus( state ),
		currentUserEmail: currentUser.email,
		disabled: ! canUserSendMessages( state ),
		isChatOpen: isHappychatOpen( state ),
		isCurrentUser: isMessageFromCurrentUser( currentUser ), // see redux-no-bound-selectors eslint-rule
		isExternalUrl: isExternal,
		isMinimizing: isHappychatMinimizing( state ),
		isServerReachable: isHappychatServerReachable( state ),
		message: getCurrentMessage( state ),
		timeline: getHappychatTimeline( state ),
		twemojiUrl: config( 'twemoji_cdn_url' ),
	};
};

const mapDispatch = {
	onCloseChat: closeChat,
	onMinimizeChat: minimizeChat,
	onMinimizedChat: minimizedChat,
	onSendMessage: sendMessage,
	onSendNotTyping: sendNotTyping,
	onSendTyping: sendTyping,
	onSetCurrentMessage: setCurrentMessage,
	setBlurred: blur,
	setFocused: focus,
};

export default connect( mapState, mapDispatch )( localize( Happychat ) );
