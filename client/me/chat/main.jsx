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

// TODO: HAPPYCHAT_CLEANUP this is not used anymore, instead we use blocks/happychat/page, we keep it to make sure we
// have happychat-client parity, it should be removed when doing happychat cleanup.

// actions
import { sendMessage, sendNotTyping, sendTyping } from 'state/happychat/connection/actions';
import { blur, focus, setCurrentMessage } from 'state/happychat/ui/actions';
// selectors
import canUserSendMessages from 'state/happychat/selectors/can-user-send-messages';
import getCurrentMessage from 'state/happychat/selectors/get-happychat-current-message';
import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';
import isHappychatServerReachable from 'state/happychat/selectors/is-happychat-server-reachable';
// UI components
import HappychatConnection from 'components/happychat/connection-connected';
import { Composer } from 'components/happychat/composer';
import { Notices } from 'components/happychat/notices';

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
			disabled,
			isServerReachable,
			message,
			onSendMessage,
			onSendNotTyping,
			onSendTyping,
			onSetCurrentMessage,
			translate,
		} = this.props;

		return (
			<div className="chat happychat__page" aria-live="polite" aria-relevant="additions">
				<HappychatConnection />
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
	disabled: PropTypes.bool,
	isServerReachable: PropTypes.bool,
	message: PropTypes.string,
	onSendMessage: PropTypes.func,
	onSendNotTyping: PropTypes.func,
	onSendTyping: PropTypes.func,
	onSetCurrentMessage: PropTypes.func,
	setBlurred: PropTypes.func,
	setFocused: PropTypes.func,
	translate: PropTypes.func,
};

const mapState = state => {
	return {
		chatStatus: getHappychatChatStatus( state ),
		connectionStatus: getHappychatConnectionStatus( state ),
		disabled: ! canUserSendMessages( state ),
		isServerReachable: isHappychatServerReachable( state ),
		message: getCurrentMessage( state ),
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
