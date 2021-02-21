/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { isOutsideCalypso } from 'calypso/lib/url';
// actions
import { sendMessage, sendNotTyping, sendTyping } from 'calypso/state/happychat/connection/actions';
import { blur, focus, setCurrentMessage } from 'calypso/state/happychat/ui/actions';
// selectors
import canUserSendMessages from 'calypso/state/happychat/selectors/can-user-send-messages';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCurrentMessage from 'calypso/state/happychat/selectors/get-happychat-current-message';
import getHappychatChatStatus from 'calypso/state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'calypso/state/happychat/selectors/get-happychat-connection-status';
import getHappychatTimeline from 'calypso/state/happychat/selectors/get-happychat-timeline';
import isHappychatServerReachable from 'calypso/state/happychat/selectors/is-happychat-server-reachable';
// UI components
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import { Composer } from 'calypso/components/happychat/composer';
import { Notices } from 'calypso/components/happychat/notices';
import { Timeline } from 'calypso/components/happychat/timeline';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	render() {
		const {
			chatStatus,
			connectionStatus,
			currentUserEmail,
			disabled,
			isCurrentUser,
			isExternalUrl,
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
			<div className="happychat__page" aria-live="polite" aria-relevant="additions">
				<HappychatConnection />
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
		);
	}
}

HappychatPage.propTypes = {
	chatStatus: PropTypes.string,
	connectionStatus: PropTypes.string,
	currentUserEmail: PropTypes.string,
	disabled: PropTypes.bool,
	isCurrentUser: PropTypes.func,
	isExternalUrl: PropTypes.func,
	isServerReachable: PropTypes.bool,
	message: PropTypes.string,
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

const isMessageFromCurrentUser = ( currentUser ) => ( { user_id, source } ) => {
	return user_id.toString() === currentUser.ID.toString() && source === 'customer';
};

const mapState = ( state ) => {
	const currentUser = getCurrentUser( state );
	return {
		chatStatus: getHappychatChatStatus( state ),
		connectionStatus: getHappychatConnectionStatus( state ),
		currentUserEmail: currentUser.email,
		disabled: ! canUserSendMessages( state ),
		isCurrentUser: isMessageFromCurrentUser( currentUser ), // see redux-no-bound-selectors eslint-rule
		isExternalUrl: isOutsideCalypso,
		isServerReachable: isHappychatServerReachable( state ),
		message: getCurrentMessage( state ),
		timeline: getHappychatTimeline( state ),
		twemojiUrl: config( 'twemoji_cdn_url' ),
	};
};

const mapDispatch = {
	onSendMessage: sendMessage,
	onSendNotTyping: sendNotTyping,
	onSendTyping: sendTyping,
	onSetCurrentMessage: setCurrentMessage,
	setBlurred: blur,
	setFocused: focus,
};

export default connect( mapState, mapDispatch )( localize( HappychatPage ) );
