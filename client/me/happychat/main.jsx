/** @format */

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
import config from 'config';
// actions
import {
	initConnection,
	sendMessage,
	sendNotTyping,
	sendTyping,
} from 'state/happychat/connection/actions';
import { setCurrentMessage } from 'state/happychat/ui/actions';
import { blur, focus } from 'state/happychat/ui/actions';
// selectors
import { getCurrentUser } from 'state/current-user/selectors';
import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import { getHappychatAuth } from 'state/happychat/utils';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';
import getHappychatTimeline from 'state/happychat/selectors/get-happychat-timeline';
import getCurrentMessage from 'state/happychat/selectors/get-happychat-current-message';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import isHappychatServerReachable from 'state/happychat/selectors/is-happychat-server-reachable';
import { canUserSendMessages } from 'state/happychat/selectors';
// components
import { HappychatConnection } from 'components/happychat/connection';
import { Composer } from 'components/happychat/composer';
import { Notices } from 'components/happychat/notices';
import { Timeline } from 'components/happychat/timeline';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	componentDidMount() {
		this.props.onFocused();
	}

	componentWillUnmount() {
		this.props.onBlurred();
	}

	render() {
		const {
			chatStatus,
			connectionStatus,
			currentUserEmail,
			disabled,
			getAuth,
			isConnectionUninitialized,
			isCurrentUser,
			isHappychatEnabled,
			isServerReachable,
			message,
			onInitConnection,
			onSendMessage,
			onSendNotTyping,
			onSendTyping,
			onSetCurrentMessage,
			timeline,
			translate,
		} = this.props;
		return (
			<div className="happychat__page" aria-live="polite" aria-relevant="additions">
				<HappychatConnection
					getAuth={ getAuth }
					onInitConnection={ onInitConnection }
					isHappychatEnabled={ isHappychatEnabled }
					isConnectionUninitialized={ isConnectionUninitialized }
				/>
				<Timeline
					currentUserEmail={ currentUserEmail }
					isCurrentUser={ isCurrentUser }
					timeline={ timeline }
					translate={ translate }
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
	getConfig: PropTypes.func,
	isConnectionEnabled: PropTypes.bool,
	isConnectionUninitialized: PropTypes.bool,
	isCurrentUser: PropTypes.func,
	isMinimizing: PropTypes.bool,
	isServerReachable: PropTypes.bool,
	message: PropTypes.string,
	onBlurred: PropTypes.func,
	onFocused: PropTypes.func,
	onInitConnection: PropTypes.func,
	onSendMessage: PropTypes.func,
	onSendNotTyping: PropTypes.func,
	onSendTyping: PropTypes.func,
	onSetCurrentMessage: PropTypes.func,
	timeline: PropTypes.array,
	translate: PropTypes.func,
};

const mapState = state => {
	const currentUser = getCurrentUser( state );
	return {
		chatStatus: getHappychatChatStatus( state ),
		connectionStatus: getHappychatConnectionStatus( state ),
		currentUserEmail: currentUser.email,
		disabled: ! canUserSendMessages( state ),
		getAuth: getHappychatAuth( state ),
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
	onFocused: focus,
	onInitConnection: initConnection,
	onSendMessage: sendMessage,
	onSendNotTyping: sendNotTyping,
	onSendTyping: sendTyping,
	onSetCurrentMessage: setCurrentMessage,
};

export default connect( mapState, mapDispatch )( localize( HappychatPage ) );
